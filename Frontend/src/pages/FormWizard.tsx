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
import { registerFull } from '../services/api';

interface FormWizardProps {
  onNavigate?: (route: 'home' | 'login' | 'form' | 'contact' | 'dashboard') => void;
  onLoginSuccess?: (userId: string) => void;
}

export const FormWizard: React.FC<FormWizardProps> = ({ onNavigate, onLoginSuccess }) => {
  const [data, setData] = useState<FormData>(initialFormData);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const updateData = (section: keyof FormData, fields: any) => {
    if (section === 'userType' || section === 'email' || section === 'password') {
      setData(prev => ({ ...prev, [section]: fields }));
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

  const handleSubmit = async () => {
    if (!data.email || !data.password) {
      setSubmitError('חובה למלא אימייל וסיסמה במסך הקודם');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');

    // Map frontend data to the exact format expected by the backend
    const mappedData = {
      userType: data.userType === 'Amputee' ? 'הקטוע' : 'בן משפחה',
      email: data.email,
      password: data.password,
      amputeeDetails: {
        birthDate: data.amputeeDetails.birthDate,
        gender: data.amputeeDetails.gender,
        maritalStatus: data.amputeeDetails.maritalStatus,
        hasChildren: data.amputeeDetails.hasChildren,
        numberOfChildren: data.amputeeDetails.children ? data.amputeeDetails.children.length : 0,
        address: { 
          city: data.amputeeDetails.address || '', 
          country: "ישראל" 
        }
      },
      amputationDescription: {
        amputationReason: data.amputationDescription.reason,
        insuringBody: data.amputationDescription.insuringBody,
        amputationTypes: data.amputationDescription.amputationType,
        amputatedLegs: data.amputationDescription.whichLeg,
        rightLegAmputationLevel: data.amputationDescription.legRightLevel,
        leftLegAmputationLevel: data.amputationDescription.legLeftLevel,
        usesProsthesis: data.amputationDescription.usesProsthesis,
        otherAssistiveDevices: data.amputationDescription.usesAssistiveDevice
      },
      generalQuestions: {
        currentlyWorkingFullTime: data.generalQuestions.workingFullTime,
        receivingDisabilityAllowance: data.generalQuestions.receivingDisability
      },
      metadata: { 
        formId: "F-123", 
        submittedAt: new Date().toISOString() 
      }
    };

    try {
      const result = await registerFull(mappedData);
      if (result.success && result.user_id) {
        onLoginSuccess?.(result.user_id);
        goToPage(7);
      } else {
        setSubmitError(result.error || 'שגיאה בשמירת הנתונים');
      }
    } catch (err: any) {
      setSubmitError('שגיאה בתקשורת עם השרת');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bgLight pb-20 relative overflow-hidden">
      <TopNavBar onNavigate={onNavigate} isLoggedIn={false} />

      {/* Atmospheric Background Element */}
      <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-brand-primary/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] left-[10%] w-[400px] h-[400px] bg-[#FEA776]/10 blur-[80px] rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto pt-24 px-6 relative z-10">
        <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-xl border border-brand-primary/10">
          
          {submitError && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-right">
              {submitError}
            </div>
          )}

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
              onSubmit={handleSubmit} 
              onBack={() => goToPage(data.amputationDescription.usesProsthesis === 'כן' ? 5 : 4)} 
            />
          )}

          {currentPage === 7 && (
            <Page7Success />
          )}

          {isSubmitting && (
            <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-brand-primary font-bold">מעבד את הנתונים שלך...</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
