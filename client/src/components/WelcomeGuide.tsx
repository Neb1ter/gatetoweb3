import { X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface WelcomeGuideProps {
  onClose: () => void;
  onSelectNewUser: () => void;
  onSelectOldUser: () => void;
}

export function WelcomeGuide({ onClose, onSelectNewUser, onSelectOldUser }: WelcomeGuideProps) {
  const { language } = useLanguage();

  const texts = {
    zh: {
      title: '👋 欢迎！请选择您的身份',
      subtitle: '我们将为您推荐最适合的内容',
      newUser: '🆕 我是新人',
      newUserDesc: '我想快速了解如何通过邀请码省钱交易',
      oldUser: '👥 我是老用户',
      oldUserDesc: '我想了解如何为现有账户配置返佣',
      skip: '跳过导览',
    },
    en: {
      title: '👋 Welcome! Please Select Your Identity',
      subtitle: 'We will recommend the most suitable content for you',
      newUser: '🆕 I\'m New',
      newUserDesc: 'I want to quickly learn how to save money through referral codes',
      oldUser: '👥 I\'m Existing User',
      oldUserDesc: 'I want to configure rebates for my existing account',
      skip: 'Skip Guide',
    },
  };

  const t = texts[language as keyof typeof texts];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-accent rounded-lg p-8 max-w-2xl w-full shadow-2xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-accent mb-2">{t.title}</h2>
            <p className="text-muted-foreground">{t.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-accent transition"
          >
            <X size={24} />
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={onSelectNewUser}
            className="bg-accent/10 border border-accent rounded-lg p-6 hover:bg-accent/20 transition text-left"
          >
            <div className="text-3xl mb-3">{t.newUser}</div>
            <p className="text-muted-foreground">{t.newUserDesc}</p>
          </button>
          <button
            onClick={onSelectOldUser}
            className="bg-accent/10 border border-accent rounded-lg p-6 hover:bg-accent/20 transition text-left"
          >
            <div className="text-3xl mb-3">{t.oldUser}</div>
            <p className="text-muted-foreground">{t.oldUserDesc}</p>
          </button>
        </div>
        <button
          onClick={onClose}
          className="w-full text-muted-foreground hover:text-accent transition py-2 border border-border rounded"
        >
          {t.skip}
        </button>
      </div>
    </div>
  );
}
