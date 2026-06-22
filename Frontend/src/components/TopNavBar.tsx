import React from 'react';

export const TopNavBar: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-brand-bgLight backdrop-blur-md shadow-sm z-50 flex items-center px-6 lg:px-20">
      <div className="flex justify-between items-center w-full max-w-7xl mx-auto">
        {/* Contact Link */}
        <a href="#contact" className="text-brand-primary font-medium text-sm hover:underline">
          צור קשר
        </a>

        {/* Logo / Brand Name */}
        <div className="flex-1 flex justify-end">
          <h1 className="text-brand-primary font-extrabold text-2xl">
            עמותת "הצעד הבא"
          </h1>
        </div>
      </div>
    </header>
  );
};
