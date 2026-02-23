import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ExternalLink, MessageCircle, Gift, Key } from "lucide-react";
import { useLocation } from "wouter";


// Static metadata (fees, descriptions) — only referralLink & inviteCode come from DB
const EXCHANGE_STATIC: Record<string, {
  logo: string;
  spotMaker: string; spotTaker: string;
  futuresMaker: string; futuresTaker: string;
  rebateLevel: string;
  description: string; descriptionEn: string;
}> = {
  gate:    { logo: '🟢', spotMaker: '0.15%', spotTaker: '0.15%', futuresMaker: '-0.015%', futuresTaker: '0.016%', rebateLevel: '⭐⭐⭐⭐⭐', description: 'Gate.io 的返佣机制最友好，普通用户 Maker 可直接获得返佣。支持多种币种交易对，费率结构透明。', descriptionEn: 'Gate.io has the most user-friendly rebate mechanism. Regular users can directly earn rebates as Makers. Supports multiple currency pairs with transparent fee structure.' },
  okx:     { logo: '🔷', spotMaker: '0.08%', spotTaker: '0.1%',  futuresMaker: '-0.0025%', futuresTaker: '0.0075%', rebateLevel: '⭐⭐⭐⭐⭐', description: 'OKX 是全球前二的衍生品交易所，普通用户即可获得低费率，VIP 用户可获得负 Maker 费（即返佣），最高支持 125 倍杠杆。', descriptionEn: 'OKX is one of the top 2 derivatives exchanges globally. Regular users get low rates, VIP users can get negative Maker fees (rebates), supporting up to 125x leverage.' },
  binance: { logo: '🟡', spotMaker: '0.1%',  spotTaker: '0.1%',  futuresMaker: '0.02%',    futuresTaker: '0.04%',   rebateLevel: '⭐⭐⭐⭐',   description: '币安是全球最大的交易所，流动性最强。普通用户费率为 0.1%，支持 BNB 平台币折扣，新用户常有返佣活动。', descriptionEn: "Binance is the world's largest exchange with the strongest liquidity. Regular user rate is 0.1%, supports BNB discount, new users often have rebate activities." },
  bybit:   { logo: '🔵', spotMaker: '0.1%',  spotTaker: '0.1%',  futuresMaker: '0.01%',    futuresTaker: '0.055%',  rebateLevel: '⭐⭐⭐⭐',   description: 'Bybit 专注衍生品交易，合约手续费低。普通用户费率为 0.1%，风控机制完善，新用户返佣活动丰富。', descriptionEn: 'Bybit focuses on derivatives trading with low contract fees. Regular user rate is 0.1%, with comprehensive risk management and rich new user rebate activities.' },
  bitget:  { logo: '🟣', spotMaker: '0.1%',  spotTaker: '0.1%',  futuresMaker: '0.02%',    futuresTaker: '0.06%',   rebateLevel: '⭐⭐⭐⭐',   description: 'Bitget 拥有独特的跟单交易功能。普通用户费率为 0.1%，新用户福利活动多，费率对新用户友好。', descriptionEn: 'Bitget has a unique copy trading feature. Regular user rate is 0.1%, with many new user benefits and user-friendly rates.' },
};

export default function Exchanges() {
  const [, navigate] = useLocation();
  const { language, setLanguage } = useLanguage();

  // Fetch live referral links and invite codes from database
  const { data: dbLinks } = trpc.exchanges.list.useQuery();

  // Merge DB data with static metadata
  const exchangesData = (dbLinks ?? []).map(link => ({
    ...link,
    ...(EXCHANGE_STATIC[link.slug] ?? {}),
  }));

  const t = {
    zh: {
      title: '交易所对比',
      subtitle: '了解各大平台的手续费率和返佣机制',
      back: '返回首页',
      spotFee: '现货手续费',
      futuresFee: '合约手续费',
      maker: 'Maker',
      taker: 'Taker',
      rebateLevel: '返佣友好度',
      rebateRate: '返佣比例',
      inviteCode: '邀请码',
      register: '点击注册并自动获得返佣',
      contact: '联系我们配置返佣',
      inviteCodeTip: '若无法使用链接，注册时手动填入邀请码',
      // 底部提示
      ctaTitle: '🎁 新用户直接注册即可获得返佣！',
      ctaDesc: '通过上方链接注册，系统自动绑定返佣，无需额外操作。',
      ctaInviteTip: '⚠️ 若链接无法跳转，注册时请手动填写邀请码：',
      ctaGateCode: 'Gate.io 邀请码：',
      ctaOtherCode: '其他交易所邀请码（OKX / Binance / Bybit / Bitget）：',
      ctaContactTitle: '有返佣疑问或任何问题？',
      ctaContactDesc: '联系我们，专人为您解答并配置高额度返佣方案',
      ctaContactBtn: '立即联系我们',
    },
    en: {
      title: 'Exchange Comparison',
      subtitle: 'Understand fee rates and rebate mechanisms of major platforms',
      back: 'Back to Home',
      spotFee: 'Spot Trading Fees',
      futuresFee: 'Futures Trading Fees',
      maker: 'Maker',
      taker: 'Taker',
      rebateLevel: 'Rebate Friendliness',
      rebateRate: 'Rebate Rate',
      inviteCode: 'Invite Code',
      register: 'Register & Get Rebates Automatically',
      contact: 'Contact Us for Rebates',
      inviteCodeTip: 'If the link fails, enter invite code manually during registration',
      // Bottom CTA
      ctaTitle: '🎁 New users get rebates instantly upon registration!',
      ctaDesc: 'Register via the links above — rebates are automatically linked, no extra steps needed.',
      ctaInviteTip: '⚠️ If the link fails, enter the invite code manually during registration:',
      ctaGateCode: 'Gate.io Invite Code:',
      ctaOtherCode: 'Other Exchanges (OKX / Binance / Bybit / Bitget):',
      ctaContactTitle: 'Questions about rebates or anything else?',
      ctaContactDesc: 'Contact us — our team will answer your questions and set up a high-value rebate plan for you',
      ctaContactBtn: 'Contact Us Now',
    },
  };

  const texts = t[language as keyof typeof t];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 w-full bg-background/95 backdrop-blur border-b border-border z-30">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-center gap-8">
          <button onClick={() => navigate('/')} className="text-xl font-bold text-accent hover:opacity-80 transition whitespace-nowrap">
            💰 {language === 'zh' ? '币圈省钱指南' : 'Crypto Savings Guide'}
          </button>
          <div className="flex items-center gap-1 bg-card/60 rounded-full px-1 py-1 border border-border">
            <button
              onClick={() => setLanguage('zh')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${language === 'zh' ? 'bg-accent text-accent-foreground shadow' : 'text-muted-foreground hover:text-accent'}`}
            >
              中文
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${language === 'en' ? 'bg-accent text-accent-foreground shadow' : 'text-muted-foreground hover:text-accent'}`}
            >
              EN
            </button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-accent hover:text-accent/80 whitespace-nowrap">
            <ArrowLeft className="mr-1" size={16} />
            {texts.back}
          </Button>
        </div>
      </nav>

      {/* Header */}
      <section className="py-20 px-4 bg-gradient-to-b from-card to-background text-center">
        <div className="container mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white">{texts.title}</h1>
          <p className="text-xl text-muted-foreground">{texts.subtitle}</p>
        </div>
      </section>

      {/* Exchanges Grid */}
      <section className="py-12 px-4 bg-background">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {exchangesData.map((exchange) => (
              <div key={exchange.name} className="bg-card p-8 rounded-lg border border-border hover:border-accent transition flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-4xl">{exchange.logo}</div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{exchange.name}</h3>
                    <span className="bg-accent/20 text-accent text-xs px-2 py-0.5 rounded-full font-semibold">
                      {texts.rebateRate}: {exchange.rebateRate}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-muted-foreground text-sm mb-6">
                  {language === 'zh' ? exchange.description : exchange.descriptionEn}
                </p>

                {/* Spot Fees */}
                <div className="mb-4 pb-4 border-b border-border">
                  <p className="text-accent font-semibold mb-3 text-sm">{texts.spotFee}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">{texts.maker}</p>
                      <p className="text-white font-bold">{exchange.spotMaker}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{texts.taker}</p>
                      <p className="text-white font-bold">{exchange.spotTaker}</p>
                    </div>
                  </div>
                </div>

                {/* Futures Fees */}
                <div className="mb-4 pb-4 border-b border-border">
                  <p className="text-accent font-semibold mb-3 text-sm">{texts.futuresFee}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">{texts.maker}</p>
                      <p className={`font-bold ${exchange.futuresMaker.startsWith('-') ? 'text-green-400' : 'text-white'}`}>
                        {exchange.futuresMaker}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{texts.taker}</p>
                      <p className="text-white font-bold">{exchange.futuresTaker}</p>
                    </div>
                  </div>
                </div>

                {/* Rebate Level */}
                <div className="mb-4 pb-4 border-b border-border">
                  <p className="text-accent font-semibold mb-2 text-sm">{texts.rebateLevel}</p>
                  <p className="text-xl">{exchange.rebateLevel}</p>
                </div>

                {/* Invite Code */}
                <div className="mb-6 pb-4 border-b border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Key size={14} className="text-accent" />
                    <p className="text-accent font-semibold text-sm">{texts.inviteCode}</p>
                  </div>
                  <div className="bg-background/60 rounded-lg px-3 py-2 flex items-center justify-between">
                    <span className="font-mono font-bold text-white tracking-widest">{exchange.inviteCode}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(exchange.inviteCode)}
                      className="text-xs text-accent hover:text-accent/80 transition ml-2"
                      title="复制邀请码"
                    >
                      {language === 'zh' ? '复制' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-muted-foreground text-xs mt-1">{texts.inviteCodeTip}</p>
                </div>

                {/* Action Buttons */}
                <div className="mt-auto space-y-3">
                  <a
                    href={exchange.referralLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-accent text-accent-foreground rounded-lg py-3 font-semibold hover:bg-accent/90 transition"
                  >
                    <Gift size={16} /> {texts.register} <ExternalLink size={14} />
                  </a>
                  <button
                    onClick={() => navigate('/contact')}
                    className="w-full border border-accent text-accent rounded-lg py-3 font-semibold hover:bg-accent/10 transition text-sm"
                  >
                    {texts.contact}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 底部新用户提示 CTA ===== */}
      <section className="py-16 px-4 bg-gradient-to-b from-background to-card/40">
        <div className="container mx-auto max-w-3xl">

          {/* 主提示框 */}
          <div className="bg-accent/10 border-2 border-accent rounded-2xl p-8 mb-8 text-center">
            <h2 className="text-3xl font-bold text-accent mb-3">{texts.ctaTitle}</h2>
            <p className="text-white text-lg">{texts.ctaDesc}</p>
          </div>

          {/* 邀请码备用说明 */}
          <div className="bg-card border border-border rounded-xl p-6 mb-8">
            <p className="text-yellow-400 font-semibold mb-4 text-sm">{texts.ctaInviteTip}</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-background/60 rounded-lg px-4 py-3">
                <span className="text-muted-foreground text-sm">{texts.ctaGateCode}</span>
                <span className="font-mono font-bold text-accent text-lg tracking-widest">FORMANUS</span>
              </div>
              <div className="flex items-center justify-between bg-background/60 rounded-lg px-4 py-3">
                <span className="text-muted-foreground text-sm">{texts.ctaOtherCode}</span>
                <span className="font-mono font-bold text-accent text-lg tracking-widest">MANUS</span>
              </div>
            </div>
          </div>

          {/* 联系引导 */}
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <MessageCircle className="text-accent mx-auto mb-4" size={40} />
            <h3 className="text-2xl font-bold text-white mb-3">{texts.ctaContactTitle}</h3>
            <p className="text-muted-foreground mb-6 text-lg">{texts.ctaContactDesc}</p>
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-10 py-6"
              onClick={() => navigate('/contact')}
            >
              <MessageCircle className="mr-2" size={20} />
              {texts.ctaContactBtn}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 bg-card/50 border-t border-border">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground mb-4">
            {language === 'zh'
              ? '选择适合您的交易所，开始享受手续费折扣吧！'
              : 'Choose the right exchange and start enjoying fee discounts!'}
          </p>
          <Button onClick={() => navigate('/')} className="bg-accent text-accent-foreground hover:bg-accent/90">
            {texts.back}
          </Button>
        </div>
      </footer>
    </div>
  );
}
