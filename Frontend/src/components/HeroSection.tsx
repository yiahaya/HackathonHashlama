import React from 'react';
import { Button } from './Button';

export const HeroSection: React.FC = () => {
  return (
    <section className="px-6 lg:px-20 max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-8 lg:gap-12 w-full">
      {/* Content */}
      <div className="flex-1 flex flex-col items-end text-right gap-4 lg:gap-6">
        <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-brand-textDark">
          אנחנו כאן בשבילך לכל צעד בתהליך!
        </h2>
        <p className="text-base lg:text-lg text-brand-textDark">
          ברוכים הבאים הביתה. הצעד הבא הינו הגוף המוביל והמקצועי המהווה בית לקטועי הגפיים בישראל. אנחנו כאן כדי לעמוד לצדכם, לסייע, לתמוך ולעודד לאורך כל התהליך. החל משלב ראשוני של מידע וליווי אישי, ועד להשגת תותבות(פרוטזות) המיוצרות בטכנולוגיות מתקדמות, על מנת להגיע לעצמאות תפקודית מלאה.
          מאז 2015 , הצעד הבא מאגד את קהילת הקטועים בישראל. מלווים אתכם בתהליך השיקום עם קבוצות ומפגשי העצמה, ספורט, תמיכה וליווי, לצד מתן דגש ומאמצים רבים כדי לשנות את גישת הרשויות בישראל לצרכיהם של הקטועים.
        </p>
        <p className="text-base lg:text-lg text-brand-textDark font-bold">
          זקוקים לאוזן קשבת או ייעוץ מקצועי?
          הצוות שלנו כאן כדי ללוות אתכם מהרגע הראשון. אל תישארו לבד.
        </p>
      </div>

      {/* Visual Element */}
      <div className="flex-1 relative w-full flex flex-col items-center gap-6">
        <div className="absolute -inset-4 bg-brand-primary/10 rounded-[3rem] -z-10"></div>
        <div className="bg-white/50 backdrop-blur-sm border border-brand-primary/10 rounded-[2.5rem] overflow-hidden shadow-lg aspect-[16/8] relative p-6 flex items-center justify-center w-full">
          <img width="4341" height="1615" src="https://thenextstep.org.il/wp-content/uploads/2022/10/cropped-logo_f-04.png" className="w-full h-full object-contain" alt="The Next Step Logo" srcSet="https://thenextstep.org.il/wp-content/uploads/2022/10/cropped-logo_f-04.png 4341w, https://thenextstep.org.il/wp-content/uploads/2022/10/cropped-logo_f-04-300x112.png 300w, https://thenextstep.org.il/wp-content/uploads/2022/10/cropped-logo_f-04-1024x381.png 1024w, https://thenextstep.org.il/wp-content/uploads/2022/10/cropped-logo_f-04-768x286.png 768w" sizes="(max-width: 4341px) 100vw, 4341px" />
        </div>

        <div>
          <Button variant="secondary" onClick={() => window.open('https://thenextstep.org.il/', '_blank')} className="px-8 shadow-sm">
            קראו עלינו עוד
          </Button>
        </div>
      </div>
    </section>
  );
};
