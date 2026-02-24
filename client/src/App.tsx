import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Portal from "./pages/Portal";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Exchanges from "./pages/Exchanges";
import Beginner from "./pages/Beginner";
import CryptoIntro from "./pages/CryptoIntro";
import CryptoNews from "./pages/CryptoNews";
import Web3Guide from "./pages/Web3Guide";
import WhatIsWeb3 from "./pages/web3/WhatIsWeb3";
import BlockchainBasics from "./pages/web3/BlockchainBasics";
import WalletKeys from "./pages/web3/WalletKeys";
import DefiDeep from "./pages/web3/DefiDeep";
import ExchangeGuideDeep from "./pages/web3/ExchangeGuide";
import InvestmentGateway from "./pages/web3/InvestmentGateway";
import EconomicOpportunity from "@/pages/web3/EconomicOpportunity";
import ExchangeGuideIndex from "@/pages/ExchangeGuideIndex";
import ExchangeDownload from "@/pages/ExchangeDownload";
import ExchangeFeatureDetail from "@/pages/ExchangeFeatureDetail";
import SpotSim from "@/pages/sim/SpotSim";
import FuturesSim from "@/pages/sim/FuturesSim";
import TradFiSim from "@/pages/sim/TradFiSim";
import MarginSim from "@/pages/sim/MarginSim";
import OptionsSim from "@/pages/sim/OptionsSim";
import BotSim from "@/pages/sim/BotSim";
import { useEffect, useRef, useState } from "react";
import { saveScrollPosition, getScrollPosition } from "@/hooks/useScrollMemory";

// ============================================================
// 页面过渡动画包装器
// ============================================================
function PageTransition({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState<"enter" | "exit">("enter");
   const prevLocation = useRef(location);
  useEffect(() => {
    if (location !== prevLocation.current) {
      // 离开前保存当前页面的滚动位置
      saveScrollPosition(prevLocation.current);
      // 触发退出动画
      setTransitionStage("exit");
      const timer = setTimeout(() => {
        const nextLocation = location;
        prevLocation.current = nextLocation;
        setDisplayLocation(nextLocation);
        setTransitionStage("enter");
        // 新页面渲染后：有记录则恢复，无记录则滚顶
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const saved = getScrollPosition(nextLocation);
            if (saved !== null) {
              window.scrollTo({ top: saved, behavior: "instant" });
            } else {
              window.scrollTo({ top: 0, behavior: "instant" });
            }
          });
        });
      }, 280);
      return () => clearTimeout(timer);
    }
  }, [location]);

  return (
    <div
      style={{
        opacity: transitionStage === "exit" ? 0 : 1,
        transition: transitionStage === "exit"
          ? "opacity 0.2s ease"
          : "opacity 0.3s ease 0.05s",
      }}
    >
      {children}
    </div>
  );
}

function Router() {
  return (
    <PageTransition>
      <Switch>
        {/* 总主页（导航门户）*/}
        <Route path={"/"} component={Portal} />
        <Route path={"/portal"} component={Portal} />

        {/* 币圈省钱指南板块 */}
        <Route path={"/crypto-saving"} component={Home} />
        <Route path={"/contact"} component={Contact} />
        <Route path={"/exchanges"} component={Exchanges} />
        <Route path={"/beginner"} component={Beginner} />
        <Route path={"/crypto-intro"} component={CryptoIntro} />
        <Route path={"/crypto-news"} component={CryptoNews} />

        {/* Web3 入圈指南板块 */}
        <Route path={"/web3-guide"} component={Web3Guide} />
        <Route path={"/web3-guide/what-is-web3"} component={WhatIsWeb3} />
        <Route path={"/web3-guide/blockchain-basics"} component={BlockchainBasics} />
        <Route path={"/web3-guide/wallet-keys"} component={WalletKeys} />
        <Route path={"/web3-guide/defi-deep"} component={DefiDeep} />
        <Route path={"/web3-guide/exchange-guide"} component={ExchangeGuideDeep} />
        <Route path={"/web3-guide/investment-gateway"} component={InvestmentGateway} />
        <Route path="/web3-guide/economic-opportunity" component={EconomicOpportunity} />
        <Route path="/exchange-guide" component={ExchangeGuideIndex} />
        <Route path="/exchange-download" component={ExchangeDownload} />
         <Route path="/exchange-guide/:featureSlug" component={ExchangeFeatureDetail} />

        {/* 模拟交易游戏 */}
        <Route path="/sim/spot" component={SpotSim} />
        <Route path="/sim/futures" component={FuturesSim} />
        <Route path="/sim/tradfi" component={TradFiSim} />
        <Route path="/sim/margin" component={MarginSim} />
        <Route path="/sim/options" component={OptionsSim} />
        <Route path="/sim/bot" component={BotSim} />

        <Route path={"404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </PageTransition>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider defaultTheme="dark">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
