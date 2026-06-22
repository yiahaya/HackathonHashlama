import React from 'react';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/form/TextInput';
import { TextAreaInput } from '../../components/form/TextAreaInput';
import { SelectInput } from '../../components/form/SelectInput';
import { CheckboxGroup } from '../../components/form/CheckboxGroup';
import type { FormData } from '../../types/form';

interface Props {
  data: FormData;
  updateData: (section: keyof FormData, fields: Partial<any>) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export const Page6General: React.FC<Props> = ({ data, updateData, onSubmit, onBack }) => {
  const d = data.generalQuestions;

  const handleUpdate = (field: string, value: any) => {
    updateData('generalQuestions', { [field]: value });
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-brand-primary text-center mb-4">שאלות כלליות</h2>
      
      <div className="bg-orange-100 border-r-4 border-brand-primary p-4 rounded-l-lg mb-4">
        <p className="text-brand-textDark font-medium text-right text-sm">
          שאלות אלו הינן לשימוש פנימי בלבד...
        </p>
      </div>

      <SelectInput 
        label="האם הינך בקיא/ה בזכויותך כקטוע/ה?"
        options={[{ label: 'כן', value: 'Yes' }, { label: 'לא', value: 'No' }, { label: 'חלקית', value: 'Partially' }]}
        value={d.familiarWithRights}
        onChange={(e) => handleUpdate('familiarWithRights', e.target.value)}
      />

      <SelectInput 
        label="האם הינך מקבל קצבת נכות / סיוע..."
        options={[{ label: 'כן', value: 'Yes' }, { label: 'לא', value: 'No' }]}
        value={d.receivingDisability}
        onChange={(e) => handleUpdate('receivingDisability', e.target.value)}
      />

      <SelectInput 
        label="השכלה"
        options={[
          { label: 'תיכונית', value: 'High School' },
          { label: 'תואר ראשון', value: 'Bachelors' },
          { label: 'תואר שני ומעלה', value: 'Masters/PhD' },
          { label: 'תעודה מקצועית', value: 'Diploma' }
        ]}
        value={d.educationLevel}
        onChange={(e) => handleUpdate('educationLevel', e.target.value)}
      />

      {['Bachelors', 'Masters/PhD', 'Diploma'].includes(d.educationLevel) && (
        <SelectInput 
          label="באיזה תחום הקורס/תעודה המקצועית / תחום התואר שלך?"
          options={[
            { label: 'הנדסה', value: 'Engineering' },
            { label: 'מדעי הרוח', value: 'Humanities' },
            { label: 'רפואה', value: 'Medicine' },
            { label: 'אחר', value: 'Other' }
          ]}
          value={d.studyField}
          onChange={(e) => handleUpdate('studyField', e.target.value)}
        />
      )}

      <CheckboxGroup
        label="באיזה תחום הניסיון התעסוקתי שלך היום או בעבר?"
        options={[
          { label: 'הייטק', value: 'High-Tech' },
          { label: 'חינוך', value: 'Education' },
          { label: 'פיננסים', value: 'Finance' },
          { label: 'אחר', value: 'Other' }
        ]}
        values={d.experienceField}
        onChange={(val) => handleUpdate('experienceField', val)}
      />

      <TextAreaInput
        label="פרט/י על הניסיון התעסוקתי שלך היום או בעבר?"
        value={d.experienceDetails}
        onChange={(e) => handleUpdate('experienceDetails', e.target.value)}
      />

      <SelectInput 
        label="האם היום הינך עובד/ת במשרה קבועה?"
        options={[{ label: 'כן', value: 'Yes' }, { label: 'לא', value: 'No' }]}
        value={d.workingFullTime}
        onChange={(e) => handleUpdate('workingFullTime', e.target.value)}
      />

      <TextInput label="האם את/ה עוסק/ת בפעילות ספורטיבית או תחביב ספורט אתגרי?" value={d.engageInSports} onChange={(e) => handleUpdate('engageInSports', e.target.value)} />

      <CheckboxGroup
        label="באילו פעילויות של העמותה היית מעוניין/נת להשתתף?"
        options={[
          { label: 'קבוצות תמיכה', value: 'Support Groups' },
          { label: 'פעילות ספורט', value: 'Sports' },
          { label: 'הרצאות', value: 'Lectures' }
        ]}
        values={d.interestedActivities}
        onChange={(val) => handleUpdate('interestedActivities', val)}
      />

      {d.interestedActivities.includes('Sports') && (
        <CheckboxGroup
          label="אילו פעילויות ספורט מעניינות אותך?"
          options={[
            { label: 'כדורסל', value: 'Basketball' },
            { label: 'שחייה', value: 'Swimming' },
            { label: 'רכיבה', value: 'Cycling' }
          ]}
          values={d.interestedSports}
          onChange={(val) => handleUpdate('interestedSports', val)}
        />
      )}

      <TextInput label="ספר/י לנו קצת על עצמך" value={d.aboutYourself} onChange={(e) => handleUpdate('aboutYourself', e.target.value)} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextInput label="איש קשר למקרה חירום (שם)" value={d.emergencyContactName} onChange={(e) => handleUpdate('emergencyContactName', e.target.value)} />
        <TextInput label="איש קשר למקרה חירום (נייד)" type="tel" dir="ltr" value={d.emergencyContactPhone} onChange={(e) => handleUpdate('emergencyContactPhone', e.target.value)} />
      </div>

      <div className="flex flex-col gap-4 mt-4 bg-brand-gray/20 p-4 rounded-xl">
        <label className="flex items-center justify-end gap-3 cursor-pointer">
          <span className="text-sm text-brand-textDark text-right">אני מסכים לקבל מהצעד הבא עדכונים...</span>
          <input type="checkbox" checked={d.consentUpdates} onChange={(e) => handleUpdate('consentUpdates', e.target.checked)} className="w-5 h-5 text-brand-primary rounded" />
        </label>
        
        <label className="flex items-center justify-end gap-3 cursor-pointer">
          <span className="text-sm text-brand-textDark text-right">אני מעוניין/נת לקבל דיוור/עלונים בדואר</span>
          <input type="checkbox" checked={d.consentMail} onChange={(e) => handleUpdate('consentMail', e.target.checked)} className="w-5 h-5 text-brand-primary rounded" />
        </label>
      </div>

      {d.consentMail && (
        <TextInput label="אנא ציין כתובת מלא כולל מיקוד" value={d.fullAddress} onChange={(e) => handleUpdate('fullAddress', e.target.value)} />
      )}

      <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
        <Button variant="secondary" onClick={onBack}>חזור</Button>
        <Button onClick={onSubmit}>שלח</Button>
      </div>
    </div>
  );
};
