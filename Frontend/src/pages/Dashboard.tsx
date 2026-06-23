import React, { useState, useEffect } from 'react';
import { TopNavBar } from '../components/TopNavBar';
import { RightsCard } from '../components/dashboard/RightsCard';
import { AIChatModal } from '../components/AIChatModal';
import { type RightItem, type RightStatus } from '../data/mockRights';
import { getUserEvaluation, getUserRights, updateRightStatus, updateStepStatus } from '../services/api';

interface DashboardProps {
  onNavigate: (route: 'home' | 'login' | 'form' | 'contact' | 'dashboard') => void;
  isLoggedIn?: boolean;
  userId?: string | null;
  onLogout?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, isLoggedIn, userId, onLogout }) => {
  const [rights, setRights] = useState<RightItem[]>([]);
  const [activeTab, setActiveTab] = useState<RightStatus | 'all'>('all');
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        return;
      }
      
      try {
        const [evalRes, rightsRes] = await Promise.all([
          getUserEvaluation(userId),
          getUserRights(userId)
        ]);

        if (evalRes.success && rightsRes.success) {
          const trackedMap = new Map(rightsRes.rights?.map((r: any) => [r.right_id, r.status]));
          
          const mergedRights: RightItem[] = evalRes.rights?.map((r: any) => ({
            id: r.id.toString(),
            title: r.title,
            description: r.description,
            matchPercentage: r.confidence,
            status: trackedMap.get(r.id) || 'worth_checking',
            steps: r.steps?.map((s: any) => ({ step: s.step, done: s.is_completed })) || []
          })) || [];

          // Add any tracked rights that weren't in the confident evaluation list
          rightsRes.rights?.forEach((tracked: any) => {
            if (!mergedRights.find(mr => mr.id === tracked.right_id.toString())) {
              mergedRights.push({
                id: tracked.right_id.toString(),
                title: tracked.name_he,
                description: 'זכות ששמרת למעקב',
                status: tracked.status,
                steps: [
                  { step: 'הגשת בקשה ואיסוף מסמכים', done: false }
                ]
              });
            }
          });

          setRights(mergedRights);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };

    fetchData();
  }, [userId]);

  const handleStatusChange = async (id: string, newStatus: RightStatus) => {
    // Optimistic UI update
    setRights(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    
    if (userId) {
      const res = await updateRightStatus(userId, id, newStatus);
      if (!res.success) {
        // Handle error implicitly by reverting? Or just log.
        console.error('Failed to update status:', res.error);
      }
    }
  };

  const handleStepToggle = async (rightId: string, stepIndex: number) => {
    const right = rights.find(r => r.id === rightId);
    if (!right) return;
    
    const stepObj = right.steps[stepIndex];
    if (!stepObj) return;

    const stepText = stepObj.step;
    const isCompleted = !stepObj.done;

    setRights(prev => prev.map(r => {
      if (r.id !== rightId) return r;
      const newSteps = [...r.steps];
      newSteps[stepIndex] = { ...newSteps[stepIndex], done: isCompleted };
      return { ...r, steps: newSteps };
    }));

    console.log("userId", userId, "stepText", stepText)

    if (userId && stepText) {
      const res = await updateStepStatus(userId, rightId, stepText, isCompleted);
      if (!res.success) {
        console.error('Failed to update step status:', res.error);
      }
    }
  };

  const tabs: { id: RightStatus | 'all'; label: string }[] = [
    { id: 'realized', label: 'זכויות ממומשות' },
    { id: 'in_process', label: 'זכויות בטיפול' },
    { id: 'worth_checking', label: 'זכויות ששווה לבדוק' },
    { id: 'all', label: 'כל הזכויות' },
  ];

  const filteredRights = rights.filter(r => activeTab === 'all' || r.status === activeTab);

  return (
    <div className="min-h-screen bg-brand-bgLight pb-20 relative overflow-hidden">
      <TopNavBar onNavigate={onNavigate} isLoggedIn={isLoggedIn} />
      
      {/* Atmospheric Background Element */}
      <div className="absolute top-[10%] right-[-150px] w-[600px] h-[600px] bg-[#FEA776]/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-200px] w-[500px] h-[500px] bg-brand-primary/5 blur-[80px] rounded-full pointer-events-none" />

      <main className="pt-32 px-6 lg:px-20 max-w-7xl mx-auto flex flex-col gap-10 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#DBC2B2]/40 pb-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1C1C19] text-right">אזור אישי</h1>
            <p className="text-[#554337] text-lg text-right max-w-xl">
              ברוך הבא ישראל ישראלי! <br/>
              מרכז הניהול והזכויות שלך ב"הצעד שלי".
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button 
              onClick={() => setIsChatOpen(true)}
              className="bg-white text-brand-primary border-2 border-brand-primary font-semibold px-6 py-3 rounded-full hover:bg-brand-primary hover:text-white transition-colors flex items-center gap-2 shadow-sm w-full sm:w-auto justify-center"
            >
              שוחח עם AI
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </button>
            <button className="bg-[#FEA776] text-[#773A12] font-semibold px-6 py-3 rounded-full hover:bg-[#FEA776]/80 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center">
              לעריכת הפרטים שלי
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            {onLogout && (
              <button 
                onClick={onLogout}
                className="bg-red-50 text-red-600 border border-red-200 font-semibold px-6 py-3 rounded-full hover:bg-red-100 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                התנתק
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            )}
          </div>
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

      <AIChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};
