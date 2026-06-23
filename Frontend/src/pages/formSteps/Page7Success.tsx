import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Button } from '../../components/Button';

interface Props {
  onComplete: () => void;
}

export const Page7Success: React.FC<Props> = ({ onComplete }) => {
  useEffect(() => {
    // Fire confetti on mount
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#8D4B00', '#FFAD72']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#8D4B00', '#FFAD72']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-3xl font-bold text-brand-primary text-center">הטופס נשלח בהצלחה!</h2>
      <p className="text-brand-textDark text-lg text-center max-w-md">
        תודה רבה על השיתוף. צוות העמותה יבחן את הפרטים ויחזור אליכם בהקדם במידת הצורך.
      </p>
      <div className="mt-8">
        <Button onClick={onComplete}>מעבר לאזור האישי</Button>
      </div>
    </div>
  );
};
