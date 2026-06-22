import React from 'react';
import { Button } from './Button';

export const HeroSection: React.FC = () => {
  return (
    <section className="pt-32 pb-16 px-6 lg:px-20 mx-auto flex flex-col-reverse lg:flex-row items-center gap-12">
      {/* Content */}
      <div className="flex-1 flex flex-col items-end text-right gap-6">
        <h2 className="text-4xl lg:text-5xl font-bold text-brand-textDark leading-tight">
          אנחנו כאן בשבילך לכל צעד בתהליך!
        </h2>
        <p className="text-lg text-brand-textDark leading-relaxed max-w-lg">
         ברוכים הבאים הביתה. הצעד הבא הינו הגוף המוביל והמקצועי המהווה בית לקטועי הגפיים בישראל. אנחנו כאן כדי לעמוד לצדכם, לסייע, לתמוך ולעודד לאורך כל התהליך. החל משלב ראשוני של מידע וליווי אישי, ועד להשגת תותבות(פרוטזות) המיוצרות בטכנולוגיות מתקדמות, על מנת להגיע לעצמאות תפקודית מלאה.
מאז 2015 , הצעד הבא מאגד את קהילת הקטועים בישראל. מלווים אתכם בתהליך השיקום עם קבוצות ומפגשי העצמה, ספורט, תמיכה וליווי, לצד מתן דגש ומאמצים רבים כדי לשנות את גישת הרשויות בישראל לצרכיהם של הקטועים. יחד נעשה צעדים קטנים וגדולים כדי להגיע למצב בו תוכלו להגיע לחיי איכות גבוהים עם מירב היכולות הפיזיות ורמת תפקוד מקסימלית בסטנדרטים של המדינות המתקדמות בעולם.
        </p>
        
        <div className="mt-4">
          <Button variant="secondary" onClick={() => window.open('https://thenextstep.org.il/', '_blank')}>
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
            <img width="4341" height="1615" src="https://thenextstep.org.il/wp-content/uploads/2022/10/cropped-logo_f-04.png" className="attachment-full size-full wp-image-1632" alt="" srcSet="https://thenextstep.org.il/wp-content/uploads/2022/10/cropped-logo_f-04.png 4341w, https://thenextstep.org.il/wp-content/uploads/2022/10/cropped-logo_f-04-300x112.png 300w, https://thenextstep.org.il/wp-content/uploads/2022/10/cropped-logo_f-04-1024x381.png 1024w, https://thenextstep.org.il/wp-content/uploads/2022/10/cropped-logo_f-04-768x286.png 768w, https://thenextstep.org.il/wp-content/uploads/2022/10/cropped-logo_f-04-1536x571.png 1536w, https://thenextstep.org.il/wp-content/uploads/2022/10/cropped-logo_f-04-2048x762.png 2048w, https://thenextstep.org.il/wp-content/uploads/2022/10/cropped-logo_f-04-1320x491.png 1320w, https://thenextstep.org.il/wp-content/uploads/2022/10/cropped-logo_f-04-600x223.png 600w" sizes="(max-width: 4341px) 100vw, 4341px"/>
          </div>
        </div>
      </div>
    </section>
  );
};
