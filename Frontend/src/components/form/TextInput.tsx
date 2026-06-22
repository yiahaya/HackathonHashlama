import React from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const TextInput: React.FC<TextInputProps> = ({ label, ...props }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-right text-sm font-medium text-brand-textDark">
        {label}
      </label>
      <input
        {...props}
        className={`border border-gray-300 rounded-lg px-4 py-3 text-right focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors ${props.className || ''}`}
        dir="rtl"
      />
    </div>
  );
};
