import React, { useState } from 'react';

interface SpeechControlsProps {
  textToSpeak: string;
  onDictate?: (text: string) => void;
  isDictating?: boolean;
  setIsDictating?: (isDictating: boolean) => void;
}

export const SpeechControls: React.FC<SpeechControlsProps> = ({ textToSpeak, onDictate, isDictating, setIsDictating }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

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
      alert("הדפדפן שלך אינו תומך בהקראת טקסט");
    }
  };

  const handleDictate = () => {
    if (!onDictate || !setIsDictating) return;
    
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("הדפדפן שלך אינו תומך בהכתבה קולית");
      return;
    }

    if (isDictating) {
      setIsDictating(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'he-IL';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsDictating(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onDictate(transcript);
      setIsDictating(false);
    };

    recognition.onerror = () => {
      setIsDictating(false);
    };

    recognition.onend = () => {
      setIsDictating(false);
    };

    recognition.start();
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
      
      {onDictate && (
        <button 
          type="button"
          onClick={handleDictate}
          className={`p-2 rounded-full transition-colors ${isDictating ? 'text-red-500 bg-red-50 animate-pulse' : 'text-gray-400 hover:text-brand-primary hover:bg-gray-50'}`}
          title="הכתבה קולית"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
        </button>
      )}
    </div>
  );
};
