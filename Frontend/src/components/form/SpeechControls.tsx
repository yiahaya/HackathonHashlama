import React, { useState } from 'react';
import { useSnackbar } from '../../contexts/SnackbarContext';

interface SpeechControlsProps {
  textToSpeak: string;
}

export const SpeechControls: React.FC<SpeechControlsProps> = ({ textToSpeak }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { showSnackbar } = useSnackbar();

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }
      
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'he-IL';
      utterance.onend = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } else {
      showSnackbar("הדפדפן שלך אינו תומך בהקראת טקסט", 'error');
    }
  };

  return (
    <div className="absolute left-3 top-3 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-1 rounded-full">
      <button 
        type="button" 
        onClick={handleSpeak}
        className={`p-2 rounded-full transition-colors ${isSpeaking ? 'text-brand-primary bg-brand-primary/10' : 'text-gray-400 hover:text-brand-primary hover:bg-gray-50'}`}
        title="הקרא טקסט"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
      </button>
    </div>
  );
};
