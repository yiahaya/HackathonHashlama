export type RightStatus = 'realized' | 'in_process' | 'worth_checking';

export interface RightItem {
  id: string;
  title: string;
  description: string;
  matchPercentage?: number;
  status: RightStatus;
  steps: { step: string; done: boolean }[];
}

export const mockRights: RightItem[] = [
  {
    id: '1',
    title: 'מלגות לימודים מותאמות',
    description: 'סיוע במימון תארים אקדמיים וקורסים מקצועיים עבור סטודנטים עם מוגבלות.',
    matchPercentage: 95,
    status: 'worth_checking',
    steps: [
      { step: 'הגשת אישור לימודים בתוקף', done: false },
      { step: 'המצאת קבלות על תשלום שכר לימוד', done: true },
      { step: 'מילוי טופס בקשה למלגה מקוון', done: false }
    ]
  },
  {
    id: '2',
    title: 'קצבת ניידות',
    description: 'קצבה חודשית המשולמת למוגבלים בניידות שברשותם רכב, או לסיוע בהוצאות תחבורה.',
    matchPercentage: 88,
    status: 'worth_checking',
    steps: [
      { step: 'ועדה רפואית במשרד הבריאות קביעת אחוזי ניידות', done: false },
      { step: 'הגשת התביעה לביטוח לאומי', done: false }
    ]
  },
  {
    id: '3',
    title: 'מימון תותבות מתקדמות',
    description: 'השתתפות ברכישת תותבות ואביזרי שיקום תומכים ממשרד הבריאות.',
    matchPercentage: 99,
    status: 'in_process',
    steps: [
      { step: 'קבלת הפניה מרופא שיקום', done: true },
      { step: 'הגשת הצעת מחיר ממכון פרוטטי', done: false },
      { step: 'אישור משרד הבריאות לתקציב', done: false }
    ]
  },
  {
    id: '4',
    title: 'פטור ממס הכנסה',
    description: 'פטור מלא או חלקי מתשלום מס הכנסה למי שנקבעה לו נכות רפואית בשיעור 90% ומעלה.',
    status: 'realized',
    steps: [
      { step: 'קביעת נכות רפואית בביטוח לאומי', done: true },
      { step: 'הגשת טופס 1516 לפקיד השומה', done: true },
      { step: 'קבלת אישור הפטור מרשות המיסים', done: true }
    ]
  }
];
