import React from 'react';
import { TopNavBar } from '../components/TopNavBar';
import { HeroSection } from '../components/HeroSection';
import { CTASection } from '../components/CTASection';
import { Button } from '../components/Button';

interface HomeProps {
  onNavigate?: (route: 'home' | 'login' | 'form' | 'contact' | 'dashboard' | 'admin') => void;
  isLoggedIn?: boolean;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, isLoggedIn }) => {
  return (
    <div className="min-h-screen bg-brand-bgLight relative overflow-hidden">
      <TopNavBar onNavigate={onNavigate} isLoggedIn={isLoggedIn} />
      
      {/* Atmospheric Background Element */}
      <div className="absolute top-[10%] right-[-150px] w-[600px] h-[600px] bg-gradient-to-br from-[#FEA776]/40 via-[#FEA776]/20 to-transparent blur-[120px] rounded-full pointer-events-none" />
<div className="absolute bottom-[20%] left-[-200px] w-[500px] h-[500px] bg-gradient-to-tr from-brand-primary/30 to-transparent blur-[100px] rounded-full pointer-events-none" />

      <main className="pt-24 pb-8 flex flex-col gap-6 lg:gap-8 justify-center min-h-[calc(100vh-64px)] relative z-10">
        {/* Actions Section */}
        <section className="px-6 lg:px-20 max-w-7xl mx-auto w-full flex justify-center">
          <div className="flex flex-wrap justify-center gap-4 w-full md:w-auto">
            <Button
              variant="primary"
              className="!px-8 shadow-lg hover:-translate-y-1 transition-transform"
              onClick={() => onNavigate && onNavigate('form')}
            >
              להרשמה ראשונית
            </Button>
            <Button
              variant="primary"
              className="!px-8 shadow-lg hover:-translate-y-1 transition-transform"
              onClick={() => onNavigate && onNavigate('login')}
            >
              כניסה לאיזור האישי
            </Button>
          </div>
        </section>

        <HeroSection />
      </main>
    </div>
  );
};
