import React from 'react';
import { Button } from './Button';

export const HeroSection: React.FC = () => {
  return (
    <section className="px-6 lg:px-20 max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-24 w-full">
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

        <div className="flex flex-col sm:flex-row items-center gap-10 mt-4">
          <div className="flex items-center gap-4">
            {/* Instagram */}
            <a href="https://www.instagram.com/the.next.step.il?igsh=MTc4ejRjeHgyNmRtOA==" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:scale-110 hover:bg-brand-primary/5 transition-all border border-brand-primary/20 p-2 rounded-full">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            {/* TikTok */}
            <a href="https://www.tiktok.com/@thenextstep_israel?_r=1&_t=ZS-97QPvl9aPtC" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:scale-110 hover:bg-brand-primary/5 transition-all border border-brand-primary/20 p-2 rounded-full">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.22-1.15 4.39-2.9 5.67-1.74 1.29-4.04 1.71-6.13 1.2-2.18-.53-4.02-2.07-4.88-4.14-.88-2.14-.65-4.66.58-6.62 1.25-1.99 3.49-3.3 5.82-3.48v4.06c-1.07.13-2.13.71-2.79 1.57-.68.88-.93 2.05-.67 3.12.24 1.05.99 1.94 1.96 2.37.99.45 2.18.42 3.14-.08 1.05-.55 1.78-1.55 1.95-2.72.08-.55.08-1.1.06-1.65v-16h4.03z"/></svg>
            </a>
            {/* YouTube */}
            <a href="https://youtube.com/channel/UC9jFwT0_FwzwFuaRXPAOR7Q?si=6Ri_ObWO_DYA1eOR" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:scale-110 hover:bg-brand-primary/5 transition-all border border-brand-primary/20 p-2 rounded-full">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
            </a>
            {/* Facebook */}
            <a href="https://www.facebook.com/thenextstepisrael/" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:scale-110 hover:bg-brand-primary/5 transition-all border border-brand-primary/20 p-2 rounded-full">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
          </div>
          <Button variant="secondary" onClick={() => window.open('https://thenextstep.org.il/', '_blank')} className="px-8 shadow-sm">
            קראו עלינו עוד
          </Button>
        </div>
      </div>
    </section>
  );
};
