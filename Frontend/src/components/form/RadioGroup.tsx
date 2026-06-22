import React from 'react';

interface RadioGroupProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({ label, options, value, onChange }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-right text-sm font-medium text-brand-textDark">
        {label}
      </label>
      <div className="flex flex-wrap gap-4 justify-end">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm text-brand-textDark">{opt.label}</span>
            <input
              type="radio"
              name={label}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
            />
          </label>
        ))}
      </div>
    </div>
  );
};
