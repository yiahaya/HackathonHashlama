import React from 'react';

interface CheckboxGroupProps {
  label: string;
  options: { value: string; label: string }[];
  values: string[];
  onChange: (values: string[]) => void;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ label, options, values, onChange }) => {
  const handleToggle = (val: string) => {
    if (values.includes(val)) {
      onChange(values.filter(v => v !== val));
    } else {
      onChange([...values, val]);
    }
  };

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
              type="checkbox"
              checked={values.includes(opt.value)}
              onChange={() => handleToggle(opt.value)}
              className="w-4 h-4 text-brand-primary rounded focus:ring-brand-primary"
            />
          </label>
        ))}
      </div>
    </div>
  );
};
