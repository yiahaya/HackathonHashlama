import React from 'react';

interface CTASectionProps {
  onNavigate?: (route: 'home' | 'login' | 'form' | 'contact' | 'dashboard' | 'admin') => void;
}

export const CTASection: React.FC<CTASectionProps> = ({ onNavigate }) => {
  return (
    <section className="px-6 lg:px-20 py-12 max-w-7xl mx-auto">
      <div className="bg-brand-secondary rounded-[48px] p-12 lg:p-16 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
        
        {/* Decorative Overlay */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>

        <div className="flex-1 text-right z-10">
          <h2 className="text-3xl lg:text-4xl font-semibold text-white mb-4">
            זקוקים לאוזן קשבת או ייעוץ מקצועי?
          </h2>
          <p className="text-lg text-white/90">
            הצוות שלנו כאן כדי ללוות אתכם מהרגע הראשון. אל תישארו לבד.
          </p>
        </div>

        <div className="z-10">
          <button 
            onClick={() => onNavigate && onNavigate('contact')}
            className="bg-white text-brand-primary font-medium text-xl px-8 py-5 rounded-full hover:bg-gray-50 transition-colors shadow-lg"
          >
            השאירו פנייה ונחזור אליכם
          </button>
        </div>
      </div>
    </section>
  );
};
