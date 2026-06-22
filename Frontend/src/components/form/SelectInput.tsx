import React from 'react';

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
}

export const SelectInput: React.FC<SelectInputProps> = ({ label, options, ...props }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-right text-sm font-medium text-brand-textDark">
        {label}
      </label>
      <select
        {...props}
        className={`border border-gray-300 rounded-lg px-4 py-3 text-right focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors appearance-none bg-white ${props.className || ''}`}
        dir="rtl"
      >
        <option value="" disabled>בחר/י מהרשימה</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
};
