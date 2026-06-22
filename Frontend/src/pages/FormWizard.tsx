import React, { useState } from 'react';
import { initialFormData, type FormData } from '../types/form';
import { TopNavBar } from '../components/TopNavBar';
import { Page1Start } from './formSteps/Page1Start';
import { Page2AmputeeDetails } from './formSteps/Page2AmputeeDetails'
import { Page3ParentDetails } from './formSteps/Page3ParentDetails';
import { Page4Amputation } from './formSteps/Page4Amputation';
import { Page5Prosthesis } from './formSteps/Page5Prosthesis';
import { Page6General } from './formSteps/Page6General';
import { Page7Success } from './formSteps/Page7Success';

interface FormWizardProps {
  onNavigate?: (route: 'home' | 'login' | 'form' | 'contact' | 'dashboard') => void;
}

export const FormWizard: React.FC<FormWizardProps> = ({ onNavigate }) => {
  const [data, setData] = useState<FormData>(initialFormData);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const updateData = (section: keyof FormData, fields: any) => {
    if (section === 'userType') {
      setData(prev => ({ ...prev, userType: fields as any }));
    } else {
      setData(prev => ({
        ...prev,
        [section]: {
          ...(prev[section] as any),
          ...fields
        }
      }));
    }
  };

  // Branching Logic
  const goToPage = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-brand-bgLight pb-20 relative overflow-hidden">
      <TopNavBar onNavigate={onNavigate} isLoggedIn={false} />

      {/* Atmospheric Background Element */}
      <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-brand-primary/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] left-[10%] w-[400px] h-[400px] bg-[#FEA776]/10 blur-[80px] rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto pt-24 px-6 relative z-10">
        <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-xl border border-brand-primary/10">
          
          {currentPage === 1 && (
            <Page1Start data={data} updateData={updateData} onNext={(type) => {
              if (type === 'Amputee') goToPage(2);
              else if (type === 'Parent/Family Member') goToPage(3);
            }} />
          )}

          {currentPage === 2 && (
            <Page2AmputeeDetails data={data} updateData={updateData} onNext={() => goToPage(4)} onBack={() => goToPage(1)} />
          )}

          {currentPage === 3 && (
            <Page3ParentDetails data={data} updateData={updateData} onNext={() => goToPage(4)} onBack={() => goToPage(1)} />
          )}

          {currentPage === 4 && (
            <Page4Amputation data={data} updateData={updateData} 
              onNext={(usesProsthesis) => {
                if (usesProsthesis === 'כן') goToPage(5);
                else goToPage(6);
              }} 
              onBack={() => goToPage(data.userType === 'Amputee' ? 2 : 3)} 
            />
          )}

          {currentPage === 5 && (
            <Page5Prosthesis data={data} updateData={updateData} onNext={() => goToPage(6)} onBack={() => goToPage(4)} />
          )}

          {currentPage === 6 && (
            <Page6General data={data} updateData={updateData} 
              onSubmit={() => {
                console.log('Submitting Form Data:', JSON.stringify(data, null, 2));
                // API CALL HERE
                goToPage(7);
              }} 
              onBack={() => goToPage(data.amputationDescription.usesProsthesis === 'כן' ? 5 : 4)} 
            />
          )}

          {currentPage === 7 && (
            <Page7Success />
          )}

        </div>
      </div>
    </div>
  );
};
