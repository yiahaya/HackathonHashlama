import React from 'react';
import { Button } from './Button';

export const HeroSection: React.FC = () => {
  return (
    <section className="pt-32 pb-16 px-6 lg:px-20 max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-12">
      {/* Content */}
      <div className="flex-1 flex flex-col items-end text-right gap-6">
        <h2 className="text-4xl lg:text-5xl font-bold text-brand-textDark leading-tight">
          אנחנו כאן בשבילך לכל צעד בתהליך!
        </h2>
        <p className="text-lg text-brand-textDark leading-relaxed max-w-lg">
          טקסט המתאר את עמותת "הצעד הבא". העמותה מלווה קטועי גפיים ובני משפחותיהם בכל שלבי השיקום וההתמודדות.
        </p>
        
        <div className="mt-4">
          <Button variant="secondary">
            קראו עלינו עוד
          </Button>
        </div>
      </div>

      {/* Visual Element */}
      <div className="flex-1 relative">
        <div className="absolute -inset-4 bg-brand-primary/10 rounded-3xl -z-10"></div>
        <div className="bg-gray-200 rounded-[48px] overflow-hidden shadow-xl aspect-video relative">
          {/* Placeholder for the image in the design */}
          <div className="absolute inset-0 bg-brand-light/40 flex items-center justify-center">
            <span className="text-brand-primary font-medium">תמונה מהשטח</span>
          </div>
        </div>
      </div>
    </section>
  );
};
