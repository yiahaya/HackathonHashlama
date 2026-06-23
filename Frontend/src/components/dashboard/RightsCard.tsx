import React, { useState } from 'react';
import type { RightItem, RightStatus } from '../../data/mockRights';

interface RightsCardProps {
  right: RightItem;
  onStatusChange: (id: string, newStatus: RightStatus) => void;
  onStepToggle: (id: string, stepIndex: number) => void;
}

export const RightsCard: React.FC<RightsCardProps> = ({ right, onStatusChange, onStepToggle }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusOptions: { value: RightStatus; label: string }[] = [
    { value: 'realized', label: 'זכויות ממומשות' },
    { value: 'in_process', label: 'זכויות בטיפול' },
    { value: 'worth_checking', label: 'זכויות ששווה לבדוק' }
  ];

  return (
    <div className="bg-white border border-[#EBE8E3] rounded-xl shadow-[0_4px_20px_rgba(179,93,0,0.05)] overflow-hidden">
      {/* Main Card Header */}
      <div className="p-5 flex flex-col gap-6">
        
        {/* Top Info row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-light/30 rounded-full flex items-center justify-center text-brand-primary flex-shrink-0">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl md:text-2xl font-bold text-[#1C1C19] text-right">{right.title}</h3>
                {right.matchPercentage && (
                  <span className="bg-[#FFDCC5] text-[#301400] text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {right.matchPercentage}% התאמה
                  </span>
                )}
              </div>
              <p className="text-[#554337] text-base text-right">
                {right.description}
              </p>
            </div>
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-2 border-t border-[#F0EDE9] gap-4">
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-brand-primary font-semibold hover:text-brand-dark transition-colors"
          >
            <span>צעדים למימוש</span>
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-[#554337] text-sm font-medium">שנה סטטוס:</span>
            <select 
              value={right.status}
              onChange={(e) => onStatusChange(right.id, e.target.value as RightStatus)}
              className="bg-[#F6F3EE] text-brand-primary text-sm font-medium rounded-lg px-3 py-1.5 border-none focus:ring-0 cursor-pointer appearance-none text-right pr-4 pl-8 relative outline-none"
              style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%238E4900%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'left 0.5rem center', backgroundSize: '0.65em auto' }}
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="bg-[#FCF9F4] px-6 py-5 border-t border-[#F0EDE9]">
          <ul className="flex flex-col gap-4">
            {right.steps.map((stepObj, index) => (
              <li 
                key={index} 
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => onStepToggle(right.id, index)}
              >
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                  stepObj.done 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'bg-white border-[#DBC2B2] text-transparent group-hover:border-green-500/50'
                }`}>
                   <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                   </svg>
                </div>
                <span className={`text-base transition-colors select-none ${stepObj.done ? 'text-[#1C1C19]/60 line-through' : 'text-[#1C1C19]'}`}>
                  {stepObj.step}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
