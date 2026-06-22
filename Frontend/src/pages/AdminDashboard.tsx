import React, { useEffect, useMemo, useState } from 'react';
import { TopNavBar } from '../components/TopNavBar';
import {
  getAdminStats,
  getAdminUsers,
  getAdminUser,
  type AdminUserSummary,
  type AdminUserDetail,
} from '../services/api';

interface AdminDashboardProps {
  onNavigate: (route: 'home' | 'login' | 'form' | 'contact' | 'dashboard' | 'admin') => void;
  isLoggedIn?: boolean;
}

// Hebrew labels for the tracked-right status enum (mirrors the member dashboard).
const STATUS_LABELS: Record<string, string> = {
  realized: 'ממומשת',
  in_process: 'בטיפול',
  worth_checking: 'שווה לבדוק',
};

type SortKey = 'date_desc' | 'date_asc' | 'name_asc' | 'name_desc';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'date_desc', label: 'תאריך הצטרפות (מהחדש לישן)' },
  { value: 'date_asc', label: 'תאריך הצטרפות (מהישן לחדש)' },
  { value: 'name_asc', label: 'שם (א-ת)' },
  { value: 'name_desc', label: 'שם (ת-א)' },
];

// Top-level profile sections → Hebrew titles. `results` (the engine output) and
// `password` are excluded from display entirely.
const HIDDEN_PROFILE_KEYS = ['results', 'password'];
const SECTION_LABELS: Record<string, string> = {
  amputeeDetails: 'פרטי הקטוע',
  familyMemberDetails: 'פרטי בן/בת משפחה',
  amputationDescription: 'תיאור הקטיעה',
  prosthesisUsage: 'שימוש בתותבת',
  generalQuestions: 'שאלות כלליות',
  metadata: 'מטא-דאטה',
};

// Field keys → Hebrew labels. Unmapped keys fall back to a humanized key.
const FIELD_LABELS: Record<string, string> = {
  id: 'מזהה', email: 'דוא"ל', userType: 'סוג משתמש', created_at: 'תאריך הצטרפות',
  firstName: 'שם פרטי', lastName: 'שם משפחה', birthDate: 'תאריך לידה', gender: 'מין',
  maritalStatus: 'מצב משפחתי', hasChildren: 'ילדים', numberOfChildren: 'מספר ילדים',
  mobileNumber: 'טלפון נייד', additionalContactNumber: 'טלפון נוסף', updateEmail: 'דוא"ל לעדכונים',
  updatePhoneType: 'אופן עדכון', consentUpdates: 'הסכמה לעדכונים', consentMail: 'הסכמה לדיוור',
  address: 'כתובת', city: 'עיר', street: 'רחוב', country: 'מדינה', zip: 'מיקוד', fullAddress: 'כתובת מלאה',
  relationToAmputee: 'קשר לקטוע', emergencyContactName: 'איש קשר לחירום', emergencyContactPhone: 'טלפון חירום',
  supportGroupPartners: 'קבוצת תמיכה - בני זוג', supportGroupParents: 'קבוצת תמיכה - הורים',
  amputationReason: 'סיבת הקטיעה', insuringBody: 'גוף מבטח', amputationTypes: 'סוגי קטיעה',
  amputatedLegs: 'רגליים קטועות', leftLegAmputationLevel: 'רמת קטיעה - רגל שמאל',
  rightLegAmputationLevel: 'רמת קטיעה - רגל ימין', usesProsthesis: 'משתמש בתותבת',
  otherAssistiveDevices: 'אביזרי עזר נוספים', amputationDate: 'תאריך הקטיעה',
  instituteName: 'מכון', prosthesisType: 'סוג תותבת', usageFrequency: 'תדירות שימוש',
  hasSportsProsthesis: 'תותבת ספורט', interestedActivities: 'פעילויות מעניינות',
  interestedSports: 'ענפי ספורט', aboutYourself: 'על עצמך',
  currentlyWorkingFullTime: 'עובד/ת במשרה מלאה', receivingDisabilityAllowance: 'מקבל/ת קצבת נכות',
  hasMedicalCommittee: 'עבר/ה ועדה רפואית', interestedInRehab: 'מעוניין/ת בשיקום',
  needsHousingAdaptation: 'זקוק/ה להתאמת דיור',
  formId: 'מזהה טופס', submittedAt: 'נשלח בתאריך', source: 'מקור',
};

function humanize(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').replace(/^./, (c) => c.toUpperCase()).trim();
}

function labelFor(key: string): string {
  return FIELD_LABELS[key] ?? SECTION_LABELS[key] ?? humanize(key);
}

// Render any profile value as readable Hebrew text (or null to skip empties).
function formatValue(key: string, v: any): string | null {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'boolean') return v ? 'כן' : 'לא';
  if (Array.isArray(v)) {
    const items = v.map((x) => formatValue(key, x)).filter(Boolean);
    return items.length ? items.join(', ') : null;
  }
  if (typeof v === 'object') {
    // Flatten a nested object (e.g. address) into "label: value · label: value".
    const parts = Object.entries(v)
      .map(([k, val]) => {
        const s = formatValue(k, val);
        return s ? `${labelFor(k)}: ${s}` : null;
      })
      .filter(Boolean);
    return parts.length ? parts.join(' · ') : null;
  }
  if ((key === 'created_at' || key === 'submittedAt') && !Number.isNaN(Date.parse(v))) {
    return new Date(v).toLocaleString('he-IL');
  }
  return String(v);
}

// Split a profile object into a flat "general" group (scalars at the top level)
// plus one group per nested section, each as a list of label/value pairs.
function buildProfileGroups(profile: Record<string, any>): { title: string; fields: { label: string; value: string }[] }[] {
  const groups: { title: string; fields: { label: string; value: string }[] }[] = [];
  const general: { label: string; value: string }[] = [];

  for (const [key, value] of Object.entries(profile)) {
    if (HIDDEN_PROFILE_KEYS.includes(key)) continue;
    const isSection = value && typeof value === 'object' && !Array.isArray(value);
    if (isSection) {
      const fields = Object.entries(value as Record<string, any>)
        .map(([k, v]) => {
          const formatted = formatValue(k, v);
          return formatted ? { label: labelFor(k), value: formatted } : null;
        })
        .filter((f): f is { label: string; value: string } => f !== null);
      if (fields.length) groups.push({ title: SECTION_LABELS[key] ?? humanize(key), fields });
    } else {
      const formatted = formatValue(key, value);
      if (formatted) general.push({ label: labelFor(key), value: formatted });
    }
  }

  return general.length ? [{ title: 'פרטים כלליים', fields: general }, ...groups] : groups;
}

// Inline icons (the codebase uses inline SVGs rather than an icon library).
const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const HandHeartIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16" />
    <path d="m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9" />
    <path d="m2 15 6 6" />
    <path d="M19.5 8.5c.7-.7 1.5-1.6 1.5-2.7A2.73 2.73 0 0 0 16 4a2.78 2.78 0 0 0-5 1.8c0 1.2.8 2 1.5 2.8L16 12Z" />
  </svg>
);

// Chevron pointing to the start (left in RTL) — a "open" affordance on each row.
const ChevronStartIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, isLoggedIn }) => {
  const [registeredUsers, setRegisteredUsers] = useState<number | null>(null);
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('date_desc');
  const [selected, setSelected] = useState<AdminUserSummary | null>(null);
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminStats()
      .then((s) => setRegisteredUsers(s.registered_users))
      .catch(() => setError('שגיאה בטעינת הנתונים'));
    getAdminUsers()
      .then(setUsers)
      .catch(() => setError('שגיאה בטעינת המשתמשים'));
  }, []);

  const visible = useMemo(() => {
    const q = query.trim();
    const filtered = q
      ? users.filter(
          (u) => u.name.includes(q) || (u.phone ?? '').includes(q) || (u.email ?? '').includes(q)
        )
      : users.slice();
    filtered.sort((a, b) => {
      switch (sort) {
        case 'name_asc':
          return a.name.localeCompare(b.name, 'he');
        case 'name_desc':
          return b.name.localeCompare(a.name, 'he');
        case 'date_asc':
          return +new Date(a.created_at) - +new Date(b.created_at);
        case 'date_desc':
        default:
          return +new Date(b.created_at) - +new Date(a.created_at);
      }
    });
    return filtered;
  }, [users, query, sort]);

  const openUser = async (u: AdminUserSummary) => {
    setSelected(u);
    setDetail(null);
    try {
      setDetail(await getAdminUser(u.id));
    } catch {
      setError('שגיאה בטעינת פרטי המשתמש');
    }
  };

  const closeUser = () => {
    setSelected(null);
    setDetail(null);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-brand-bgLight pb-20 relative overflow-hidden">
      <TopNavBar onNavigate={onNavigate} isLoggedIn={isLoggedIn} />

      {/* Atmospheric Background Element */}
      <div className="absolute top-[5%] left-[-150px] w-[600px] h-[600px] bg-[#FEA776]/10 blur-[100px] rounded-full pointer-events-none" />

      <main className="pt-28 px-6 lg:px-20 max-w-7xl mx-auto flex flex-col gap-10 relative z-10">
        {/* Page title */}
        <div className="flex flex-col gap-2 border-b border-[#DBC2B2]/40 pb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1C1C19]">עמוד מנהלים</h1>
          <p className="text-[#554337] text-lg">ניהול חברי העמותה ומעקב אחר זכויותיהם</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
        )}

        {/* Stat card — only the real registered-users count is backed by data. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-[#EBE8E3] rounded-2xl shadow-[0_4px_20px_rgba(179,93,0,0.05)] p-6 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-[#554337] text-sm">רשומים לעמותה</p>
              <p className="text-4xl font-bold text-[#1C1C19] tabular-nums">
                {registeredUsers === null ? '—' : registeredUsers.toLocaleString('en-US')}
              </p>
            </div>
            <div className="w-12 h-12 bg-brand-light/40 rounded-full flex items-center justify-center text-brand-primary flex-shrink-0">
              <HandHeartIcon />
            </div>
          </div>
        </div>

        {/* Users panel */}
        <section className="bg-white border border-[#EBE8E3] rounded-2xl shadow-[0_4px_20px_rgba(179,93,0,0.05)] overflow-hidden">
          <div className="flex flex-col gap-4 p-6 border-b border-[#F0EDE9]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-brand-primary">משתמשים חדשים להצטרפות</h2>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A8B7E]" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="חיפוש משתמש..."
                    className="w-full bg-[#F6F3EE] rounded-full py-2.5 pr-10 pl-4 text-sm text-[#554337] outline-none focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>

                {/* Sort */}
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="bg-[#F6F3EE] text-[#554337] text-sm rounded-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-primary/20 cursor-pointer"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      מיון: {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <ul className="divide-y divide-[#F0EDE9]">
            {visible.length === 0 && (
              <li className="p-6 text-center text-[#554337]">אין משתמשים להצגה.</li>
            )}
            {visible.map((u) => (
              <li key={u.id}>
                <button
                  onClick={() => openUser(u)}
                  className="w-full flex items-center justify-between px-6 py-5 hover:bg-[#FCF9F4] transition-colors"
                >
                  <div className="flex flex-col gap-0.5 text-right">
                    <span className="font-bold text-[#1C1C19] text-lg">{u.name || 'ללא שם'}</span>
                    <span className="text-brand-primary text-sm" dir="ltr">{u.phone || '—'}</span>
                  </div>
                  <ChevronStartIcon className="text-[#9A8B7E]" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>

      {selected && (
        <UserModal summary={selected} detail={detail} onClose={closeUser} />
      )}
    </div>
  );
};

// Popup with the full member record: profile details + tracked rights.
const UserModal: React.FC<{
  summary: AdminUserSummary;
  detail: AdminUserDetail | null;
  onClose: () => void;
}> = ({ summary, detail, onClose }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const groups = detail ? buildProfileGroups(detail.profile) : [];

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1C1C19]/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative bg-[#FCF9F4] w-full max-w-4xl max-h-[85vh] rounded-[32px] shadow-2xl flex flex-col border border-[#DBC2B2]/40 overflow-hidden"
        dir="rtl"
      >
        {/* Header */}
        <div className="bg-brand-primary p-5 flex justify-between items-center shrink-0">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-white font-bold text-xl">{summary.name || 'ללא שם'}</h3>
            {summary.phone && (
              <p className="text-brand-light text-sm" dir="ltr">{summary.phone}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
            aria-label="סגור"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
          {!detail ? (
            <p className="text-[#554337] text-sm text-center py-10">טוען פרטים...</p>
          ) : (
            <>
              {/* Profile details — every populated field, grouped by section */}
              {groups.map((group) => (
                <div key={group.title}>
                  <h4 className="text-sm font-semibold text-[#8D4B00] mb-3">{group.title}</h4>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                    {group.fields.map((f) => (
                      <div key={f.label} className="flex flex-col">
                        <dt className="text-xs text-[#9A8B7E]">{f.label}</dt>
                        <dd className="text-sm text-[#1C1C19] whitespace-pre-wrap break-words">{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}

              {/* Relevant rights + status */}
              <div>
                <h4 className="text-sm font-semibold text-[#8D4B00] mb-3">זכויות רלוונטיות</h4>
                {detail.rights.length === 0 ? (
                  <p className="text-sm text-[#554337]">לא נמצאו זכויות במעקב.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {detail.rights.map((r) => (
                      <li
                        key={r.right_id}
                        className="flex items-center justify-between bg-white border border-[#EBE8E3] rounded-lg px-4 py-3 gap-3"
                      >
                        <span className="text-sm text-[#1C1C19]">{r.name_he}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          {r.confidence !== null && (
                            <span className="text-xs text-[#9A8B7E] whitespace-nowrap">
                              {r.confidence}% התאמה
                            </span>
                          )}
                          {r.status && (
                            <span className="bg-[#FFDCC5] text-[#301400] text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap">
                              {STATUS_LABELS[r.status] ?? r.status}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
