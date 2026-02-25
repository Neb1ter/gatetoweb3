import { useLocation, Link } from "wouter";
import { useScrollMemory } from "@/hooks/useScrollMemory";
import { useLanguage } from "@/contexts/LanguageContext";
import { Scale, AlertTriangle, FileText, Shield } from "lucide-react";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";

const TEXTS = {
  zh: {
    title: "法律与合规",
    subtitle: "免责声明与风险提示",
    navBack: "返回首页",
    lastUpdated: "最后更新：2026年2月",

    disclaimer: {
      title: "免责声明",
      id: "disclaimer",
      intro: "请在使用本网站（「Web3 导航中心」）及其提供的任何内容、链接或服务前，仔细阅读并理解以下声明。",
      items: [
        {
          title: "非投资建议",
          content: "本网站所载全部内容（包括但不限于文章、教程、数据、第三方交易所链接及返佣相关信息）仅供一般性信息与教育用途，不构成任何形式的投资建议、理财建议、法律意见或要约。您应基于自身判断做出决策，并自行承担全部责任。",
        },
        {
          title: "非交易所或金融机构",
          content: "本网站为信息与导航平台，不从事证券、期货、外汇或数字资产交易业务，亦非持牌金融机构。本站所展示的交易所链接、邀请码及返佣信息来自第三方，您与交易所之间的任何关系及交易行为均与本网站无关。",
        },
        {
          title: "信息准确性",
          content: "我们力求信息准确、及时，但不保证所载内容完整、无误或始终最新。费率、返佣比例、政策及法规可能随时变更，请以各交易所及监管机构官方信息为准。",
        },
        {
          title: "第三方链接与责任限制",
          content: "本站含有指向第三方网站（如交易所、钱包、DeFi 协议等）的链接。我们不对第三方网站的内容、隐私政策、可用性或合规性负责。您访问或使用第三方服务时，须遵守其条款与当地法律。",
        },
        {
          title: "知识产权与转载",
          content: "本站原创内容受著作权法保护。未经授权不得擅自转载、改编或用于商业目的。引用时请注明出处。",
        },
      ],
    },

    risk: {
      title: "风险提示",
      id: "risk",
      intro: "涉及加密货币、区块链及 Web3 相关活动时，您可能面临以下（包括但不限于）风险。请充分了解并谨慎决策。",
      items: [
        {
          title: "市场与价格风险",
          content: "数字资产价格波动剧烈，可能在短时间内出现大幅涨跌，导致部分或全部本金损失。历史表现不代表未来收益。",
        },
        {
          title: "交易与流动性风险",
          content: "交易所、DeFi 协议可能面临流动性不足、滑点、无法成交或暂停提现等情况。杠杆、合约等产品可能引发强平与超额损失。",
        },
        {
          title: "技术与安全风险",
          content: "私钥丢失、账户被盗、智能合约漏洞、网络攻击、平台宕机等可能导致资产无法找回。请妥善保管私钥并仅使用可信平台。",
        },
        {
          title: "监管与合规风险",
          content: "各国对数字资产及衍生品的监管政策不一且可能变化。您所在司法辖区可能限制或禁止部分业务，违规可能面临法律后果。",
        },
        {
          title: "返佣与第三方服务",
          content: "本站所介绍的返佣、邀请码等来自第三方交易所。返佣比例与规则以交易所为准，可能调整或终止。使用邀请链接注册即表示您接受该交易所的条款与风险。",
        },
      ],
      closing: "您在使用本站或通过本站链接访问的任何服务前，应自行评估风险、咨询专业顾问（如需要），并仅使用可承受损失的资金。",
    },

    compliance: {
      title: "合规声明",
      id: "compliance",
      content: "我们致力于在法律法规框架内运营。本站不向禁止或限制访问的地区主动推广受管制金融产品。若您所在地区禁止使用本站所链接的服务，请立即停止使用并遵守当地法律。",
    },

    footer: "如有疑问，请通过「联系我们」页面与我们沟通。继续使用本站即表示您已阅读并理解上述免责声明与风险提示。",
  },
  en: {
    title: "Legal & Compliance",
    subtitle: "Disclaimer & Risk Disclosure",
    navBack: "Back to Home",
    lastUpdated: "Last updated: February 2026",

    disclaimer: {
      title: "Disclaimer",
      id: "disclaimer",
      intro: "Please read and understand the following before using this website (\"Web3 Navigation Hub\") and any content, links, or services provided herein.",
      items: [
        {
          title: "Not Investment Advice",
          content: "All content on this site (including but not limited to articles, tutorials, data, third-party exchange links, and rebate-related information) is for general information and educational purposes only. It does not constitute investment advice, financial advice, legal advice, or an offer. You should make decisions based on your own judgment and assume full responsibility.",
        },
        {
          title: "Not an Exchange or Financial Institution",
          content: "This site is an information and navigation platform. We do not engage in securities, futures, foreign exchange, or digital asset trading, and we are not a licensed financial institution. Exchange links, referral codes, and rebate information displayed here are from third parties. Any relationship or trading activity between you and an exchange is independent of this website.",
        },
        {
          title: "Accuracy of Information",
          content: "We strive for accuracy and timeliness but do not guarantee that the content is complete, error-free, or always up to date. Fees, rebate rates, policies, and regulations may change at any time. Please refer to each exchange and regulator for official information.",
        },
        {
          title: "Third-Party Links and Limitation of Liability",
          content: "This site contains links to third-party websites (e.g. exchanges, wallets, DeFi protocols). We are not responsible for the content, privacy policies, availability, or compliance of third-party sites. Your use of third-party services is subject to their terms and local laws.",
        },
        {
          title: "Intellectual Property",
          content: "Original content on this site is protected by copyright. Unauthorized reproduction, adaptation, or commercial use is prohibited. Please cite the source when referencing.",
        },
      ],
    },

    risk: {
      title: "Risk Disclosure",
      id: "risk",
      intro: "Activities involving cryptocurrency, blockchain, and Web3 may involve the following (non-exhaustive) risks. Please understand them and act with caution.",
      items: [
        {
          title: "Market and Price Risk",
          content: "Digital asset prices are highly volatile and may rise or fall sharply in a short period, potentially resulting in partial or total loss of principal. Past performance does not indicate future returns.",
        },
        {
          title: "Trading and Liquidity Risk",
          content: "Exchanges and DeFi protocols may face insufficient liquidity, slippage, failed orders, or withdrawal suspensions. Leverage and derivatives may lead to liquidation and excess loss.",
        },
        {
          title: "Technical and Security Risk",
          content: "Lost private keys, account theft, smart contract bugs, network attacks, and platform outages may result in unrecoverable assets. Please safeguard your keys and use only trusted platforms.",
        },
        {
          title: "Regulatory and Compliance Risk",
          content: "Regulation of digital assets and related products varies by jurisdiction and may change. Your jurisdiction may restrict or prohibit certain activities; non-compliance may have legal consequences.",
        },
        {
          title: "Rebates and Third-Party Services",
          content: "Rebates and referral codes described on this site are offered by third-party exchanges. Rates and rules are set by those exchanges and may change or end. Using a referral link constitutes acceptance of that exchange’s terms and risks.",
        },
      ],
      closing: "Before using this site or any service accessed through it, you should assess risks yourself, seek professional advice if needed, and only use funds you can afford to lose.",
    },

    compliance: {
      title: "Compliance Statement",
      id: "compliance",
      content: "We operate within applicable laws and regulations. This site does not actively promote regulated financial products in jurisdictions where they are prohibited or restricted. If your jurisdiction prohibits use of the services linked here, you must stop using them and comply with local law.",
    },

    footer: "If you have questions, please contact us via the Contact page. Continued use of this site constitutes your acceptance of the above disclaimer and risk disclosure.",
  },
};

export default function Legal() {
  useScrollMemory();
  const [, navigate] = useLocation();
  const { language } = useLanguage();
  const t = TEXTS[language === "zh" ? "zh" : "en"];

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: "linear-gradient(180deg, #0a192f 0%, #0d1f35 50%, #0a1628 100%)" }}
    >
      <nav className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl" style={{ background: "rgba(10,25,47,0.9)" }}>
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-slate-500 hover:text-amber-400 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t.navBack}
          </button>
          <span className="text-xs font-bold text-amber-400/90 uppercase tracking-wider">{t.title}</span>
          <div className="w-16" />
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-10 pb-16">
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-amber-400/80 mb-4">
            <Scale className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-widest">{t.title}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">{t.subtitle}</h1>
          <p className="text-slate-500 text-sm">{t.lastUpdated}</p>
        </header>

        {/* 免责声明 */}
        <section id={t.disclaimer.id} className="mb-14 scroll-mt-24">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-black text-white">{t.disclaimer.title}</h2>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">{t.disclaimer.intro}</p>
          <div className="space-y-6">
            {t.disclaimer.items.map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-amber-500/15 bg-white/[0.02] p-5"
              >
                <h3 className="text-sm font-bold text-amber-300/90 mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 风险提示 */}
        <section id={t.risk.id} className="mb-14 scroll-mt-24">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-black text-white">{t.risk.title}</h2>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">{t.risk.intro}</p>
          <div className="space-y-6">
            {t.risk.items.map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-amber-500/15 bg-white/[0.02] p-5"
              >
                <h3 className="text-sm font-bold text-amber-300/90 mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.content}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
            <p className="text-amber-200/90 text-sm leading-relaxed font-medium">{t.risk.closing}</p>
          </div>
        </section>

        {/* 合规声明 */}
        <section id={t.compliance.id} className="mb-12 scroll-mt-24">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-black text-white">{t.compliance.title}</h2>
          </div>
          <div className="rounded-xl border border-amber-500/15 bg-white/[0.02] p-5">
            <p className="text-slate-400 text-sm leading-relaxed">{t.compliance.content}</p>
          </div>
        </section>

        <p className="text-slate-500 text-xs leading-relaxed text-center border-t border-white/5 pt-8">
          {t.footer}
        </p>

        <div className="mt-10 flex justify-center">
          <Link href="/contact">
            <span className="text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer">
              {language === "zh" ? "联系我们" : "Contact Us"} →
            </span>
          </Link>
        </div>
      </main>

      <ScrollToTopButton color="yellow" />
    </div>
  );
}
