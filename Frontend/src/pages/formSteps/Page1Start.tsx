import React from 'react';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/form/TextInput';
import { RadioGroup } from '../../components/form/RadioGroup';
import type { FormData } from '../../types/form';

interface Props {
  data: FormData;
  updateData: (section: keyof FormData, fields: any) => void;
  onNext: (type: string) => void;
}

export const Page1Start: React.FC<Props> = ({ data, updateData, onNext }) => {
  const handleNext = () => {
    if (!data.userType) {
      alert('אנא בחר/י אפשרות כדי להמשיך');
      return;
    }
    onNext(data.userType);
  };

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-2xl font-bold text-brand-primary text-center mb-4">בואו נצא לדרך</h2>
      <RadioGroup
        label="אני:"
        options={[
          { label: 'הקטוע/ה', value: 'Amputee' },
          { label: 'הורה / בן משפחה / אפוטרופוס', value: 'Parent/Family Member' }
        ]}
        value={data.userType}
        onChange={(val) => updateData('userType', val)}
      />

      <div className="flex justify-end mt-4">
        <Button onClick={handleNext}>הבא</Button>
      </div>
    </div>
  );
};
