import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { WelcomeGuide } from '@/components/WelcomeGuide';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/lib/i18n';
import { trpc } from '@/lib/trpc';
import {
  TrendingUp, Shield, CheckCircle2, Users, Gift, Zap,
  ChevronDown, BookOpen,
} from 'lucide-react';
import { useScrollMemory } from '@/hooks/useScrollMemory';
import { ScrollToTopButton } from "@/components/ScrollToTopButton";

// Emoji map for each exchange slug
const EXCHANGE_META: Record<string, { emoji: string; color: string }> = {
  gate:    { emoji: '🟢', color: 'from-blue-900 to-gray-900' },
  okx:     { emoji: '🔷', color: 'from-gray-800 to-gray-900' },
  binance: { emoji: '🟡', color: 'from-yellow-900 to-gray-900' },
  bybit:   { emoji: '🔵', color: 'from-orange-900 to-gray-900' },
  bitget:  { emoji: '🟣', color: 'from-teal-900 to-gray-900' },
};

export default function Home() {
  useScrollMemory();
  const { language, setLanguage } = useLanguage();
  const [, navigate] = useLocation();
  const texts = translations[language as keyof typeof translations];

  // Fetch exchange links from database
  const { data: exchangeLinksData } = trpc.exchanges.list.useQuery();

  const [showGuide, setShowGuide] = useState(() => {
    try { return !localStorage.getItem('crypto_guide_seen'); } catch { return true; }
  });
  const downloadRef = useRef<HTMLElement>(null);
  const comparisonRef = useRef<HTMLElement>(null);
  const insightRef = useRef<HTMLElement>(null);

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
      <section className="relative py-28 px-4 text-center overflow-hidden" style={{ background: 'linear-gradient(160deg, #0a192f 0%, #0f2744 40%, #0a1f38 70%, #0a192f 100%)' }}>
        {/* 背景装饰光晕 */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full" style={{ background: 'radial-gradient(ellipse, rgba(255,215,0,0.07) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(ellipse, rgba(255,165,0,0.05) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(ellipse, rgba(255,215,0,0.05) 0%, transparent 70%)' }} />
        </div>
        <div className="container mx-auto relative">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold px-4 py-2 rounded-full mb-8 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            {texts.hero.badge}
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-5 leading-tight tracking-tight">
            {texts.hero.title}
          </h1>
          <p className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#FFD700', textShadow: '0 0 30px rgba(255,215,0,0.3)' }}>{texts.hero.subtitle}</p>
          <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">{texts.hero.description}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-lg px-8 font-bold shadow-lg transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#0A192F', boxShadow: '0 4px 20px rgba(255,215,0,0.35)' }}
              onClick={() => insightRef.current?.scrollIntoView({ behavior: 'smooth' })}
            >
              {texts.hero.startBtn}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10 text-lg px-8 font-bold"
              onClick={() => comparisonRef.current?.scrollIntoView({ behavior: 'smooth' })}
            >
              {texts.hero.caseBtn}
            </Button>
          </div>
          <div className="mt-14 animate-bounce">
            <ChevronDown className="text-amber-400/60 mx-auto" size={28} />
          </div>
        </div>
      </section>

      {/* Newbie 3-Step Guide */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(180deg, rgba(23,42,69,0.4) 0%, rgba(10,25,47,0.8) 100%)' }}>
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-3" style={{ color: '#FFD700' }}>{texts.newbieGuide.title}</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">{texts.newbieGuide.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              { num: '1', title: texts.newbieGuide.step1, desc: texts.newbieGuide.step1Desc },
              { num: '2', title: texts.newbieGuide.step2, desc: texts.newbieGuide.step2Desc },
              { num: '3', title: texts.newbieGuide.step3, desc: texts.newbieGuide.step3Desc },
            ].map((step) => (
              <div key={step.num} className="group bg-card/60 backdrop-blur-sm p-8 rounded-2xl border border-amber-500/15 hover:border-amber-500/40 hover:bg-card/80 transition-all duration-300 text-center" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
                <div className="w-14 h-14 flex items-center justify-center mx-auto mb-5 rounded-2xl text-xl font-black text-black group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', boxShadow: '0 4px 12px rgba(255,215,0,0.3)' }}>
                  {step.num}
                </div>
                <h3 className="text-lg font-black text-white mb-3">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 bg-amber-500/8 border border-amber-500/25 rounded-xl p-4 text-center mb-8">
            <span className="text-amber-400 text-xl shrink-0">⚠️</span>
            <p className="text-amber-300 font-semibold text-sm">{texts.newbieGuide.warning}</p>
          </div>

          {/* Beginner Guide CTA */}
          <div className="bg-card/60 border border-amber-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.25)' }}>
                <BookOpen style={{ color: '#FFD700' }} size={28} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white mb-1">{texts.newbieGuide.learnMore}</h3>
                <p className="text-slate-400 text-sm">{texts.newbieGuide.learnMoreDesc}</p>
              </div>
            </div>
            <Button
              size="lg"
              className="whitespace-nowrap font-bold hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#0A192F', boxShadow: '0 4px 16px rgba(255,215,0,0.25)' }}
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
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-3" style={{ color: '#FFD700' }}>{texts.exchangeDownload.title}</h2>
            <p className="text-slate-400 text-lg">{texts.exchangeDownload.subtitle}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {(exchangeLinksData ?? []).map((ex) => {
              const meta = EXCHANGE_META[ex.slug] ?? { emoji: '💱', color: 'from-gray-800 to-gray-900' };
              return (
              <a
                key={ex.slug}
                href={ex.referralLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative bg-gradient-to-b ${meta.color} border border-amber-500/15 rounded-2xl p-6 flex flex-col items-center gap-3 hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-1`}
                style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}
              >
                <div className="text-4xl group-hover:scale-110 transition-transform duration-300">{meta.emoji}</div>
                <span className="text-base font-black text-white">{ex.name}</span>
                <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ background: 'rgba(255,215,0,0.15)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.25)' }}>返佣 {ex.rebateRate}</span>
                <span className="text-xs font-semibold" style={{ color: '#FFA500' }}>{texts.exchangeDownload.download} ↗</span>
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
      <section ref={insightRef as React.RefObject<HTMLElement>} className="py-20 px-4" style={{ background: 'linear-gradient(180deg, rgba(23,42,69,0.5) 0%, rgba(10,25,47,0.9) 100%)' }}>
        <div className="container mx-auto text-center">
          <h2 className="text-5xl font-black mb-4" style={{ color: '#FFD700', textShadow: '0 0 40px rgba(255,215,0,0.2)' }}>
            {language === 'zh' ? '什么是返佣？' : 'What is Rebate?'}
          </h2>
          <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            {language === 'zh'
              ? '返佣是交易所为了吸引新用户而提供的激励机制。当您通过邀请码注册时，交易所会自动将您的交易手续费的一部分返还给您，这就是返佣。'
              : 'Rebates are incentive mechanisms provided by exchanges to attract new users. When you register with a referral code, the exchange automatically returns a portion of your trading fees to you.'}
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {[
              { icon: <Gift size={28} />, title: language === 'zh' ? '自动返还' : 'Auto Return', desc: language === 'zh' ? '每笔交易手续费的一部分自动返还到您的账户' : 'A portion of each trade fee is automatically returned to your account' },
              { icon: <TrendingUp size={28} />, title: language === 'zh' ? '持续收益' : 'Ongoing Income', desc: language === 'zh' ? '只要您继续交易，就能持续获得返佣' : 'As long as you keep trading, you keep earning rebates' },
              { icon: <CheckCircle2 size={28} />, title: language === 'zh' ? '官方支持' : 'Official Support', desc: language === 'zh' ? '这是交易所官方的正规激励机制' : 'This is the official legitimate incentive mechanism of exchanges' },
            ].map((item, i) => (
              <div key={i} className="group bg-card/60 backdrop-blur-sm p-7 rounded-2xl border border-amber-500/15 hover:border-amber-500/40 hover:bg-card/80 transition-all duration-300" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform" style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)', color: '#FFD700' }}>
                  {item.icon}
                </div>
                <h3 className="font-black text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Insight */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <h2 className="text-4xl font-black mb-3" style={{ color: '#FFD700' }}>{texts.insight.title}</h2>
          <p className="text-slate-400 mb-12 text-lg">{texts.insight.subtitle}</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <TrendingUp size={26} />, title: texts.insight.cost.title, desc: texts.insight.cost.desc },
              { icon: <CheckCircle2 size={26} />, title: texts.insight.reduce.title, desc: texts.insight.reduce.desc },
              { icon: <Shield size={26} />, title: texts.insight.profit.title, desc: texts.insight.profit.desc },
            ].map((item, i) => (
              <div key={i} className="group bg-card/60 p-7 rounded-2xl border border-amber-500/15 hover:border-amber-500/35 hover:bg-card/80 transition-all duration-300" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)', color: '#FFD700' }}>
                  {item.icon}
                </div>
                <h3 className="text-lg font-black text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mechanism */}
      <section id="mechanism" className="py-20 px-4" style={{ background: 'linear-gradient(180deg, rgba(23,42,69,0.4) 0%, rgba(10,25,47,0.8) 100%)' }}>
        <div className="container mx-auto">
          <h2 className="text-4xl font-black mb-3" style={{ color: '#FFD700' }}>{texts.mechanism.title}</h2>
          <p className="text-slate-400 mb-12 text-lg">{texts.mechanism.subtitle}</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Users size={28} />, title: texts.mechanism.demand.title, desc: texts.mechanism.demand.desc, step: '01' },
              { icon: <Gift size={28} />, title: texts.mechanism.incentive.title, desc: texts.mechanism.incentive.desc, step: '02' },
              { icon: <CheckCircle2 size={28} />, title: texts.mechanism.winwin.title, desc: texts.mechanism.winwin.desc, step: '03' },
            ].map((item, i) => (
              <div key={i} className="group text-center relative">
                {/* 连接线 */}
                {i < 2 && <div className="hidden md:block absolute top-8 left-full w-full h-px z-0" style={{ background: 'linear-gradient(90deg, rgba(255,215,0,0.3), transparent)' }} />}
                <div className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,165,0,0.08))', border: '1px solid rgba(255,215,0,0.3)', color: '#FFD700' }}>
                  {item.icon}
                  <span className="absolute -top-2 -right-2 text-xs font-black rounded-full w-5 h-5 flex items-center justify-center" style={{ background: '#FFD700', color: '#0A192F', fontSize: '9px' }}>{item.step}</span>
                </div>
                <h3 className="text-lg font-black text-white mb-3">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison - New vs Old Users */}
      <section id="comparison" ref={comparisonRef as React.RefObject<HTMLElement>} className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <h2 className="text-4xl font-black mb-3" style={{ color: '#FFD700' }}>{texts.comparison.title}</h2>
          <p className="text-slate-400 mb-12 text-lg">{texts.comparison.subtitle}</p>
          <div className="grid md:grid-cols-2 gap-6">
            {/* New User — 黄色高亮 */}
            <div className="bg-card/60 p-8 rounded-2xl border" style={{ borderColor: 'rgba(255,215,0,0.4)', boxShadow: '0 4px 24px rgba(255,215,0,0.08)' }}>
              <div className="text-4xl mb-4">👤</div>
              <h3 className="text-xl font-black mb-6" style={{ color: '#FFD700' }}>{texts.comparison.newUser}</h3>
              {[texts.comparison.step1New, texts.comparison.step2New, texts.comparison.step3New].map((step, i) => (
                <div key={i} className="flex items-start gap-3 mb-4">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5" style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#0A192F' }}>{i + 1}</div>
                  <p className="text-slate-300 text-sm leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
            {/* Old User */}
            <div className="bg-card/60 p-8 rounded-2xl border border-white/10">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-black text-slate-300 mb-6">{texts.comparison.oldUser}</h3>
              {[texts.comparison.step1Old, texts.comparison.step2Old, texts.comparison.step3Old].map((step, i) => (
                <div key={i} className="flex items-start gap-3 mb-4">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5" style={{ background: 'rgba(255,215,0,0.15)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.25)' }}>{i + 1}</div>
                  <p className="text-slate-400 text-sm leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Case Study */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(180deg, rgba(23,42,69,0.4) 0%, rgba(10,25,47,0.8) 100%)' }}>
        <div className="container mx-auto">
          <h2 className="text-4xl font-black mb-3" style={{ color: '#FFD700' }}>{texts.caseStudy.title}</h2>
          <p className="text-slate-400 mb-12 text-lg">{texts.caseStudy.subtitle}</p>
          <div className="bg-card/60 rounded-2xl border p-8" style={{ borderColor: 'rgba(255,215,0,0.25)', boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,215,0,0.05)' }}>
            <div className="grid md:grid-cols-4 gap-4 text-center mb-8">
              {[
                { label: texts.caseStudy.monthlyVolume, value: '$1,000,000', color: '#ffffff' },
                { label: texts.caseStudy.standardFee, value: '$1,000', color: '#f87171' },
                { label: texts.caseStudy.rebateAmount, value: '$600', color: '#FFD700' },
                { label: texts.caseStudy.actualFee, value: '$400', color: '#4ade80' },
              ].map((item, i) => (
                <div key={i} className="bg-background/40 rounded-xl p-5 border border-white/5">
                  <p className="text-slate-500 text-xs font-medium mb-2 uppercase tracking-wider">{item.label}</p>
                  <p className="text-3xl font-black" style={{ color: item.color }}>{item.value}</p>
                </div>
              ))}
            </div>
            <div className="text-center border-t pt-6" style={{ borderColor: 'rgba(255,215,0,0.15)' }}>
              <p className="text-xl font-black mb-2" style={{ color: '#FFD700' }}>
                {texts.caseStudy.summary} <span className="text-3xl">$600</span>，{texts.caseStudy.yearly} <span className="text-3xl">$7,200</span>
              </p>
              <p className="text-slate-400 text-sm">{texts.caseStudy.profit}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Scenarios */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <h2 className="text-4xl font-black mb-3" style={{ color: '#FFD700' }}>{texts.scenarios.title}</h2>
          <p className="text-slate-400 mb-12 text-lg">{texts.scenarios.subtitle}</p>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: texts.scenarios.spot, points: [texts.scenarios.spotPoint1, texts.scenarios.spotPoint2, texts.scenarios.spotPoint3] },
              { title: texts.scenarios.futures, points: [texts.scenarios.futuresPoint1, texts.scenarios.futuresPoint2, texts.scenarios.futuresPoint3] },
            ].map((card, ci) => (
              <div key={ci} className="bg-card/60 p-8 rounded-2xl border border-amber-500/15 hover:border-amber-500/30 transition-all" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                <h3 className="text-xl font-black mb-6" style={{ color: '#FFD700' }}>{card.title}</h3>
                {card.points.map((p, i) => (
                  <div key={i} className="flex items-start gap-3 mb-3">
                    <CheckCircle2 className="shrink-0 mt-0.5" size={16} style={{ color: '#FFD700' }} />
                    <p className="text-slate-300 text-sm leading-relaxed">{p}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <p className="text-center font-bold mt-8 text-base" style={{ color: '#FFD700' }}>{texts.scenarios.note}</p>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="py-20 px-4" style={{ background: 'linear-gradient(180deg, rgba(23,42,69,0.4) 0%, rgba(10,25,47,0.8) 100%)' }}>
        <div className="container mx-auto">
          <h2 className="text-4xl font-black mb-3" style={{ color: '#FFD700' }}>{texts.security.title}</h2>
          <p className="text-slate-400 mb-12 text-lg">{texts.security.subtitle}</p>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { icon: <CheckCircle2 size={22} />, title: texts.security.official, desc: texts.security.officialDesc },
              { icon: <Shield size={22} />, title: texts.security.settlement, desc: texts.security.settlementDesc },
              { icon: <Shield size={22} />, title: texts.security.security1, desc: texts.security.security1Desc },
              { icon: <CheckCircle2 size={22} />, title: texts.security.standard, desc: texts.security.standardDesc },
            ].map((item, i) => (
              <div key={i} className="group bg-card/60 p-7 rounded-2xl border border-amber-500/15 hover:border-amber-500/30 transition-all" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)', color: '#FFD700' }}>
                    {item.icon}
                  </div>
                  <h3 className="text-base font-black text-white">{item.title}</h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed pl-13">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Summary & CTA */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <h2 className="text-4xl font-black mb-3" style={{ color: '#FFD700' }}>{texts.summary.title}</h2>
          <p className="text-slate-400 mb-12 text-lg">{texts.summary.subtitle}</p>
          <div className="space-y-5 mb-12">
            {[
              { title: texts.summary.point1, sub: texts.summary.point1Sub },
              { title: texts.summary.point2, sub: texts.summary.point2Sub },
              { title: texts.summary.point3, sub: texts.summary.point3Sub },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 bg-card/40 rounded-2xl p-5 border border-amber-500/10 hover:border-amber-500/25 transition-all">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(255,215,0,0.12)', color: '#FFD700' }}>
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white mb-1">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-card/60 p-8 rounded-2xl mb-12" style={{ borderTop: '3px solid #FFD700', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
            <div className="grid md:grid-cols-2 gap-8 text-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#FFD700' }}>{texts.summary.step1}</p>
                <p className="text-xl font-black text-white">{texts.summary.step1Title}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#FFD700' }}>{texts.summary.step2}</p>
                <p className="text-xl font-black text-white">{texts.summary.step2Title}</p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg text-slate-400 italic mb-8">{texts.summary.cta}</p>
            <Button
              size="lg"
              className="font-bold hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#0A192F', boxShadow: '0 4px 20px rgba(255,215,0,0.3)' }}
              onClick={() => navigate('/contact')}
            >
              {texts.summary.contactBtn}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t" style={{ background: 'rgba(10,25,47,0.95)', borderColor: 'rgba(255,215,0,0.1)' }}>
        <div className="container mx-auto text-center">
          <h3 className="text-2xl font-black text-white mb-3">
            {language === 'zh' ? '让每一笔交易都更具价値' : 'Make Every Trade More Valuable'}
          </h3>
          <p className="text-slate-500 mb-8 text-sm">
            {language === 'zh' ? '智慧交易，从省錢开始' : 'Smart Trading Starts with Savings'}
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <button onClick={() => navigate('/exchanges')} className="text-slate-500 hover:text-amber-400 transition font-medium">{texts.nav.exchanges}</button>
            <button onClick={() => navigate('/contact')} className="text-slate-500 hover:text-amber-400 transition font-medium">{texts.nav.contact}</button>
            <button onClick={() => navigate('/beginner')} className="text-slate-500 hover:text-amber-400 transition font-medium">{texts.nav.beginnerGuide}</button>
          </div>
          <p className="text-slate-600 text-xs mt-6">
            {language === 'zh' ? '祝您在币圈稳健获利，财富自由！' : 'Wishing you stable profits and financial freedom in crypto!'}
          </p>
        </div>
      </footer>
      {/* 右下角回到顶部按钮 */}
      <ScrollToTopButton color="yellow" />
    </div>
  );
}
