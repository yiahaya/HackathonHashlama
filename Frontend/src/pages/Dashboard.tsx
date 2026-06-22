import React, { useState } from 'react';
import { TopNavBar } from '../components/TopNavBar';
import { RightsCard } from '../components/dashboard/RightsCard';
import { mockRights, type RightItem, type RightStatus } from '../data/mockRights';

interface DashboardProps {
  onNavigate: (route: 'home' | 'login' | 'form' | 'contact' | 'dashboard') => void;
  isLoggedIn?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, isLoggedIn }) => {
  const [rights, setRights] = useState<RightItem[]>(mockRights);
  const [activeTab, setActiveTab] = useState<RightStatus | 'all'>('all');

  const handleStatusChange = (id: string, newStatus: RightStatus) => {
    setRights(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const handleStepToggle = (rightId: string, stepIndex: number) => {
    setRights(prev => prev.map(r => {
      if (r.id !== rightId) return r;
      const newSteps = [...r.steps];
      newSteps[stepIndex] = { ...newSteps[stepIndex], done: !newSteps[stepIndex].done };
      return { ...r, steps: newSteps };
    }));
  };

  const tabs: { id: RightStatus | 'all'; label: string }[] = [
    { id: 'realized', label: 'זכויות ממומשות' },
    { id: 'in_process', label: 'זכויות בטיפול' },
    { id: 'worth_checking', label: 'זכויות ששווה לבדוק' },
    { id: 'all', label: 'כל הזכויות' },
  ];

  const filteredRights = rights.filter(r => activeTab === 'all' || r.status === activeTab);

  return (
    <div className="min-h-screen bg-brand-bgLight pb-20">
      <TopNavBar onNavigate={onNavigate} isLoggedIn={isLoggedIn} />
      
      <main className="pt-32 px-6 lg:px-20 max-w-7xl mx-auto flex flex-col gap-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#DBC2B2]/40 pb-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1C1C19] text-right">אזור אישי</h1>
            <p className="text-[#554337] text-lg text-right max-w-xl">
              ברוך הבא ישראל ישראלי! <br/>
              מרכז הניהול והזכויות שלך בעמותת "הצעד הבא".
            </p>
          </div>

          <button className="bg-[#FEA776] text-[#773A12] font-semibold px-6 py-3 rounded-full hover:bg-[#FEA776]/80 transition-colors flex items-center gap-2">
            לעריכת הפרטים שלי
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>

        {/* Tabs Section */}
        <div className="flex flex-col gap-8">
          
          {/* Tabs Navigation */}
          <div className="flex flex-wrap md:flex-nowrap border-b border-[#DBC2B2] overflow-x-auto pb-[-1px] scrollbar-hide" dir="ltr">
            <div className="flex gap-2 w-full justify-start md:justify-end min-w-max">
              {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-4 font-semibold text-sm transition-colors whitespace-nowrap border-b-2 ${
                      isActive 
                        ? 'text-brand-primary border-brand-primary' 
                        : 'text-[#554337] border-transparent hover:text-brand-primary/80'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Tab Content */}
          <div className="flex flex-col gap-6" dir="rtl">
            {filteredRights.length > 0 ? (
              filteredRights.map(right => (
                <RightsCard 
                  key={right.id} 
                  right={right} 
                  onStatusChange={handleStatusChange} 
                  onStepToggle={handleStepToggle}
                />
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-[#EBE8E3] shadow-sm">
                <p className="text-lg text-[#554337]">אין זכויות בקטגוריה זו כרגע.</p>
              </div>
            )}
          </div>

        </div>
        
      </main>
    </div>
  );
};
