import React, { useState, useEffect, useRef } from 'react';
import { SpeechControls } from './form/SpeechControls';

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Doc {
  title: string;
  url: string;
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  docs?: Doc[];
}

export const AIChatModal: React.FC<AIChatModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [isDictating, setIsDictating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !sessionId) {
      setSessionId(crypto.randomUUID());
      setMessages([{
        id: 'welcome',
        role: 'ai',
        content: 'שלום! אני העוזר החכם של "כל זכות" ויכול לעזור לך בבירור זכויות. במה אוכל לעזור היום?'
      }]);
    }
  }, [isOpen, sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userText = inputText.trim();
    setInputText('');
    
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/w/he/rest.php/kzchatbot/v0/question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: userText,
          uuid: sessionId,
          referrer: 1
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: data.llmResult || 'לא הצלחתי למצוא תשובה מדויקת, אנא נסו שוב.',
        docs: data.docs || []
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: 'אופס, אירעה שגיאה בתקשורת מול השרת. אנא נסה שוב מאוחר יותר.'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-[#1C1C19]/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative bg-[#FCF9F4] w-full max-w-2xl h-[80vh] rounded-[32px] shadow-2xl flex flex-col border border-[#DBC2B2]/40 overflow-hidden" dir="rtl">
        
        {/* Header */}
        <div className="bg-brand-primary p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-inner">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FEA776" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">שוחח עם AI</h3>
              <p className="text-brand-light text-xs opacity-90">מופעל על ידי מאגר המידע של כל זכות</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-hide bg-brand-bgLight">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${msg.role === 'user' ? 'bg-[#DBC2B2] text-[#1C1C19] rounded-tr-sm' : 'bg-white border border-[#EBE8E3] text-[#554337] rounded-tl-sm'}`}>
                <div className="whitespace-pre-wrap leading-relaxed text-sm">
                  {msg.content}
                </div>
                
                {/* Document Links */}
                {msg.docs && msg.docs.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-2">
                    <span className="text-xs font-bold text-brand-primary">מקורות להרחבה:</span>
                    <ul className="flex flex-col gap-1 list-disc list-inside">
                      {msg.docs.map((doc, idx) => (
                        <li key={idx} className="text-xs">
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline hover:text-orange-700">
                            {doc.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-[#EBE8E3] rounded-2xl p-4 rounded-tl-sm shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-brand-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-brand-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-brand-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-[#DBC2B2]/40 flex gap-2 items-end shrink-0 relative">
          <div className="relative flex-1">
            <textarea
              className="w-full border border-gray-300 rounded-2xl pr-4 pl-24 py-3 text-right focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors min-h-[50px] max-h-[120px] resize-none"
              placeholder="כתוב הודעה..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <SpeechControls 
              textToSpeak="תיבת צ'אט"
              onDictate={(t) => setInputText(inputText ? inputText + ' ' + t : t)}
              isDictating={isDictating}
              setIsDictating={setIsDictating}
            />
          </div>
          
          <button 
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className="w-[50px] h-[50px] rounded-full bg-brand-primary text-white flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-primary/90 transition-colors shadow-md"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform rotate-180 -ml-1">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
