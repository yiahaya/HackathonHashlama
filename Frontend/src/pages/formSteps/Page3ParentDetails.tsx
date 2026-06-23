import React from 'react';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/form/TextInput';
import { SelectInput } from '../../components/form/SelectInput';
import { RadioGroup } from '../../components/form/RadioGroup';
import { useSnackbar } from '../../contexts/SnackbarContext';
import type { FormData } from '../../types/form';

interface Props {
  data: FormData;
  updateData: (section: keyof FormData, fields: Partial<any>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Page3ParentDetails: React.FC<Props> = ({ data, updateData, onNext, onBack }) => {
  const d = data.parentDetails;
  const { showSnackbar } = useSnackbar();

  const handleUpdate = (field: string, value: any) => {
    updateData('parentDetails', { [field]: value });
  };

  const handleNext = () => {
    if (!d.relationToAmputee || !d.supportGroupPartners || !d.supportGroupParents || !d.updatePhoneType) {
      showSnackbar('אנא מלא/י את כל שדות החובה', 'error');
      return;
    }
    onNext();
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-brand-primary text-center mb-4">פרטי ההורה/ בן משפחה / אפוטרופוס</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextInput label="שם פרטי" value={d.firstName} onChange={(e) => handleUpdate('firstName', e.target.value)} />
        <TextInput label="שם משפחה" value={d.lastName} onChange={(e) => handleUpdate('lastName', e.target.value)} />
      </div>

      <SelectInput 
        label="קרבה לקטוע/ה"
        options={[
          { label: 'הורה', value: 'Parent' },
          { label: 'בן/בת זוג', value: 'Spouse' },
          { label: 'אח/אחות', value: 'Sibling' },
          { label: 'אפוטרופוס', value: 'Guardian' },
          { label: 'אחר', value: 'Other' }
        ]}
        value={d.relationToAmputee}
        onChange={(e) => handleUpdate('relationToAmputee', e.target.value)}
      />

      <RadioGroup
        label="האם מעניין אותך לשמוע על קבוצת תמיכה לבני/בנות זוג?"
        options={[{ label: 'כן', value: 'Yes' }, { label: 'לא', value: 'No' }]}
        value={d.supportGroupPartners}
        onChange={(val) => handleUpdate('supportGroupPartners', val)}
      />

      <RadioGroup
        label="האם מעניין אותך לשמוע על קבוצת התמיכה להורים?"
        options={[{ label: 'כן', value: 'Yes' }, { label: 'לא', value: 'No' }]}
        value={d.supportGroupParents}
        onChange={(val) => handleUpdate('supportGroupParents', val)}
      />

      <SelectInput 
        label="לאיזה נייד תרצו לקבל עדכונים עבור אירועים ופעילויות הקהילה?"
        options={[
          { label: 'הנייד שלי', value: 'My Number' },
          { label: 'נייד איש קשר נוסף', value: 'Additional Number' },
          { label: 'מייל', value: 'Email' }
        ]}
        value={d.updatePhoneType}
        onChange={(e) => handleUpdate('updatePhoneType', e.target.value)}
      />

      <TextInput label="מספר נייד" type="tel" dir="ltr" value={d.mobileNumber} onChange={(e) => handleUpdate('mobileNumber', e.target.value)} />

      {d.updatePhoneType === 'Additional Number' && (
        <TextInput label="נייד איש קשר נוסף" type="tel" dir="ltr" value={d.additionalContactNumber} onChange={(e) => handleUpdate('additionalContactNumber', e.target.value)} />
      )}

      {d.updatePhoneType === 'Email' && (
        <TextInput label="מייל" type="email" dir="ltr" value={d.updateEmail} onChange={(e) => handleUpdate('updateEmail', e.target.value)} />
      )}

      <div className="bg-orange-100 border-r-4 border-brand-primary p-4 my-4 rounded-l-lg">
        <p className="text-brand-textDark font-medium text-right">
          שימו לב, החל מסעיף הבא המידע הוא על הקטוע בלבד.
        </p>
      </div>

      <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
        <Button variant="secondary" onClick={onBack}>חזור</Button>
        <Button onClick={handleNext}>הבא</Button>
      </div>
    </div>
  );
};
