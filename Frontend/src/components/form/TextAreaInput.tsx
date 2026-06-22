import React, { useState } from 'react';
import { SpeechControls } from './SpeechControls';

interface TextAreaInputProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  label: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement> | { target: { value: string } }) => void;
}

export const TextAreaInput: React.FC<TextAreaInputProps> = ({ label, onChange, value, ...props }) => {
  const [isDictating, setIsDictating] = useState(false);

  const handleDictate = (text: string) => {
    if (onChange) {
      const newValue = value ? `${value} ${text}` : text;
      onChange({ target: { value: newValue } } as any);
    }
  };

  const textToSpeak = `${label}. ${value || ''}`;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-right text-sm font-medium text-brand-textDark">
        {label}
      </label>
      <div className="relative w-full">
        <textarea
          {...props}
          value={value}
          onChange={onChange as any}
          className={`w-full border border-gray-300 rounded-lg pr-4 pl-24 py-3 text-right focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors min-h-[100px] ${props.className || ''}`}
          dir="rtl"
        />
        <SpeechControls 
          textToSpeak={textToSpeak} 
          onDictate={onChange ? handleDictate : undefined}
          isDictating={isDictating}
          setIsDictating={setIsDictating}
        />
      </div>
    </div>
  );
};
