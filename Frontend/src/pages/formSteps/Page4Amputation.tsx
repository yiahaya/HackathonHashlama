import React from 'react';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/form/TextInput';
import { SelectInput } from '../../components/form/SelectInput';
import { RadioGroup } from '../../components/form/RadioGroup';
import { CheckboxGroup } from '../../components/form/CheckboxGroup';
import type { FormData } from '../../types/form';

interface Props {
  data: FormData;
  updateData: (section: keyof FormData, fields: Partial<any>) => void;
  onNext: (usesProsthesis: string) => void;
  onBack: () => void;
}

export const Page4Amputation: React.FC<Props> = ({ data, updateData, onNext, onBack }) => {
  const d = data.amputationDescription;

  const handleUpdate = (field: string, value: any) => {
    updateData('amputationDescription', { [field]: value });
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-brand-primary text-center mb-4">תיאור הקטיעה</h2>
      
      <TextInput label="תאריך הקטיעה" type="date" value={d.amputationDate} onChange={(e) => handleUpdate('amputationDate', e.target.value)} />

      <SelectInput 
        label="סיבת הקטיעה"
        options={[
          { label: 'מחלה', value: 'Disease' },
          { label: 'תאונת דרכים', value: 'Car Accident' },
          { label: 'פעולת איבה', value: 'Terror Act' },
          { label: 'פציעה צבאית', value: 'Military Injury' },
          { label: 'אחר', value: 'Other' }
        ]}
        value={d.reason}
        onChange={(e) => handleUpdate('reason', e.target.value)}
      />

      <div className="flex flex-col gap-2">
        <label className="text-right text-sm font-medium text-brand-textDark">נשמח שתפרט בקצרה על נסיבות הקטיעה</label>
        <textarea 
          className="border border-gray-300 rounded-lg px-4 py-3 text-right focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors min-h-[100px]"
          dir="rtl"
          value={d.circumstances}
          onChange={(e) => handleUpdate('circumstances', e.target.value)}
        />
      </div>

      <SelectInput 
        label="גורם מבטח"
        options={[
          { label: 'משרד הבריאות', value: 'Ministry of Health' },
          { label: 'משרד הביטחון', value: 'Ministry of Defense' },
          { label: 'ביטוח לאומי', value: 'National Insurance' },
          { label: 'פרטי', value: 'Private' }
        ]}
        value={d.insuringBody}
        onChange={(e) => handleUpdate('insuringBody', e.target.value)}
      />

      <CheckboxGroup
        label="סוג קטיעה"
        options={[{ label: 'יד', value: 'Hand' }, { label: 'רגל', value: 'Leg' }]}
        values={d.amputationType}
        onChange={(val) => handleUpdate('amputationType', val)}
      />

      {d.amputationType.includes('Hand') && (
        <div className="flex flex-col gap-6 p-6 bg-[#FCF9F4] rounded-2xl border border-[#DBC2B2]">
          <h3 className="text-xl font-bold text-brand-primary text-right">פרטי קטיעת יד</h3>
          <CheckboxGroup
            label="איזה יד קטועה?"
            options={[{ label: 'ימין', value: 'Right' }, { label: 'שמאל', value: 'Left' }]}
            values={d.whichHand || []}
            onChange={(val) => handleUpdate('whichHand', val)}
          />

          {(d.whichHand || []).includes('Right') && (
            <SelectInput
              label="גובה קטיעה (יד ימין)"
              options={[
                { label: 'אצבעות', value: 'Fingers' },
                { label: 'כף יד', value: 'Palm' },
                { label: 'מתחת למרפק', value: 'Below Elbow' },
                { label: 'מעל המרפק', value: 'Above Elbow' },
                { label: 'עד הכתף', value: 'Up to Shoulder' }
              ]}
              value={d.handRightLevel || ''}
              onChange={(e) => handleUpdate('handRightLevel', e.target.value)}
            />
          )}

          {(d.whichHand || []).includes('Left') && (
            <SelectInput
              label="גובה קטיעה (יד שמאל)"
              options={[
                { label: 'אצבעות', value: 'Fingers' },
                { label: 'כף יד', value: 'Palm' },
                { label: 'מתחת למרפק', value: 'Below Elbow' },
                { label: 'מעל המרפק', value: 'Above Elbow' },
                { label: 'עד הכתף', value: 'Up to Shoulder' }
              ]}
              value={d.handLeftLevel || ''}
              onChange={(e) => handleUpdate('handLeftLevel', e.target.value)}
            />
          )}
        </div>
      )}

      {d.amputationType.includes('Leg') && (
        <div className="flex flex-col gap-6 p-6 bg-[#FCF9F4] rounded-2xl border border-[#DBC2B2]">
          <h3 className="text-xl font-bold text-brand-primary text-right">פרטי קטיעת רגל</h3>
          <CheckboxGroup
            label="איזה רגל קטועה?"
            options={[{ label: 'ימין', value: 'Right' }, { label: 'שמאל', value: 'Left' }]}
            values={d.whichLeg || []}
            onChange={(val) => handleUpdate('whichLeg', val)}
          />

          {(d.whichLeg || []).includes('Right') && (
            <SelectInput
              label="גובה קטיעה (רגל ימין)"
              options={[
                { label: 'כף רגל', value: 'Foot' },
                { label: 'מתחת לברך', value: 'Below Knee' },
                { label: 'דרך הברך', value: 'Through Knee' },
                { label: 'מעל הברך', value: 'Above Knee' },
                { label: 'אגן', value: 'Pelvis' }
              ]}
              value={d.legRightLevel || ''}
              onChange={(e) => handleUpdate('legRightLevel', e.target.value)}
            />
          )}

          {(d.whichLeg || []).includes('Left') && (
            <SelectInput
              label="גובה קטיעה (רגל שמאל)"
              options={[
                { label: 'כף רגל', value: 'Foot' },
                { label: 'מתחת לברך', value: 'Below Knee' },
                { label: 'דרך הברך', value: 'Through Knee' },
                { label: 'מעל הברך', value: 'Above Knee' },
                { label: 'אגן', value: 'Pelvis' }
              ]}
              value={d.legLeftLevel || ''}
              onChange={(e) => handleUpdate('legLeftLevel', e.target.value)}
            />
          )}
        </div>
      )}

      <SelectInput 
        label="מידת הפעילות היומיומית מאז הקטיעה"
        options={[
          { label: 'מוגבלת מאוד', value: 'Very Limited' },
          { label: 'בינונית', value: 'Moderate' },
          { label: 'פעיל/ה', value: 'Active' },
          { label: 'ספורטיבי/ת', value: 'Sportive' }
        ]}
        value={d.dailyActivityLevel}
        onChange={(e) => handleUpdate('dailyActivityLevel', e.target.value)}
      />

      <div className="flex flex-col gap-2">
        <label className="text-right text-sm font-medium text-brand-textDark">נשמח לשמוע על פעילותך היומיומית</label>
        <textarea 
          className="border border-gray-300 rounded-lg px-4 py-3 text-right focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors min-h-[100px]"
          dir="rtl"
          value={d.dailyActivityDescription}
          onChange={(e) => handleUpdate('dailyActivityDescription', e.target.value)}
        />
      </div>

      <SelectInput 
        label="האם את/ה מסתייע בתותבת?"
        options={[{ label: 'כן', value: 'כן' }, { label: 'לא', value: 'לא' }]}
        value={d.usesProsthesis}
        onChange={(e) => handleUpdate('usesProsthesis', e.target.value)}
      />

      {d.usesProsthesis === 'לא' && (
        <SelectInput 
          label="מה הסיבה שאינך מסתייע בתותבת?"
          options={[
            { label: 'כאבים', value: 'Pain' },
            { label: 'חוסר התאמה', value: 'Incompatibility' },
            { label: 'לא מעוניין', value: 'Not Interested' },
            { label: 'אחר', value: 'Other' }
          ]}
          value={d.reasonNoProsthesis}
          onChange={(e) => handleUpdate('reasonNoProsthesis', e.target.value)}
        />
      )}

      {d.usesProsthesis === 'לא' && (
        <SelectInput 
          label="האם את/ה מסתייע בכלי עזר אחר?"
          options={[
            { label: 'כסא גלגלים', value: 'Wheelchair' },
            { label: 'קביים', value: 'Crutches' },
            { label: 'מקל הליכה', value: 'Cane' },
            { label: 'לא', value: 'None' }
          ]}
          value={d.usesAssistiveDevice}
          onChange={(e) => handleUpdate('usesAssistiveDevice', e.target.value)}
        />
      )}

      <RadioGroup
        label="האם תרצה לקחת חלק בפרויקט ליווי עבור קטועים חדשים?"
        options={[{ label: 'כן', value: 'Yes' }, { label: 'לא', value: 'No' }]}
        value={d.mentorNewAmputees}
        onChange={(val) => handleUpdate('mentorNewAmputees', val)}
      />

      <RadioGroup
        label="האם תרצה לקבל ליווי מקטוע ותיק?"
        options={[{ label: 'כן', value: 'Yes' }, { label: 'לא', value: 'No' }]}
        value={d.wantVeteranMentor}
        onChange={(val) => handleUpdate('wantVeteranMentor', val)}
      />

      <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
        <Button variant="secondary" onClick={onBack}>חזור</Button>
        <Button onClick={() => onNext(d.usesProsthesis)}>הבא</Button>
      </div>
    </div>
  );
};
