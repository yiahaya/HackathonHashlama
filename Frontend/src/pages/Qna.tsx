import React, { useState } from 'react';
import { TopNavBar } from '../components/TopNavBar';
import { Search, ChevronDown, HelpCircle } from 'lucide-react';

interface QnaProps {
  onNavigate?: (route: 'home' | 'login' | 'form' | 'contact' | 'dashboard' | 'qna') => void;
  isLoggedIn?: boolean;
}

interface QnaItem {
  id: number;
  question: string;
  answer: string;
}

const qnaData: QnaItem[] = [
  {
    id: 1,
    question: "מדוע אי אפשר לקבל תותבת מיד לאחר הניתוח?",
    answer: "הגדם נותר נפוח והעור רגיש מאוד מיד לאחר הקטיעה. חשוב לאפשר לפצע להחלים באופן מלא לפני שמתחילים בתהליך ההתאמה כדי למנוע סיבוכים."
  },
  {
    id: 2,
    question: "מהם כאבי פנטום וכיצד ניתן לטפל בהם?",
    answer: "אלו תחושות (כמו עקצוץ, שריפה או כאב) באיבר שכבר אינו קיים. הטיפול כולל תרופות, פיזיותרפיה, ושימוש בטכניקות כמו \"תרפיית מראה\" או עיסוי הגדם."
  },
  {
    id: 3,
    question: "האם מותר לישון או להתקלח עם התותבת?",
    answer: "מומלץ להסיר את התותבת לפני השינה כדי לאפשר לעור לנשום ולמנוע פצעי לחץ. רוב התותבות אינן עמידות למים, ולכן יש להסירן לפני המקלחת אלא אם מדובר בתותבת ייעודית למים."
  },
  {
    id: 4,
    question: "מהן הדרישות לחזרה לנהיגה בישראל?",
    answer: "הדבר תלוי בסוג הקטיעה. קטועי רגל שמאל נדרשים לרוב לאישור מהמרב\"ד ורכב אוטומטי, בעוד קטועי רגל ימין זקוקים להתאמות ספציפיות ברכב ושיעורי נהיגה ייעודיים."
  },
  {
    id: 5,
    question: "כל כמה זמן זכאים לתותבת חדשה?",
    answer: "קטועים המבוטחים בביטוח לאומי זכאים בדרך כלל לתותבת חדשה אחת ל-4 שנים, אלא אם יש שינויים משמעותיים בגדם המחייבים התאמה חדשה."
  },
  {
    id: 6,
    question: "האם ניתן לחזור לעבודה ולפעילות גופנית?",
    answer: "בהחלט. ניתן לחזור לרוב סוגי העבודות והספורט (כולל רכיבה על אופניים ושחייה), אך לעיתים נדרשת תותבת מיוחדת או תוספים (כמו אביזר אחיזה לכידון לקטועי יד)."
  },
  {
    id: 7,
    question: "מהו \"גרב גדם\" (Shrinker) ולמה הוא משמש?",
    answer: "זהו בגד לחץ המסייע בהפחתת הנפיחות ובעיצוב הגדם, דבר שמקל על תהליך התאמת התותבת בהמשך."
  },
  {
    id: 8,
    question: "האם ניתן לתרום תותבות ישנות?",
    answer: "למרות שהארגונים לרוב לא מקבלים תרומות ישירות, הם יכולים לקשר אתכם עם גופים המעבירים תותבות משומשות ונעליים בודדות לאוכלוסיות נזקקות ברחבי העולם."
  },
  {
    id: 9,
    question: "איך מצטרפים לקהילת \"הצעד הבא\" וכמה זה עולה?",
    answer: "ההצטרפות לקהילה אינה כרוכה בתשלום. יש למלא טופס באתר העמותה ולקיים שיחה קצרה עם מנהל הקהילה."
  },
  {
    id: 10,
    question: "מה ניתן לעשות אם התותבת גורמת לאי-נוחות?",
    answer: "אי-נוחות עשויה להעיד על צורך בהתאמות טכניות. יש לפנות בהקדם לפרוטטיסט (טכני תותבות) כדי למנוע גירויים בעור או פצעים."
  },
  {
    id: 11,
    question: "איך אפשר לקשור שרוכים עם יד אחת בלבד?",
    answer: "יש שלושה פתרונות מרכזיים:\n\nשרוכים אלסטיים (No-Tie Laces): מחליפים את השרוכים הרגילים בשרוכי גומי קבועים. מתקינים אותם פעם אחת, ומאז פשוט מחליקים את הרגל פנימה והחוצה בלי לקשור לעולם.\n\nסגירה מגנטית (כמו Zubits): תוספי מגנט חזקים שמתלבשים על השרוכים הקיימים. הצמדה שלהם נועלת את הנעל, ולחיצה של העקב פותחת אותה.\n\nטכניקת קשירה ביד אחת: קושרים קשר קבוע בקצה התחתון של השרוך בנעל, משחילים אותו בזיגזג עד למעלה, ומייצרים לולאה עליונה קבועה שניתן למתוח ולהדק בקלות ביד אחת."
  },
  {
    id: 12,
    question: "איך מסתדרים בטיסות ובחו\"ל עם פרוטזה?",
    answer: "המפתח הוא הכנה מראש והבנת התהליך בשדה התעופה:\n\nבדיקה ביטחונית: אין צורך להוריד את הפרוטזה. הרכיבים שלה יפעילו את גלאי המתכות, וזה תקין. המאבטחים פשוט יעבירו סורק ידני על הפרוטזה.\n\nמכתב רפואי באנגלית: מומלץ להצטייד מראש במכתב רשמי מהרופא המסביר שמדובר באביזר רפואי קבוע, כדי למנוע אי-הבנות עם אנשי ביטחון בחו\"ל.\n\nבמהלך הטיסה: לחץ האוויר במטוס עלול לגרום לגדם להתנפח. כדאי לשחרר מעט את הוואקום של בית הגדם בזמן הטיסה. את המטען של הפרוטזה ואת חלקי החילוף קחו תמיד בתיק הגב (כבודת יד)."
  },
  {
    id: 13,
    question: "איך מתמודדים עם הזיעה בתוך הפרוטזה?",
    answer: "הזיעה עלולה לגרום להחלקת הפרוטזה ולשפשופים בעור. כך נלחמים בה:\n\nניגוב במהלך היום: מומלץ לקחת בתיק מגבונים או מגבת קטנה. אחת לכמה שעות, מורידים את הפרוטזה לדקה, מנגבים היטב את הגדם ואת השרוול (Liner) ומחזירים.\n\nספריי מונע זיעה: מריחת תכשיר חזק מונע זיעה (כמו אנהידרול פורטה) על הגדם בלילה שלפני מפחיתה משמעותית את ייצור הזיעה למחרת.\n\nהיגיינה יומיומית: חובה לשטוף את השרוול (Liner) בכל ערב במים פושרים וסבון אנטי-בקטריאלי ללא בישום כדי למנוע הצטברות חיידקים, זיהומים בעור וריחות רעים."
  }
];

export const Qna: React.FC<QnaProps> = ({ onNavigate, isLoggedIn }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const filteredQna = qnaData.filter(item => 
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-brand-bgLight pb-20 relative overflow-hidden" dir="rtl">
      <TopNavBar onNavigate={onNavigate} isLoggedIn={isLoggedIn} />

      {/* Atmospheric Background Elements */}
      <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-brand-primary/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] left-[10%] w-[400px] h-[400px] bg-[#FEA776]/5 blur-[80px] rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto pt-28 px-6 relative z-10">
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="w-14 h-14 bg-brand-primary/10 rounded-full flex items-center justify-center mb-4">
            <HelpCircle className="w-8 h-8 text-brand-primary" />
          </div>
          <h2 className="text-[#8D4B00] font-extrabold text-3xl md:text-4xl mb-4 font-rubik">
            איך אנחנו יכולים לעזור?
          </h2>
          <p className="text-brand-textDark/80 text-base max-w-lg leading-relaxed">
            מצאו תשובות לשאלות נפוצות על שירותי הקהילה, זכויות לגיל השלישי וסיוע טכני. אנחנו כאן לכל שאלה.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8 max-w-xl mx-auto">
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-brand-textDark/50" />
          </div>
          <input
            type="text"
            placeholder="חיפוש נושא או שאלה..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-12 py-3.5 bg-white border border-brand-gray/80 rounded-2xl text-right text-brand-textDark focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all shadow-sm placeholder-brand-textDark/45"
          />
        </div>

        {/* Q&A Accordion List */}
        <div className="flex flex-col gap-4">
          {filteredQna.length > 0 ? (
            filteredQna.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <div 
                  key={item.id}
                  className={`bg-white border border-brand-gray/60 rounded-2xl overflow-hidden transition-all duration-300 ${
                    isExpanded ? 'shadow-md border-brand-primary/20 ring-1 ring-brand-primary/5' : 'hover:shadow-sm hover:border-brand-primary/15'
                  }`}
                >
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="w-full px-6 py-5 text-right flex items-center justify-between gap-4 font-semibold text-brand-textDark hover:text-brand-primary transition-colors focus:outline-none"
                    aria-expanded={isExpanded}
                  >
                    <span className="text-base md:text-lg font-rubik flex-1">
                      {item.question}
                    </span>
                    <ChevronDown 
                      className={`w-5 h-5 text-brand-primary/70 transition-transform duration-300 flex-shrink-0 ${
                        isExpanded ? 'transform rotate-180' : ''
                      }`} 
                    />
                  </button>
                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isExpanded ? 'max-h-96 border-t border-brand-gray/40' : 'max-h-0'
                    }`}
                  >
                    <p className="px-6 py-5 text-brand-textDark/90 text-sm md:text-base leading-relaxed bg-[#FCF9F6]/50 whitespace-pre-line">
                      {item.answer}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-2xl p-10 text-center border border-brand-gray/60">
              <p className="text-brand-textDark/60 text-base">לא נמצאו שאלות התואמות את החיפוש שלך.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
