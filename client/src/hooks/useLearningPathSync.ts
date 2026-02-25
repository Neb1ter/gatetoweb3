import { useEffect } from "react";
import { useLocation } from "wouter";

const LEARNING_PATH_KEY = "web3_learning_path";

/**
 * When user visits a page that matches a step in their learning path,
 * mark that step as completed so progress stays in sync.
 */
export function useLearningPathSync() {
  const [location] = useLocation();

  useEffect(() => {
    const path = typeof location === "string" ? location : "";
    if (!path) return;
    try {
      const raw = localStorage.getItem(LEARNING_PATH_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      const { steps, completedSteps } = data;
      if (!Array.isArray(steps) || !Array.isArray(completedSteps)) return;

      const currentPath = path.split("?")[0];
      let updated = false;
      const newCompleted = [...completedSteps];

      for (const step of steps) {
        if (!step || newCompleted.includes(step.id)) continue;
        const stepPath = (step.path || "").split("?")[0];
        const matches =
          currentPath === stepPath ||
          (stepPath && currentPath.startsWith(stepPath + "/"));
        if (matches) {
          newCompleted.push(step.id);
          updated = true;
        }
      }

      if (updated) {
        const next = { ...data, completedSteps: newCompleted };
        localStorage.setItem(LEARNING_PATH_KEY, JSON.stringify(next));
        window.dispatchEvent(new Event("storage"));
      }
    } catch {
      // ignore
    }
  }, [location]);
}
