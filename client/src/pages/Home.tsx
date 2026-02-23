import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { WelcomeGuide } from '@/components/WelcomeGuide';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/lib/i18n';
import { trpc } from '@/lib/trpc';
import {
  TrendingUp, Shield, CheckCircle2, Users, Gift, Zap,
  ArrowUp, ChevronDown, BookOpen,
} from 'lucide-react';

// Emoji map for each exchange slug
const EXCHANGE_META: Record<string, { emoji: string; color: string }> = {
  gate:    { emoji: '🟢', color: 'from-blue-900 to-gray-900' },
  okx:     { emoji: '🔷', color: 'from-gray-800 to-gray-900' },
  binance: { emoji: '🟡', color: 'from-yellow-900 to-gray-900' },
  bybit:   { emoji: '🔵', color: 'from-orange-900 to-gray-900' },
  bitget:  { emoji: '🟣', color: 'from-teal-900 to-gray-900' },
};

export default function Home() {
  const { language, setLanguage } = useLanguage();
  const [, navigate] = useLocation();
  const texts = translations[language as keyof typeof translations];

  // Fetch exchange links from database
  const { data: exchangeLinksData } = trpc.exchanges.list.useQuery();

  const [showGuide, setShowGuide] = useState(() => {
    try { return !localStorage.getItem('crypto_guide_seen'); } catch { return true; }
  });
  const [showScrollTop, setShowScrollTop] = useState(false);

  const downloadRef = useRef<HTMLElement>(null);
  const comparisonRef = useRef<HTMLElement>(null);
  const insightRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleGuideSelection = (type: 'new' | 'old') => {
    setShowGuide(false);
    try { localStorage.setItem('crypto_guide_seen', '1'); } catch {}
    if (type === 'new') {
      setTimeout(() => downloadRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      setTimeout(() => comparisonRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const handleGuideClose = () => {
    setShowGuide(false);
    try { localStorage.setItem('crypto_guide_seen', '1'); } catch {}
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Welcome Guide Modal */}
      {showGuide && (
        <WelcomeGuide
          onClose={handleGuideClose}
          onSelectNewUser={() => handleGuideSelection('new')}
          onSelectOldUser={() => handleGuideSelection('old')}
        />
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 z-40 bg-accent text-accent-foreground rounded-full p-3 shadow-lg hover:bg-accent/90 transition"
          aria-label="回到顶部"
        >
          <ArrowUp size={20} />
        </button>
      )}

      {/* Navigation */}
      <nav className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/portal')}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-accent transition text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">主页</span>
            </button>
            <div className="w-px h-4 bg-border" />
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-xl font-bold text-accent hover:opacity-80 transition"
            >
              {texts.nav.title}
            </button>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#mechanism" className="text-muted-foreground hover:text-accent transition text-sm">{texts.nav.mechanism}</a>
            <a href="#comparison" className="text-muted-foreground hover:text-accent transition text-sm">{texts.nav.comparison}</a>
            <a href="#security" className="text-muted-foreground hover:text-accent transition text-sm">{texts.nav.security}</a>
            <button
              onClick={() => downloadRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="text-muted-foreground hover:text-accent transition text-sm"
            >
              {texts.nav.download}
            </button>
            <button
              onClick={() => navigate('/beginner')}
              className="text-muted-foreground hover:text-accent transition text-sm"
            >
              {texts.nav.beginnerGuide}
            </button>
            <button
              onClick={() => navigate('/exchanges')}
              className="text-muted-foreground hover:text-accent transition text-sm"
            >
              {texts.nav.exchanges}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage('zh')}
              className={`px-3 py-1 rounded text-sm font-medium transition ${language === 'zh' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-accent'}`}
            >
              中文
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded text-sm font-medium transition ${language === 'en' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-accent'}`}
            >
              EN
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-background to-card/30 text-center">
        <div className="container mx-auto">
          <div className="inline-block bg-accent/10 border border-accent/30 text-accent text-sm px-4 py-2 rounded-full mb-6">
            {texts.hero.badge}
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            {texts.hero.title}
          </h1>
          <p className="text-2xl text-accent font-semibold mb-4">{texts.hero.subtitle}</p>
          <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">{texts.hero.description}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8"
              onClick={() => insightRef.current?.scrollIntoView({ behavior: 'smooth' })}
            >
              {texts.hero.startBtn}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-accent text-accent hover:bg-accent/10 text-lg px-8"
              onClick={() => comparisonRef.current?.scrollIntoView({ behavior: 'smooth' })}
            >
              {texts.hero.caseBtn}
            </Button>
          </div>
          <div className="mt-12 animate-bounce">
            <ChevronDown className="text-accent mx-auto" size={32} />
          </div>
        </div>
      </section>

      {/* Newbie 3-Step Guide */}
      <section className="py-20 px-4 bg-card/20">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold mb-2 text-accent text-center">{texts.newbieGuide.title}</h2>
          <p className="text-muted-foreground mb-12 text-lg text-center">{texts.newbieGuide.subtitle}</p>
          <div className="grid md:grid-cols-3 gap-8 mb-10">
            {[
              { num: '1', title: texts.newbieGuide.step1, desc: texts.newbieGuide.step1Desc },
              { num: '2', title: texts.newbieGuide.step2, desc: texts.newbieGuide.step2Desc },
              { num: '3', title: texts.newbieGuide.step3, desc: texts.newbieGuide.step3Desc },
            ].map((step) => (
              <div key={step.num} className="bg-card p-8 rounded-lg border border-border text-center">
                <div className="bg-accent text-accent-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-accent/10 border border-accent rounded-lg p-4 text-center mb-8">
            <p className="text-accent font-semibold">{texts.newbieGuide.warning}</p>
          </div>

          {/* Beginner Guide CTA */}
          <div className="bg-card border border-border rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-accent/10 rounded-full p-4">
                <BookOpen className="text-accent" size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{texts.newbieGuide.learnMore}</h3>
                <p className="text-muted-foreground">{texts.newbieGuide.learnMoreDesc}</p>
              </div>
            </div>
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 whitespace-nowrap"
              onClick={() => navigate('/beginner')}
            >
              {texts.newbieGuide.learnMoreBtn}
            </Button>
          </div>

          {/* 🔥 Interactive Crypto Intro CTA - prominent banner */}
          <div
            className="mt-6 relative overflow-hidden rounded-2xl cursor-pointer group"
            onClick={() => navigate('/crypto-intro')}
            style={{ background: 'linear-gradient(135deg, #0f2744 0%, #1a3a5c 40%, #0f2744 100%)' }}
          >
            {/* animated glow border */}
            <div className="absolute inset-0 rounded-2xl border-2 border-accent/60 group-hover:border-accent transition-colors duration-300" />
            {/* pulsing dot */}
            <span className="absolute top-4 right-4 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-accent" />
            </span>
            <div className="flex flex-col md:flex-row items-center gap-6 p-6 md:p-8">
              <div className="text-6xl select-none">📈</div>
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-accent/20 text-accent text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
                  <span className="animate-pulse">●</span>
                  {language === 'zh' ? '新手必看' : 'MUST READ FOR BEGINNERS'}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {language === 'zh' ? '🔥 新手看这里！币圈交易 vs 传统交易' : '🔥 Beginners! Crypto vs Traditional Trading'}
                </h3>
                <p className="text-muted-foreground text-base">
                  {language === 'zh'
                    ? '3 分钟了解币圈独特优势，亲手模拟一笔永续合约交易，感受杠杆的魔力 ——完全免费，无需注册'
                    : '3 min to understand crypto advantages, simulate a perpetual contract trade, feel the power of leverage — free, no registration'}
                </p>
              </div>
              <div className="flex flex-col items-center gap-2 shrink-0">
                <Button
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-lg px-8 py-6 shadow-lg shadow-accent/30 group-hover:scale-105 transition-transform"
                >
                  {language === 'zh' ? '立即体验模拟交易 →' : 'Try Simulated Trading →'}
                </Button>
                <span className="text-xs text-muted-foreground">
                  {language === 'zh' ? '已有 2,847 名新手体验过' : '2,847 beginners have tried'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Exchange Download Section */}
      <section ref={downloadRef as React.RefObject<HTMLElement>} className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold mb-2 text-accent text-center">{texts.exchangeDownload.title}</h2>
          <p className="text-muted-foreground mb-12 text-lg text-center">{texts.exchangeDownload.subtitle}</p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {(exchangeLinksData ?? []).map((ex) => {
              const meta = EXCHANGE_META[ex.slug] ?? { emoji: '💱', color: 'from-gray-800 to-gray-900' };
              return (
              <a
                key={ex.slug}
                href={ex.referralLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`bg-gradient-to-b ${meta.color} border border-border rounded-xl p-6 flex flex-col items-center gap-3 hover:border-accent transition group`}
              >
                <div className="text-4xl group-hover:scale-110 transition">{meta.emoji}</div>
                <span className="text-lg font-bold text-white">{ex.name}</span>
                <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full font-semibold">返佣 {ex.rebateRate}</span>
                <span className="text-xs text-accent font-medium">{texts.exchangeDownload.download} ↗</span>
              </a>
              );
            })}
          </div>

          <div className="text-center space-y-4">
            <p className="text-muted-foreground text-sm">{texts.exchangeDownload.official}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto"
                onClick={() => navigate('/exchanges')}
              >
                <Zap className="mr-2" size={20} />
                {language === 'zh' ? '查看详细费率对比' : 'View Detailed Fee Comparison'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-accent/60 text-accent hover:bg-accent/10 w-full sm:w-auto"
                onClick={() => navigate('/exchange-guide')}
              >
                <span className="mr-2">📖</span>
                {language === 'zh' ? '不了解这几个交易所？点这里学习' : 'Not familiar? Learn about each exchange'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What is Rebate */}
      <section ref={insightRef as React.RefObject<HTMLElement>} className="py-20 px-4 bg-card/30">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl font-bold text-accent mb-4">
            {language === 'zh' ? '什么是返佣？' : 'What is Rebate?'}
          </h2>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            {language === 'zh'
              ? '返佣是交易所为了吸引新用户而提供的激励机制。当您通过邀请码注册时，交易所会自动将您的交易手续费的一部分返还给您，这就是返佣。'
              : 'Rebates are incentive mechanisms provided by exchanges to attract new users. When you register with a referral code, the exchange automatically returns a portion of your trading fees to you.'}
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {[
              { icon: <Gift className="text-accent mx-auto mb-3" size={32} />, title: language === 'zh' ? '自动返还' : 'Auto Return', desc: language === 'zh' ? '每笔交易手续费的一部分自动返还到您的账户' : 'A portion of each trade fee is automatically returned to your account' },
              { icon: <TrendingUp className="text-accent mx-auto mb-3" size={32} />, title: language === 'zh' ? '持续收益' : 'Ongoing Income', desc: language === 'zh' ? '只要您继续交易，就能持续获得返佣' : 'As long as you keep trading, you keep earning rebates' },
              { icon: <CheckCircle2 className="text-accent mx-auto mb-3" size={32} />, title: language === 'zh' ? '官方支持' : 'Official Support', desc: language === 'zh' ? '这是交易所官方的正规激励机制' : 'This is the official legitimate incentive mechanism of exchanges' },
            ].map((item, i) => (
              <div key={i} className="bg-card p-6 rounded-lg border border-border hover:border-accent transition">
                {item.icon}
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Insight */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-accent">{texts.insight.title}</h2>
          <p className="text-muted-foreground mb-12 text-lg">{texts.insight.subtitle}</p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-lg border border-border">
              <TrendingUp className="text-accent mb-4" size={32} />
              <h3 className="text-xl font-bold mb-3">{texts.insight.cost.title}</h3>
              <p className="text-muted-foreground">{texts.insight.cost.desc}</p>
            </div>
            <div className="bg-card p-8 rounded-lg border border-border">
              <CheckCircle2 className="text-accent mb-4" size={32} />
              <h3 className="text-xl font-bold mb-3">{texts.insight.reduce.title}</h3>
              <p className="text-muted-foreground">{texts.insight.reduce.desc}</p>
            </div>
            <div className="bg-card p-8 rounded-lg border border-border">
              <Shield className="text-accent mb-4" size={32} />
              <h3 className="text-xl font-bold mb-3">{texts.insight.profit.title}</h3>
              <p className="text-muted-foreground">{texts.insight.profit.desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mechanism */}
      <section id="mechanism" className="py-20 px-4 bg-card/30">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-accent">{texts.mechanism.title}</h2>
          <p className="text-muted-foreground mb-12 text-lg">{texts.mechanism.subtitle}</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Users className="text-accent" size={32} />, title: texts.mechanism.demand.title, desc: texts.mechanism.demand.desc },
              { icon: <Gift className="text-accent" size={32} />, title: texts.mechanism.incentive.title, desc: texts.mechanism.incentive.desc },
              { icon: <CheckCircle2 className="text-accent" size={32} />, title: texts.mechanism.winwin.title, desc: texts.mechanism.winwin.desc },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="bg-accent/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-accent">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison - New vs Old Users */}
      <section id="comparison" ref={comparisonRef as React.RefObject<HTMLElement>} className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-accent">{texts.comparison.title}</h2>
          <p className="text-muted-foreground mb-12 text-lg">{texts.comparison.subtitle}</p>
          <div className="grid md:grid-cols-2 gap-8">
            {/* New User */}
            <div className="bg-card p-8 rounded-lg border border-accent">
              <div className="text-4xl mb-4">👤</div>
              <h3 className="text-2xl font-bold mb-6 text-accent">{texts.comparison.newUser}</h3>
              {[texts.comparison.step1New, texts.comparison.step2New, texts.comparison.step3New].map((step, i) => (
                <div key={i} className="flex items-start gap-3 mb-4">
                  <div className="bg-accent text-accent-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">{i + 1}</div>
                  <p className="text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
            {/* Old User */}
            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-2xl font-bold mb-6">{texts.comparison.oldUser}</h3>
              {[texts.comparison.step1Old, texts.comparison.step2Old, texts.comparison.step3Old].map((step, i) => (
                <div key={i} className="flex items-start gap-3 mb-4">
                  <div className="bg-accent/20 text-accent rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">{i + 1}</div>
                  <p className="text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Case Study */}
      <section className="py-20 px-4 bg-card/30">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-accent">{texts.caseStudy.title}</h2>
          <p className="text-muted-foreground mb-12 text-lg">{texts.caseStudy.subtitle}</p>
          <div className="bg-card rounded-xl border border-accent p-8">
            <div className="grid md:grid-cols-4 gap-6 text-center mb-8">
              {[
                { label: texts.caseStudy.monthlyVolume, value: '$1,000,000', color: 'text-white' },
                { label: texts.caseStudy.standardFee, value: '$1,000', color: 'text-destructive' },
                { label: texts.caseStudy.rebateAmount, value: '$600', color: 'text-accent' },
                { label: texts.caseStudy.actualFee, value: '$400', color: 'text-green-400' },
              ].map((item, i) => (
                <div key={i} className="bg-background/50 rounded-lg p-4">
                  <p className="text-muted-foreground text-sm mb-2">{item.label}</p>
                  <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
            <div className="text-center border-t border-border pt-6">
              <p className="text-2xl font-bold text-accent mb-2">
                {texts.caseStudy.summary} <span className="text-4xl">$600</span>，{texts.caseStudy.yearly} <span className="text-4xl">$7,200</span>
              </p>
              <p className="text-muted-foreground">{texts.caseStudy.profit}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Scenarios */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-accent">{texts.scenarios.title}</h2>
          <p className="text-muted-foreground mb-12 text-lg">{texts.scenarios.subtitle}</p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card p-8 rounded-lg border border-border">
              <h3 className="text-2xl font-bold mb-6 text-accent">{texts.scenarios.spot}</h3>
              {[texts.scenarios.spotPoint1, texts.scenarios.spotPoint2, texts.scenarios.spotPoint3].map((p, i) => (
                <div key={i} className="flex items-start gap-3 mb-3">
                  <CheckCircle2 className="text-accent flex-shrink-0 mt-0.5" size={18} />
                  <p className="text-muted-foreground">{p}</p>
                </div>
              ))}
            </div>
            <div className="bg-card p-8 rounded-lg border border-border">
              <h3 className="text-2xl font-bold mb-6 text-accent">{texts.scenarios.futures}</h3>
              {[texts.scenarios.futuresPoint1, texts.scenarios.futuresPoint2, texts.scenarios.futuresPoint3].map((p, i) => (
                <div key={i} className="flex items-start gap-3 mb-3">
                  <CheckCircle2 className="text-accent flex-shrink-0 mt-0.5" size={18} />
                  <p className="text-muted-foreground">{p}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-center text-accent font-semibold mt-8 text-lg">{texts.scenarios.note}</p>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="py-20 px-4 bg-card/30">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-accent">{texts.security.title}</h2>
          <p className="text-muted-foreground mb-12 text-lg">{texts.security.subtitle}</p>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { icon: <CheckCircle2 className="text-accent mr-3" size={28} />, title: texts.security.official, desc: texts.security.officialDesc },
              { icon: <Shield className="text-accent mr-3" size={28} />, title: texts.security.settlement, desc: texts.security.settlementDesc },
              { icon: <Shield className="text-accent mr-3" size={28} />, title: texts.security.security1, desc: texts.security.security1Desc },
              { icon: <CheckCircle2 className="text-accent mr-3" size={28} />, title: texts.security.standard, desc: texts.security.standardDesc },
            ].map((item, i) => (
              <div key={i} className="bg-card p-8 rounded-lg border border-border">
                <div className="flex items-center mb-4">
                  {item.icon}
                  <h3 className="text-xl font-bold">{item.title}</h3>
                </div>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Summary & CTA */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-accent">{texts.summary.title}</h2>
          <p className="text-muted-foreground mb-12 text-lg">{texts.summary.subtitle}</p>
          <div className="space-y-6 mb-12">
            {[
              { title: texts.summary.point1, sub: texts.summary.point1Sub },
              { title: texts.summary.point2, sub: texts.summary.point2Sub },
              { title: texts.summary.point3, sub: texts.summary.point3Sub },
            ].map((item, i) => (
              <div key={i} className="flex items-start">
                <CheckCircle2 className="text-accent mr-4 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-card p-8 rounded-lg border-t-4 border-accent mb-12">
            <div className="grid md:grid-cols-2 gap-8 text-center">
              <div>
                <p className="text-accent font-semibold text-sm mb-2">{texts.summary.step1}</p>
                <p className="text-2xl font-bold">{texts.summary.step1Title}</p>
              </div>
              <div>
                <p className="text-accent font-semibold text-sm mb-2">{texts.summary.step2}</p>
                <p className="text-2xl font-bold">{texts.summary.step2Title}</p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg text-muted-foreground italic mb-8">{texts.summary.cta}</p>
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => navigate('/contact')}
            >
              {texts.summary.contactBtn}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-card/50 border-t border-border">
        <div className="container mx-auto text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            {language === 'zh' ? '让每一笔交易都更具价值' : 'Make Every Trade More Valuable'}
          </h3>
          <p className="text-muted-foreground mb-8">
            {language === 'zh' ? '智慧交易，从省钱开始' : 'Smart Trading Starts with Savings'}
          </p>
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <button onClick={() => navigate('/exchanges')} className="hover:text-accent transition">{texts.nav.exchanges}</button>
            <button onClick={() => navigate('/contact')} className="hover:text-accent transition">{texts.nav.contact}</button>
            <button onClick={() => navigate('/beginner')} className="hover:text-accent transition">{texts.nav.beginnerGuide}</button>
          </div>
          <p className="text-muted-foreground text-sm mt-6">
            {language === 'zh' ? '祝您在币圈稳健获利，财富自由！' : 'Wishing you stable profits and financial freedom in crypto!'}
          </p>
        </div>
      </footer>
    </div>
  );
}
