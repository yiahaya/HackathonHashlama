import React from 'react';
import { TopNavBar } from '../components/TopNavBar';
import { HeroSection } from '../components/HeroSection';
import { CTASection } from '../components/CTASection';
import { Button } from '../components/Button';

interface HomeProps {
  onNavigate?: (route: 'home' | 'login' | 'form' | 'contact' | 'dashboard') => void;
  isLoggedIn?: boolean;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, isLoggedIn }) => {
  return (
    <div className="min-h-screen bg-brand-bgLight">
      <TopNavBar onNavigate={onNavigate} isLoggedIn={isLoggedIn} />
      <main className="pt-24 pb-16 flex flex-col gap-12">
        {/* Actions Section */}
        <section className="px-6 lg:px-20 max-w-7xl mx-auto w-full flex justify-center mt-8">
          <div className="flex flex-wrap justify-center gap-4 w-full md:w-auto">
            <Button
              variant="primary"
              className="!px-8"
              onClick={() => onNavigate && onNavigate('form')}
            >
              להרשמה ראשונית
            </Button>
            <Button
              variant="primary"
              className="!px-8"
              onClick={() => onNavigate && onNavigate('login')}
            >
              כניסה לאיזור האישי
            </Button>
          </div>
        </section>

        <HeroSection />
        <CTASection onNavigate={onNavigate} />
      </main>
    </div>
  );
};
