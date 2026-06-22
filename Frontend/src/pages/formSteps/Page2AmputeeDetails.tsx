import React from 'react';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/form/TextInput';
import { SelectInput } from '../../components/form/SelectInput';
import { RadioGroup } from '../../components/form/RadioGroup';
import type { FormData } from '../../types/form';

interface Props {
  data: FormData;
  updateData: (section: keyof FormData, fields: Partial<any>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Page2AmputeeDetails: React.FC<Props> = ({ data, updateData, onNext, onBack }) => {
  const d = data.amputeeDetails;
  
  const handleUpdate = (field: string, value: any) => {
    updateData('amputeeDetails', { [field]: value });
  };

  const handleChildrenCountChange = (count: number) => {
    const currentChildren = [...d.children];
    // Adjust array size
    if (count > currentChildren.length) {
      for (let i = currentChildren.length; i < count; i++) {
        currentChildren.push({ name: '', birthDate: '' });
      }
    } else {
      currentChildren.splice(count);
    }
    updateData('amputeeDetails', { children: currentChildren });
  };

  const handleChildUpdate = (index: number, field: string, value: string) => {
    const newChildren = [...d.children];
    newChildren[index] = { ...newChildren[index], [field]: value };
    updateData('amputeeDetails', { children: newChildren });
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-brand-primary text-center mb-4">פרטי הקטוע/ה</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextInput label="שם פרטי" value={d.firstName} onChange={(e) => handleUpdate('firstName', e.target.value)} />
        <TextInput label="שם משפחה" value={d.lastName} onChange={(e) => handleUpdate('lastName', e.target.value)} />
      </div>

      <TextInput label="תאריך לידה" type="date" value={d.birthDate} onChange={(e) => handleUpdate('birthDate', e.target.value)} />
      
      <RadioGroup
        label="מין"
        options={[{ label: 'זכר', value: 'Male' }, { label: 'נקבה', value: 'Female' }, { label: 'אחר', value: 'Other' }]}
        value={d.gender}
        onChange={(val) => handleUpdate('gender', val)}
      />

      <TextInput label="מספר נייד" type="tel" dir="ltr" value={d.mobileNumber} onChange={(e) => handleUpdate('mobileNumber', e.target.value)} />
      <TextInput label="כתובת מגורים" value={d.address} onChange={(e) => handleUpdate('address', e.target.value)} />

      <SelectInput 
        label="מצב משפחתי"
        options={[
          { label: 'רווק/ה', value: 'Single' },
          { label: 'נשוי/ה', value: 'Married' },
          { label: 'גרוש/ה', value: 'Divorced' },
          { label: 'אלמן/ה', value: 'Widowed' }
        ]}
        value={d.maritalStatus}
        onChange={(e) => handleUpdate('maritalStatus', e.target.value)}
      />

      <SelectInput 
        label="איך אתה מגדיר את עצמך?"
        options={[
          { label: 'חילוני', value: 'Secular' },
          { label: 'מסורתי', value: 'Traditional' },
          { label: 'דתי', value: 'Religious' },
          { label: 'חרדי', value: 'Ultra-Orthodox' }
        ]}
        value={d.selfDefinition}
        onChange={(e) => handleUpdate('selfDefinition', e.target.value)}
      />

      <RadioGroup
        label="האם יש לך ילדים?"
        options={[{ label: 'כן', value: 'yes' }, { label: 'לא', value: 'no' }]}
        value={d.hasChildren ? 'yes' : 'no'}
        onChange={(val) => {
          handleUpdate('hasChildren', val === 'yes');
          if (val === 'no') handleUpdate('children', []);
        }}
      />

      {d.hasChildren && (
        <div className="bg-brand-gray/30 p-4 rounded-xl flex flex-col gap-4">
          <TextInput 
            label="כמה ילדים יש לך?" 
            type="number" 
            min="1"
            value={d.children.length || ''} 
            onChange={(e) => handleChildrenCountChange(parseInt(e.target.value) || 0)} 
          />
          
          {d.children.map((child, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-4 border-t border-gray-200 pt-4 mt-2">
              <div className="flex-1">
                <TextInput label={`שם ילד/ה ${index + 1}`} value={child.name} onChange={(e) => handleChildUpdate(index, 'name', e.target.value)} />
              </div>
              <div className="flex-1">
                <TextInput label="תאריך לידה" type="date" value={child.birthDate} onChange={(e) => handleChildUpdate(index, 'birthDate', e.target.value)} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
        <Button variant="secondary" onClick={onBack}>חזור</Button>
        <Button onClick={onNext}>הבא</Button>
      </div>
    </div>
  );
};
