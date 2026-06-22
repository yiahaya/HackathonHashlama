import React, { useState, useEffect, useRef } from 'react';

interface VoiceAssistantProps {
  onNavigate: (route: 'home' | 'login' | 'form' | 'contact' | 'dashboard') => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onNavigate }) => {
  const [isListening, setIsListening] = useState(true); // Always listen for wake word
  const [isAwake, setIsAwake] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sleepTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const restartRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }
  };

  const goToSleep = () => {
    setIsAwake(false);
    setCurrentTranscript('');
    restartRecognition();
  };

  const wakeUp = () => {
    setIsAwake(true);
    resetSleepTimeout();
    restartRecognition();
  };

  const resetSleepTimeout = () => {
    if (sleepTimeoutRef.current) clearTimeout(sleepTimeoutRef.current);
    sleepTimeoutRef.current = setTimeout(goToSleep, 3000); // Go to sleep after 15 seconds of inactivity
  };

  useEffect(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'he-IL';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const text = finalTranscript || interimTranscript;
      const lowerText = text.toLowerCase();

      // Check for wake word if not awake
      setIsAwake((currentlyAwake) => {
        if (!currentlyAwake) {
          if (lowerText.includes('שלום צחי')) {
            resetSleepTimeout();
            
            const command = lowerText.split('שלום צחי')[1]?.trim();
            if (command) {
              setCurrentTranscript(command);
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              timeoutRef.current = setTimeout(() => {
                processCommand(command);
              }, 1500);
            } else {
              setCurrentTranscript('כן, אני מקשיב...');
              restartRecognition(); // Flush the wake word so it doesn't leak into the next command
            }
            return true; // Set isAwake to true
          }
          return false; // Remain asleep
        } else {
          // If already awake
          resetSleepTimeout();
          setCurrentTranscript(text.trim());

          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          if (text.trim()) {
            timeoutRef.current = setTimeout(() => {
              processCommand(text.trim());
            }, 1500);
          }
          return true;
        }
      });
    };

    recognition.onend = () => {
      // Always restart listening if it ends
      if (isListening) {
        try {
          recognition.start();
        } catch (e) {}
      }
    };

    recognition.onerror = (e: any) => {
      console.error("Speech recognition error", e.error);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
  }, [isListening]); // Re-run if isListening changes (even though we keep it true)

  useEffect(() => {
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {}
    } else if (!isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const processCommand = (text: string) => {
    const result = handleCommand(text);
    if (result === true) {
      setCurrentTranscript('');
      restartRecognition(); // Clear the buffer after successful command execution
    } else if (result === false) {
      setCurrentTranscript('הפקודה לא קיימת, תנסה "עזרה"');
      setTimeout(() => {
        setCurrentTranscript((prev) => prev === 'הפקודה לא קיימת, תנסה "עזרה"' ? '' : prev);
      }, 3000);
    } else if (typeof result === 'string') {
      setCurrentTranscript(result);
      restartRecognition(); // Clear the buffer after successful help command
      setTimeout(() => {
        setCurrentTranscript((prev) => prev === result ? '' : prev);
      }, 5000);
    }
  };

  const handleCommand = (text: string): boolean | string => {
    console.log("Voice Command Received:", text);
    const lowerText = text.toLowerCase();

    // 0. Help
    if (lowerText === 'עזרה' || lowerText.includes('מה הפקודות')) {
      return "פקודות אפשריות:\n• עבור ל[בית/התחברות/טופס...]\n• בשדה [שם] תכתוב [טקסט]\n• בשדה [שם] תבחר [אופציה]\n• לחץ על [טקסט כפתור]";
    }

    // 1. Navigation
    if (lowerText.includes('עבור לבית') || lowerText.includes('דף הבית') || lowerText === 'בית') {
      onNavigate('home');
      return true;
    }
    if (lowerText.includes('עבור להתחברות') || lowerText.includes('התחברות')) {
      onNavigate('login');
      return true;
    }
    if (lowerText.includes('עבור לצור קשר') || lowerText.includes('צור קשר')) {
      onNavigate('contact');
      return true;
    }
    if (lowerText.includes('עבור לטופס') || lowerText.includes('טופס')) {
      onNavigate('form');
      return true;
    }
    if (lowerText.includes('עבור לאזור אישי') || lowerText.includes('אזור אישי')) {
      onNavigate('dashboard');
      return true;
    }

    // 2. Buttons (e.g. "לחץ על כניסה")
    if (lowerText.startsWith('לחץ על ')) {
      const buttonText = lowerText.replace('לחץ על ', '').trim();
      const buttons = Array.from(document.querySelectorAll('button, a'));
      const targetButton = buttons.find(b => b.textContent?.trim().includes(buttonText)) as HTMLElement;
      if (targetButton) {
        targetButton.click();
        return true;
      }
    }

    // 3. Form Fields (e.g. "בשדה דואר אלקטרוני תכתוב test@test.com")
    const typeMatch = lowerText.match(/בשדה\s+(.*?)\s+תכתוב\s+(.*)/);
    if (typeMatch) {
      const fieldName = typeMatch[1].trim();
      const fieldValue = typeMatch[2].trim();

      const labels = Array.from(document.querySelectorAll('label'));
      const targetLabel = labels.find(l => l.textContent?.trim().includes(fieldName));
      
      if (targetLabel) {
        // Find adjacent input or textarea, or one inside the label's parent
        const input = targetLabel.parentElement?.querySelector('input:not([type="checkbox"]):not([type="radio"]), textarea') as HTMLInputElement | HTMLTextAreaElement;
        
        if (input) {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
          const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;

          if (input.tagName === 'INPUT' && nativeInputValueSetter) {
            nativeInputValueSetter.call(input, fieldValue);
          } else if (input.tagName === 'TEXTAREA' && nativeTextAreaValueSetter) {
            nativeTextAreaValueSetter.call(input, fieldValue);
          }

          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
      }
    }

    // 4. Select / Radio / Checkbox (e.g. "בשדה סוג קטיעה תבחר יד")
    // Match תבחר or תבחרי
    const selectMatch = lowerText.match(/בשדה\s+(.*?)\s+(?:תבחר|תבחרי)\s+(.*)/);
    if (selectMatch) {
      const fieldName = selectMatch[1].trim();
      const optionName = selectMatch[2].trim();

      const labels = Array.from(document.querySelectorAll('label'));
      // Find main label
      const targetLabel = labels.find(l => l.textContent?.trim().includes(fieldName));
      
      if (targetLabel && targetLabel.parentElement) {
        // Handle <select>
        const select = targetLabel.parentElement.querySelector('select');
        if (select) {
          const options = Array.from(select.options);
          const targetOption = options.find(o => o.text.trim().includes(optionName));
          if (targetOption) {
            const nativeSelectValueSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value")?.set;
            if (nativeSelectValueSetter) {
              nativeSelectValueSetter.call(select, targetOption.value);
              select.dispatchEvent(new Event('change', { bubbles: true }));
            }
            return true;
          }
        }

        // Handle Radio / Checkbox
        // They are inside the same parent container, usually wrapped in labels
        const optionLabels = Array.from(targetLabel.parentElement.querySelectorAll('label'));
        const targetOptionLabel = optionLabels.find(l => l !== targetLabel && l.textContent?.trim().includes(optionName));
        if (targetOptionLabel) {
          // Instead of clicking input directly, click the label or use native setter
          const input = targetOptionLabel.querySelector('input[type="radio"], input[type="checkbox"]') as HTMLInputElement;
          if (input) {
            const nativeCheckboxSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "checked")?.set;
            if (nativeCheckboxSetter) {
              if (input.type === 'radio') {
                nativeCheckboxSetter.call(input, true);
              } else {
                nativeCheckboxSetter.call(input, !input.checked); // Toggle
              }
              input.dispatchEvent(new Event('change', { bubbles: true }));
              input.dispatchEvent(new Event('click', { bubbles: true }));
              return true;
            }
          }
        }
      }
    }

    return false;
  };

  return (
    <div className="fixed bottom-24 right-6 z-[9999] flex items-center gap-4" dir="rtl">
      <button
        onClick={() => {
          if (isAwake) {
            goToSleep();
          } else {
            setIsListening(true);
            wakeUp();
            setCurrentTranscript('כן, אני מקשיב...');
          }
        }}
        className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 border-4 border-white shrink-0 ${isAwake ? 'bg-red-500 animate-pulse scale-110' : 'bg-brand-primary hover:bg-brand-primary/90'}`}
        title={isAwake ? "הפסק עוזר קולי" : "הפעל עוזר קולי"}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
      </button>

      {currentTranscript && isAwake && (
        <div className="bg-white px-5 py-3 rounded-2xl shadow-xl border border-brand-primary/20 text-brand-textDark max-w-[280px] break-words text-base font-medium relative animate-in fade-in zoom-in duration-200 whitespace-pre-line leading-relaxed">
          {currentTranscript}
          <div className="absolute top-1/2 -right-2 w-4 h-4 bg-white border-t border-r border-brand-primary/20 transform -translate-y-1/2 rotate-45"></div>
        </div>
      )}
    </div>
  );
};

