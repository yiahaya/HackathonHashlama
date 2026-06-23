import React from 'react';

interface TopNavBarProps {
  onNavigate?: (route: any) => void;
  isLoggedIn?: boolean;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({ onNavigate }) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#FCF9F4]/80 backdrop-blur-md shadow-[0_1px_2px_rgba(0,0,0,0.05)] z-50 px-6 lg:px-8">
      <div className="relative flex items-center justify-between w-full max-w-[1280px] mx-auto h-full" dir="rtl">
        
        {/* Logo / Brand Name */}
        <div className="flex items-center gap-4 z-10">
          <h1 
            className="text-[#8D4B00] font-extrabold text-2xl font-rubik leading-loose cursor-pointer"
            onClick={() => onNavigate?.('home')}
          >
            עמותת “הצעד הבא”
          </h1>
        </div>

        {/* Navigation Links */}
        <nav className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-4 md:gap-6 bg-white/40 border border-[#8D4B00]/25 px-4 py-1 rounded-full backdrop-blur-sm">
          <button 
            onClick={() => onNavigate?.('qna')}
            className="text-[#8D4B00] font-semibold text-sm md:text-base font-rubik hover:opacity-85 transition-opacity py-1 px-2"
          >
            שאלות ותשובות
          </button>
          <span className="text-[#8D4B00]/30 font-light">|</span>
          <button 
            onClick={() => onNavigate?.('contact')}
            className="text-[#8D4B00] font-semibold text-sm md:text-base font-rubik hover:opacity-85 transition-opacity py-1 px-2"
          >
            צור קשר
          </button>
        </nav>
        
      </div>
    </header>
  );
};
