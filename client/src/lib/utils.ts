import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createElement, Fragment, type ReactNode } from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Renders markdown-style bold (**text**) as React elements instead of
 * using dangerouslySetInnerHTML. Only processes bold syntax; all other
 * content is treated as plain text (safe against XSS).
 */
export function renderBoldText(text: string, boldClassName = "text-white"): ReactNode {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return createElement(
    Fragment,
    null,
    ...parts.map((part, i) =>
      i % 2 === 1
        ? createElement("strong", { key: i, className: boldClassName }, part)
        : part
    )
  );
}
