import React, { useState } from 'react';
import { SpeechControls } from './SpeechControls';

interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement> | { target: { value: string } }) => void;
}

export const TextInput: React.FC<TextInputProps> = ({ label, onChange, value, ...props }) => {
  const textToSpeak = `${label}. ${value || ''}`;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-right text-sm font-medium text-brand-textDark">
        {label}
      </label>
      <div className="relative w-full">
        <input
          {...props}
          value={value}
          onChange={onChange as any}
          className={`w-full border border-gray-300 rounded-lg pr-4 pl-24 py-3 text-right focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors ${props.className || ''}`}
          dir="rtl"
        />
        <SpeechControls 
          textToSpeak={textToSpeak} 
        />
      </div>
    </div>
  );
};
