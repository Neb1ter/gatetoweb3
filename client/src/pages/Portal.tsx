import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";

// ============================================================
// 多语言文案
// ============================================================
const LANG = {
  zh: {
    badge: "数字经济时代的导航中心",
    h1a: "探索",
    h1b: " Web3 ",
    h1c: "世界",
    h1sub: "从入门到精通的完整路径",
    desc: "无论你是刚听说比特币的新人，还是想节省交易手续费的老手，这里都有适合你的内容。",
    stat1v: "2", stat1u: "大板块", stat1l: "内容模块",
    stat2v: "5+", stat2u: "家交易所", stat2l: "合作平台",
    stat3v: "永久", stat3u: "个性化返佣", stat3l: "终身有效",
    bannerLabel: "合作平台",
    sectionTitle: "选择你的学习路径",
    sectionSub: "两大核心板块，满足不同阶段的需求",
    comingSoonBadge: "即将推出",
    comingSoonTitle: "更多板块正在建设中",
    lockLabel: "敬请期待",
    footerCopy: "© 2026 Web3 导航中心 · 为全球用户提供最优质的 Web3 入门内容",
    footerDisclaimer: "内容仅供参考，不构成投资建议。投资有风险，入市需谨慎。",
    contactUs: "联系我们",
    langBtn: "EN",
    modules: [
      {
        badge: "NEW",
        subtitle: "WEB3 ONBOARDING",
        title: "Web3 入圈指南",
        description: "从零开始了解区块链、DeFi 与 Web3 世界。探索去中心化金融的无限可能，把握数字经济时代的历史机遇。",
        tags: ["区块链基础", "DeFi 入门", "投资路径", "CEX vs DEX"],
        cta: "开始探索 Web3 →",
        stats: [{ label: "核心概念", value: "12+" }, { label: "投资方式", value: "4种" }, { label: "适合人群", value: "零基础" }],
      },
      {
        badge: "HOT",
        subtitle: "CRYPTO SAVING GUIDE",
        title: "币圈省钱指南",
        description: "通过邀请码返佣机制，在 OKX、Binance、Gate.io 等主流交易所享受个性化永久手续费减免，让每一笔交易都更划算。",
        tags: ["邀请码返佣", "手续费对比", "交易所评测", "新手注册"],
        cta: "查看省钱攻略 →",
        stats: [{ label: "合作交易所", value: "5家" }, { label: "永久返佣", value: "个性化" }, { label: "已服务用户", value: "持续增长" }],
      },
    ],
    comingSoon: [
      { icon: "📊", title: "量化策略指南", desc: "自动化交易策略与量化工具介绍" },
      { icon: "🔐", title: "Web3 安全手册", desc: "钱包安全、防骗指南与资产保护" },
      { icon: "🌐", title: "NFT 与元宇宙", desc: "数字资产、NFT 投资与元宇宙入门" },
    ],
  },
  en: {
    badge: "Your Web3 Navigation Hub",
    h1a: "Explore the",
    h1b: " Web3 ",
    h1c: "World",
    h1sub: "A Complete Path from Beginner to Expert",
    desc: "Whether you're new to Bitcoin or a seasoned trader looking to cut fees, we have the right content for you.",
    stat1v: "2", stat1u: "Modules", stat1l: "Content Areas",
    stat2v: "5+", stat2u: "Exchanges", stat2l: "Partners",
    stat3v: "Lifetime", stat3u: "Personalized Rebates", stat3l: "Forever Valid",
    bannerLabel: "Partners",
    sectionTitle: "Choose Your Learning Path",
    sectionSub: "Two core modules for every stage of your journey",
    comingSoonBadge: "Coming Soon",
    comingSoonTitle: "More Modules Under Construction",
    lockLabel: "Stay Tuned",
    footerCopy: "© 2026 Web3 Navigation Hub · Premium Web3 content for global users",
    footerDisclaimer: "Content is for reference only and does not constitute investment advice. Invest responsibly.",
    contactUs: "Contact Us",
    langBtn: "中文",
    modules: [
      {
        badge: "NEW",
        subtitle: "WEB3 ONBOARDING",
        title: "Web3 Onboarding Guide",
        description: "Learn blockchain, DeFi, and the Web3 world from scratch. Explore the limitless possibilities of decentralized finance.",
        tags: ["Blockchain Basics", "DeFi Intro", "Investment Paths", "CEX vs DEX"],
        cta: "Start Exploring Web3 →",
        stats: [{ label: "Core Concepts", value: "12+" }, { label: "Invest Methods", value: "4" }, { label: "For", value: "Beginners" }],
      },
      {
        badge: "HOT",
        subtitle: "CRYPTO SAVING GUIDE",
        title: "Crypto Saving Guide",
        description: "Enjoy personalized lifetime fee rebates on OKX, Binance, Gate.io and more through our referral program.",
        tags: ["Referral Rebates", "Fee Comparison", "Exchange Reviews", "Beginner Sign-up"],
        cta: "View Saving Tips →",
        stats: [{ label: "Partner Exchanges", value: "5+" }, { label: "Lifetime Rebates", value: "Custom" }, { label: "Users Served", value: "Growing" }],
      },
    ],
    comingSoon: [
      { icon: "📊", title: "Quant Strategy Guide", desc: "Automated trading strategies and quant tools" },
      { icon: "🔐", title: "Web3 Security Manual", desc: "Wallet safety, scam prevention, and asset protection" },
      { icon: "🌐", title: "NFT & Metaverse", desc: "Digital assets, NFT investing, and metaverse intro" },
    ],
  },
};

// ============================================================
// 交易所 / DEX Logo 数据（纯 SVG 文字 + 图形，黑色调）
// ============================================================
const PLATFORM_LOGOS = [
  // CEX
  {
    name: "Binance",
    svg: (
      <svg viewBox="0 0 120 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-auto">
        <path d="M8 16L12 12L16 16L12 20Z" fill="currentColor" opacity="0.9"/>
        <path d="M16 8L20 12L16 16L12 12Z" fill="currentColor" opacity="0.7"/>
        <path d="M0 16L4 12L8 16L4 20Z" fill="currentColor" opacity="0.7"/>
        <path d="M16 24L20 20L24 24L20 28Z" fill="currentColor" opacity="0.7"/>
        <path d="M8 24L12 20L16 24L12 28Z" fill="currentColor" opacity="0.7"/>
        <path d="M16 16L20 12L24 16L20 20Z" fill="currentColor" opacity="0.9"/>
        <text x="30" y="21" fill="currentColor" fontSize="14" fontWeight="700" fontFamily="Arial,sans-serif" letterSpacing="0.5">BINANCE</text>
      </svg>
    ),
  },
  {
    name: "OKX",
    svg: (
      <svg viewBox="0 0 80 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-auto">
        <rect x="2" y="2" width="10" height="10" rx="1" fill="currentColor" opacity="0.9"/>
        <rect x="14" y="2" width="10" height="10" rx="1" fill="currentColor" opacity="0.9"/>
        <rect x="8" y="14" width="10" height="10" rx="1" fill="currentColor" opacity="0.9"/>
        <rect x="20" y="14" width="10" height="10" rx="1" fill="currentColor" opacity="0.9"/>
        <text x="36" y="21" fill="currentColor" fontSize="14" fontWeight="700" fontFamily="Arial,sans-serif" letterSpacing="0.5">OKX</text>
      </svg>
    ),
  },
  {
    name: "Bybit",
    svg: (
      <svg viewBox="0 0 90 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-auto">
        <rect x="2" y="6" width="4" height="20" rx="2" fill="currentColor" opacity="0.9"/>
        <rect x="2" y="6" width="14" height="8" rx="2" fill="currentColor" opacity="0.7"/>
        <rect x="2" y="18" width="14" height="8" rx="2" fill="currentColor" opacity="0.7"/>
        <text x="22" y="21" fill="currentColor" fontSize="14" fontWeight="700" fontFamily="Arial,sans-serif" letterSpacing="0.5">BYBIT</text>
      </svg>
    ),
  },
  {
    name: "Gate.io",
    svg: (
      <svg viewBox="0 0 100 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-auto">
        <circle cx="14" cy="16" r="12" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.9"/>
        <path d="M14 16 H22 M14 10 A6 6 0 0 1 20 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.9"/>
        <text x="32" y="21" fill="currentColor" fontSize="14" fontWeight="700" fontFamily="Arial,sans-serif" letterSpacing="0.5">Gate.io</text>
      </svg>
    ),
  },
  {
    name: "Bitget",
    svg: (
      <svg viewBox="0 0 100 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-auto">
        <path d="M4 24 L12 8 L20 24 Z" fill="currentColor" opacity="0.9"/>
        <path d="M10 24 L18 8 L26 24 Z" fill="currentColor" opacity="0.5"/>
        <text x="32" y="21" fill="currentColor" fontSize="14" fontWeight="700" fontFamily="Arial,sans-serif" letterSpacing="0.5">BITGET</text>
      </svg>
    ),
  },
  {
    name: "HTX",
    svg: (
      <svg viewBox="0 0 80 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-auto">
        <path d="M4 8 L4 24 M4 16 L14 16 M14 8 L14 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.9"/>
        <text x="22" y="21" fill="currentColor" fontSize="14" fontWeight="700" fontFamily="Arial,sans-serif" letterSpacing="0.5">HTX</text>
      </svg>
    ),
  },
  // DEX
  {
    name: "Uniswap",
    svg: (
      <svg viewBox="0 0 110 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-auto">
        <circle cx="10" cy="10" r="5" fill="currentColor" opacity="0.9"/>
        <circle cx="22" cy="22" r="5" fill="currentColor" opacity="0.6"/>
        <path d="M10 10 Q16 4 22 22" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.8"/>
        <text x="32" y="21" fill="currentColor" fontSize="14" fontWeight="700" fontFamily="Arial,sans-serif" letterSpacing="0.5">UNISWAP</text>
      </svg>
    ),
  },
  {
    name: "dYdX",
    svg: (
      <svg viewBox="0 0 80 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-auto">
        <path d="M4 8 L14 24 M14 8 L4 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.9"/>
        <path d="M18 8 L28 24 M28 8 L18 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
        <text x="34" y="21" fill="currentColor" fontSize="14" fontWeight="700" fontFamily="Arial,sans-serif" letterSpacing="0.5">dYdX</text>
      </svg>
    ),
  },
  {
    name: "PancakeSwap",
    svg: (
      <svg viewBox="0 0 140 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-auto">
        <ellipse cx="14" cy="18" rx="12" ry="6" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.9"/>
        <ellipse cx="14" cy="14" rx="10" ry="5" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.7"/>
        <ellipse cx="14" cy="10" rx="8" ry="4" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5"/>
        <text x="32" y="21" fill="currentColor" fontSize="13" fontWeight="700" fontFamily="Arial,sans-serif" letterSpacing="0.3">PANCAKESWAP</text>
      </svg>
    ),
  },
  {
    name: "Curve",
    svg: (
      <svg viewBox="0 0 90 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-auto">
        <path d="M4 24 Q8 4 16 16 Q24 28 28 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.9"/>
        <text x="36" y="21" fill="currentColor" fontSize="14" fontWeight="700" fontFamily="Arial,sans-serif" letterSpacing="0.5">CURVE</text>
      </svg>
    ),
  },
  {
    name: "Aave",
    svg: (
      <svg viewBox="0 0 80 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-auto">
        <path d="M14 6 L24 26 M14 6 L4 26 M8 18 L20 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.9"/>
        <text x="30" y="21" fill="currentColor" fontSize="14" fontWeight="700" fontFamily="Arial,sans-serif" letterSpacing="0.5">AAVE</text>
      </svg>
    ),
  },
  {
    name: "1inch",
    svg: (
      <svg viewBox="0 0 80 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-auto">
        <path d="M14 6 C6 10 6 22 14 26 C22 22 22 10 14 6Z" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.9"/>
        <path d="M14 6 L14 26" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
        <text x="28" y="21" fill="currentColor" fontSize="14" fontWeight="700" fontFamily="Arial,sans-serif" letterSpacing="0.5">1INCH</text>
      </svg>
    ),
  },
];

// 复制一份用于无缝滚动
const ALL_LOGOS = [...PLATFORM_LOGOS, ...PLATFORM_LOGOS];

// ============================================================
// 背景动画：流动网格 + 光球 + 粒子
// ============================================================
function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // 粒子
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5,
      color: Math.random() > 0.6 ? "#FFD700" : Math.random() > 0.5 ? "#6EE7B7" : "#60A5FA",
      alpha: Math.random() * 0.5 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.008;

      // 流动网格线
      const gridSize = 80;
      ctx.strokeStyle = "rgba(255,215,0,0.04)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // 流动光线（斜向）
      for (let i = 0; i < 3; i++) {
        const progress = ((t * 0.3 + i * 0.33) % 1);
        const x = progress * (canvas.width + 400) - 200;
        const grad = ctx.createLinearGradient(x - 100, 0, x + 100, canvas.height);
        grad.addColorStop(0, "transparent");
        grad.addColorStop(0.5, `rgba(${i === 0 ? "255,215,0" : i === 1 ? "110,231,183" : "96,165,250"},0.04)`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(x - 100, 0, 200, canvas.height);
      }

      // 粒子
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, "0");
        ctx.fill();
      });

      // 粒子连线
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255,215,0,${0.06 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // 脉冲圆环
      for (let i = 0; i < 2; i++) {
        const phase = (t * 0.5 + i * 0.5) % 1;
        const cx = i === 0 ? canvas.width * 0.25 : canvas.width * 0.75;
        const cy = i === 0 ? canvas.height * 0.3 : canvas.height * 0.7;
        const maxR = 200;
        ctx.beginPath();
        ctx.arc(cx, cy, phase * maxR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${i === 0 ? "110,231,183" : "255,215,0"},${0.08 * (1 - phase)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.8 }}
    />
  );
}

// ============================================================
// Logo 滚动横幅
// ============================================================
function LogoMarquee({ label }: { label: string }) {
  return (
    <div className="w-full overflow-hidden py-4">
      {/* 标签 */}
      <div className="text-center mb-4">
        <span className="text-slate-600 text-xs tracking-[0.2em] uppercase font-medium">{label}</span>
      </div>

      {/* 渐变遮罩 */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, #050D1A, transparent)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, #050D1A, transparent)" }} />

        {/* 滚动轨道 */}
        <div className="flex overflow-hidden">
          <div
            className="flex items-center gap-10 sm:gap-14 flex-shrink-0"
            style={{
              animation: "marquee 30s linear infinite",
              willChange: "transform",
            }}
          >
            {ALL_LOGOS.map((logo, i) => (
              <div
                key={i}
                className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors duration-300"
                style={{ opacity: 0.55 }}
                title={logo.name}
              >
                {logo.svg}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

// ============================================================
// 主组件
// ============================================================
const moduleColors = [
  {
    accentColor: "from-emerald-500/20 to-teal-500/10",
    borderColor: "border-emerald-500/30 hover:border-emerald-400/60",
    titleColor: "text-emerald-400",
    badgeColor: "bg-emerald-500",
    ctaColor: "bg-emerald-500 hover:bg-emerald-400",
    href: "/web3-guide",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="28" stroke="#6EE7B7" strokeWidth="2" opacity="0.3"/>
        <circle cx="32" cy="32" r="18" stroke="#6EE7B7" strokeWidth="2" opacity="0.5"/>
        <circle cx="32" cy="32" r="8" fill="#6EE7B7" opacity="0.8"/>
        <path d="M32 4 L32 60 M4 32 L60 32" stroke="#6EE7B7" strokeWidth="1.5" opacity="0.4"/>
        <path d="M12 12 L52 52 M52 12 L12 52" stroke="#6EE7B7" strokeWidth="1" opacity="0.25"/>
        <circle cx="32" cy="4" r="3" fill="#6EE7B7"/>
        <circle cx="32" cy="60" r="3" fill="#6EE7B7"/>
        <circle cx="4" cy="32" r="3" fill="#6EE7B7"/>
        <circle cx="60" cy="32" r="3" fill="#6EE7B7"/>
      </svg>
    ),
  },
  {
    accentColor: "from-yellow-500/20 to-amber-500/10",
    borderColor: "border-yellow-500/30 hover:border-yellow-400/60",
    titleColor: "text-yellow-400",
    badgeColor: "bg-yellow-500",
    ctaColor: "bg-yellow-500 hover:bg-yellow-400 text-black",
    href: "/crypto-saving",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="28" stroke="#FFD700" strokeWidth="2" opacity="0.3"/>
        <path d="M32 14 L36 26 L50 26 L39 34 L43 46 L32 38 L21 46 L25 34 L14 26 L28 26 Z" fill="#FFD700" opacity="0.8"/>
        <circle cx="32" cy="32" r="6" fill="#0A192F"/>
        <text x="32" y="36" textAnchor="middle" fill="#FFD700" fontSize="8" fontWeight="bold">$</text>
      </svg>
    ),
  },
];

export default function Portal() {
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<"zh" | "en">("zh");
  const t = LANG[lang];

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#050D1A] text-white relative overflow-hidden">
      {/* Canvas 背景动画 */}
      <AnimatedBackground />

      {/* 背景光晕 */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-600/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* 中英切换按钮（右上角固定） */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setLang(lang === "zh" ? "en" : "zh")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-600/60 bg-slate-900/80 backdrop-blur-sm text-slate-300 hover:text-white hover:border-slate-400 transition-all text-xs font-medium"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          {t.langBtn}
        </button>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ===== Hero 区域 ===== */}
        <div className="pt-16 pb-10 sm:pt-24 sm:pb-12 text-center">
          {/* 顶部标签 */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            {t.badge}
          </div>

          {/* 主标题 */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-6 leading-tight tracking-tight">
            <span className="text-white">{t.h1a}</span>
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)" }}
            >
              {t.h1b}
            </span>
            <span className="text-white">{t.h1c}</span>
            <br />
            <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-400 mt-2 block">
              {t.h1sub}
            </span>
          </h1>

          {/* 副标题 */}
          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            {t.desc}
          </p>

          {/* 数据统计 */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-12 mb-10">
            {[
              { value: t.stat1v, unit: t.stat1u, label: t.stat1l },
              { value: t.stat2v, unit: t.stat2u, label: t.stat2l },
              { value: t.stat3v, unit: t.stat3u, label: t.stat3l },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl font-black text-yellow-400">
                  {stat.value}
                  <span className="text-lg text-yellow-300/70 ml-1">{stat.unit}</span>
                </div>
                <div className="text-slate-500 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== Logo 滚动横幅 ===== */}
        <div className="mb-12">
          <LogoMarquee label={t.bannerLabel} />
        </div>

        {/* ===== 模块卡片区域 ===== */}
        <div className="pb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{t.sectionTitle}</h2>
            <p className="text-slate-400">{t.sectionSub}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {t.modules.map((mod, index) => {
              const colors = moduleColors[index];
              return (
                <Link key={index} href={colors.href}>
                  <div
                    className={`
                      group relative rounded-2xl border ${colors.borderColor}
                      bg-gradient-to-br ${colors.accentColor}
                      backdrop-blur-sm overflow-hidden
                      transition-all duration-300 cursor-pointer
                      hover:scale-[1.02] hover:shadow-2xl
                      ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
                    `}
                    style={{
                      transitionDelay: `${index * 100}ms`,
                      background: "rgba(10, 25, 47, 0.7)",
                    }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${colors.accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    <div className="relative p-6 sm:p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-16 h-16 sm:w-20 sm:h-20">{colors.icon}</div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`${colors.badgeColor} text-black text-xs font-black px-3 py-1 rounded-full`}>
                            {mod.badge}
                          </span>
                          <span className="text-slate-500 text-xs font-mono tracking-widest">{mod.subtitle}</span>
                        </div>
                      </div>
                      <h3 className={`text-2xl sm:text-3xl font-black ${colors.titleColor} mb-3`}>{mod.title}</h3>
                      <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">{mod.description}</p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {mod.tags.map((tag) => (
                          <span key={tag} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-6 p-4 rounded-xl bg-black/20 border border-white/5">
                        {mod.stats.map((stat) => (
                          <div key={stat.label} className="text-center">
                            <div className={`text-lg font-black ${colors.titleColor}`}>{stat.value}</div>
                            <div className="text-slate-500 text-xs mt-0.5">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                      <button className={`w-full ${colors.ctaColor} font-bold py-3 px-6 rounded-xl transition-all duration-200 text-sm sm:text-base group-hover:shadow-lg`}>
                        {mod.cta}
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ===== 即将推出 ===== */}
        <div className="pb-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-700 bg-slate-800/50 text-slate-400 text-sm mb-4">
              <span>🚀</span>
              {t.comingSoonBadge}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-300">{t.comingSoonTitle}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {t.comingSoon.map((item, i) => (
              <div key={i} className="relative rounded-xl border border-slate-700/50 bg-slate-800/30 p-5 overflow-hidden">
                <div className="absolute inset-0 backdrop-blur-[1px] bg-slate-900/40 flex items-center justify-center rounded-xl">
                  <div className="text-center">
                    <div className="text-2xl mb-1">🔒</div>
                    <span className="text-slate-400 text-xs font-medium">{t.lockLabel}</span>
                  </div>
                </div>
                <div className="text-3xl mb-3 opacity-40">{item.icon}</div>
                <h3 className="font-bold text-slate-400 mb-1 opacity-40">{item.title}</h3>
                <p className="text-slate-500 text-sm opacity-40">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ===== 底部 ===== */}
        <div className="border-t border-slate-800 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm text-center sm:text-left">
              {t.footerCopy}
            </p>
            <Link href="/contact">
              <span className="flex items-center gap-1.5 text-slate-400 hover:text-yellow-400 transition-colors text-sm cursor-pointer whitespace-nowrap">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {t.contactUs}
              </span>
            </Link>
          </div>
          <p className="text-slate-600 text-xs mt-3 text-center">
            {t.footerDisclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}
