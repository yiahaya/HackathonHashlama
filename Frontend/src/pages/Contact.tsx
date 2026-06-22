import React, { useState } from 'react';
import { TopNavBar } from '../components/TopNavBar';
import { Button } from '../components/Button';
import { SpeechControls } from '../components/form/SpeechControls';

interface ContactProps {
  onNavigate?: (route: 'home' | 'login' | 'form' | 'contact' | 'dashboard') => void;
  isLoggedIn?: boolean;
}

export const Contact: React.FC<ContactProps> = ({ onNavigate, isLoggedIn }) => {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isDictatingPhone, setIsDictatingPhone] = useState(false);
  const [isDictatingEmail, setIsDictatingEmail] = useState(false);
  const [isDictatingDesc, setIsDictatingDesc] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !email || !description) {
      alert('אנא מלא את כל השדות');
      return;
    }
    
    const payload = {
      phone,
      email,
      description
    };
    
    console.log('Contact Form Submitted:', JSON.stringify(payload, null, 2));
    
    // API Call would go here
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    onNavigate?.('home');
  };

  return (
    <div className="min-h-screen bg-brand-bgLight relative overflow-hidden">
      <TopNavBar onNavigate={onNavigate} isLoggedIn={isLoggedIn} />
      
      {/* Atmospheric Background Element */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-primary/10 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#FEA776]/10 blur-[100px] rounded-full pointer-events-none" />

      <main className="pt-32 pb-16 px-6 flex justify-center items-center relative z-10">
        <div className="w-full max-w-[700px] flex flex-col gap-10">
          
          <div className="text-center flex flex-col gap-4">
            <h2 className="text-3xl font-bold text-brand-primary">פנייה למנהלי העמותה</h2>
            <p className="text-lg text-brand-textDark">
              נשמח לעזור בכל שאלה או בקשה. מלאו את הפרטים ונחזור אליכם בהקדם.
              <br />
              או בטלפון: <a href="tel:1-700-554-700" className="font-bold text-brand-primary hover:underline" dir="ltr">1-700-554-700</a>
            </p>
          </div>

          <div className="bg-white border border-[#DBC2B2]/40 shadow-sm rounded-3xl p-10">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-right text-sm font-semibold text-[#1C1C19]">מספר טלפון</label>
                  <div className="relative w-full">
                    <input 
                      type="tel"
                      dir="ltr"
                      placeholder="050-0000000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-[#DBC2B2] rounded-xl pr-4 pl-24 py-3 text-right focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-[#554337] placeholder:text-[#554337]/40"
                    />
                    <SpeechControls 
                      textToSpeak={`מספר טלפון. ${phone}`}
                      onDictate={(t) => setPhone(phone ? phone + ' ' + t : t)}
                      isDictating={isDictatingPhone}
                      setIsDictating={setIsDictatingPhone}
                    />
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-right text-sm font-semibold text-[#1C1C19]">מייל</label>
                  <div className="relative w-full">
                    <input 
                      type="email"
                      dir="ltr"
                      placeholder="example@mail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-[#DBC2B2] rounded-xl pr-4 pl-24 py-3 text-right focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-[#554337] placeholder:text-[#554337]/40"
                    />
                    <SpeechControls 
                      textToSpeak={`מייל. ${email}`}
                      onDictate={(t) => setEmail(email ? email + ' ' + t : t)}
                      isDictating={isDictatingEmail}
                      setIsDictating={setIsDictatingEmail}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-right text-sm font-semibold text-[#1C1C19]">תיאור הפנייה</label>
                <div className="relative w-full">
                  <textarea 
                    dir="rtl"
                    placeholder="איך נוכל לעזור?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-[#DBC2B2] rounded-xl pr-4 pl-24 py-3 text-right focus:outline-none focus:ring-2 focus:ring-brand-primary/50 min-h-[170px] text-[#554337] placeholder:text-[#554337]/40 resize-none"
                  />
                  <SpeechControls 
                    textToSpeak={`תיאור הפנייה. ${description}`}
                    onDictate={(t) => setDescription(description ? description + ' ' + t : t)}
                    isDictating={isDictatingDesc}
                    setIsDictating={setIsDictatingDesc}
                  />
                </div>
              </div>

              <div className="flex justify-center mt-4">
                <Button type="submit" className="!px-12 !py-4 text-lg w-full md:w-auto">
                  הגש פנייה
                </Button>
              </div>

            </form>
          </div>
        </div>
      </main>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-[#1C1C19]/40 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="relative bg-[#FCF9F4] border border-[#DBC2B2]/20 rounded-[32px] shadow-2xl p-8 max-w-[448px] w-full mx-4 flex flex-col items-center text-center gap-6 z-10">
            
            {/* Success Icon */}
            <div className="w-24 h-24 bg-brand-light/40 rounded-full flex items-center justify-center mt-2">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="#8E4900" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <h3 className="text-3xl font-bold text-brand-primary">הפנייה הוגשה בהצלחה</h3>
              <p className="text-lg text-brand-textDark">ניצור איתך קשר בהקדם</p>
            </div>

            <Button variant="outline" className="w-full mt-4 !border-brand-primary !text-brand-primary !text-xl !py-4 font-bold" onClick={handleCloseModal}>
              סגור
            </Button>
            
          </div>
        </div>
      )}

    </div>
  );
};
