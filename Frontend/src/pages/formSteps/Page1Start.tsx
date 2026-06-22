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
  const [email, setEmail] = React.useState('');
  
  const handleNext = () => {
    if (!email || !data.userType) {
      alert('אנא מלא את כל השדות');
      return;
    }
    // Storing email in parent details or a general root field could be done here if added to type
    onNext(data.userType);
  };

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-2xl font-bold text-brand-primary text-center mb-4">בואו נצא לדרך</h2>
      
      <TextInput 
        label="דואר אלקטרוני" 
        type="email" 
        placeholder="example@mail.com" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        dir="ltr"
      />

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
