import React from 'react';
import { Button } from '../../components/Button';
import { SelectInput } from '../../components/form/SelectInput';
import { CheckboxGroup } from '../../components/form/CheckboxGroup';
import type { FormData } from '../../types/form';

interface Props {
  data: FormData;
  updateData: (section: keyof FormData, fields: Partial<any>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Page5Prosthesis: React.FC<Props> = ({ data, updateData, onNext, onBack }) => {
  const d = data.prosthesisUsage;

  const handleUpdate = (field: string, value: any) => {
    updateData('prosthesisUsage', { [field]: value });
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-brand-primary text-center mb-4">שימוש בפרוטזה</h2>
      
      <SelectInput 
        label="שם מכון התותבות בו נעשתה התאמה אחרונה"
        options={[
          { label: 'מכון א', value: 'Institute A' },
          { label: 'מכון ב', value: 'Institute B' },
          { label: 'אחר', value: 'Other' }
        ]}
        value={d.instituteName}
        onChange={(e) => handleUpdate('instituteName', e.target.value)}
      />

      <SelectInput 
        label="סוג התותבת (יד/רגל)"
        options={[
          { label: 'יד', value: 'Hand' },
          { label: 'רגל', value: 'Leg' }
        ]}
        value={d.prosthesisType}
        onChange={(e) => handleUpdate('prosthesisType', e.target.value)}
      />

      <SelectInput 
        label="מידת השימוש בתותבת"
        options={[
          { label: 'כל היום', value: 'All Day' },
          { label: 'חלקי', value: 'Partial' },
          { label: 'לעיתים רחוקות', value: 'Rarely' }
        ]}
        value={d.usageFrequency}
        onChange={(e) => handleUpdate('usageFrequency', e.target.value)}
      />

      <SelectInput 
        label="האם יש לך תותבת ספורט?"
        options={[{ label: 'כן', value: 'Yes' }, { label: 'לא', value: 'No' }]}
        value={d.hasSportsProsthesis}
        onChange={(e) => handleUpdate('hasSportsProsthesis', e.target.value)}
      />

      {d.hasSportsProsthesis === 'Yes' && (
        <CheckboxGroup
          label="איזה תותבת ספורט יש לך?"
          options={[
            { label: 'ריצה', value: 'Running' },
            { label: 'שחייה', value: 'Swimming' },
            { label: 'רכיבה', value: 'Cycling' }
          ]}
          values={d.sportsProsthesisType}
          onChange={(val) => handleUpdate('sportsProsthesisType', val)}
        />
      )}

      <SelectInput 
        label="מה תוצאות מבחן ה AMP האחרון שלך?"
        options={[
          { label: 'K1', value: 'K1' },
          { label: 'K2', value: 'K2' },
          { label: 'K3', value: 'K3' },
          { label: 'K4', value: 'K4' },
          { label: 'לא ידוע', value: 'Unknown' }
        ]}
        value={d.ampTestResult}
        onChange={(e) => handleUpdate('ampTestResult', e.target.value)}
      />

      <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
        <Button variant="secondary" onClick={onBack}>חזור</Button>
        <Button onClick={onNext}>הבא</Button>
      </div>
    </div>
  );
};
