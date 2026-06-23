import React, { useEffect, useMemo, useState } from 'react';
import { TopNavBar } from '../components/TopNavBar';
import {
  getAdminStats,
  getAdminUsers,
  getAdminUser,
  getAdminRequests,
  getAdminExceptionalRights,
  updateRequestStatus,
  type AdminStats,
  type AdminUserSummary,
  type AdminUserDetail,
  type AdminRequest,
  type AdminExceptionalRight,
} from '../services/api';

interface AdminDashboardProps {
  onNavigate: (route: 'home' | 'login' | 'form' | 'contact' | 'dashboard' | 'admin' | 'qna') => void;
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

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const InboxIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

const AlertIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

type View = 'users' | 'open' | 'exceptional';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, isLoggedIn }) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [view, setView] = useState<View>('users');
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [exceptionalRights, setExceptionalRights] = useState<AdminExceptionalRight[]>([]);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('date_desc');
  const [selected, setSelected] = useState<AdminUserSummary | null>(null);
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [error, setError] = useState('');

  const loadStats = () =>
    getAdminStats().then(setStats).catch(() => setError('שגיאה בטעינת הנתונים'));

  useEffect(() => {
    loadStats();
    getAdminUsers().then(setUsers).catch(() => setError('שגיאה בטעינת המשתמשים'));
  }, []);

  // (Re)load the active tab's data when the view changes.
  useEffect(() => {
    if (view === 'open') {
      getAdminRequests().then(setRequests).catch(() => setError('שגיאה בטעינת הפניות'));
    } else if (view === 'exceptional') {
      getAdminExceptionalRights().then(setExceptionalRights).catch(() => setError('שגיאה בטעינת הזכויות'));
    }
  }, [view]);

  // Mark a request handled → it drops out of the open list; refresh counters.
  const handleRequestDone = async (id: string) => {
    try {
      await updateRequestStatus(id, 'handled');
      setRequests((prev) => prev.filter((r) => r.id !== id));
      loadStats();
    } catch {
      setError('שגיאה בעדכון הפנייה');
    }
  };

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

        {/* Stat cards double as tabs — tap one to switch the view below. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatTab active={view === 'users'} onClick={() => setView('users')}
            label="רשומים לעמותה" value={stats?.registered_users} icon={<HandHeartIcon />} />
          <StatTab active={view === 'exceptional'} onClick={() => setView('exceptional')}
            label="זכויות בטיפול מעל 30 ימים" value={stats?.exceptional_rights} icon={<AlertIcon />} danger />
          <StatTab active={view === 'open'} onClick={() => setView('open')}
            label="פניות פתוחות" value={stats?.open_requests} icon={<InboxIcon />} />
        </div>

        {view === 'users' ? (
          /* Users panel */
          <section className="bg-white border border-[#EBE8E3] rounded-2xl shadow-[0_4px_20px_rgba(179,93,0,0.05)] overflow-hidden">
            <div className="flex flex-col gap-4 p-6 border-b border-[#F0EDE9]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-brand-primary">משתמשים רשומים בעמותה</h2>

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
                  <div className="relative w-full sm:w-auto">
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as SortKey)}
                      className="appearance-none w-full bg-[#F6F3EE] text-[#554337] text-sm rounded-full pr-4 pl-10 py-2.5 outline-none focus:ring-2 focus:ring-brand-primary/20 cursor-pointer"
                    >
                      {SORT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          מיון: {o.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDownIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A8B7E] pointer-events-none" />
                  </div>
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
                    className="w-full flex items-center gap-6 px-6 py-5 hover:bg-[#FCF9F4] transition-colors text-right"
                  >
                    {/* תאריך הצטרפות (rightmost) */}
                    <div className="flex flex-col gap-0.5 w-28 shrink-0">
                      <span className="text-xs text-[#9A8B7E]">תאריך הצטרפות</span>
                      <span className="text-sm font-semibold text-[#1C1C19]">{new Date(u.created_at).toLocaleDateString('he-IL')}</span>
                    </div>

                    {/* פרטי החבר — full name · phone · email */}
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="text-xs text-[#9A8B7E]">פרטי החבר</span>
                      <span className="text-base font-bold text-[#1C1C19] truncate">{u.name || 'ללא שם'}</span>
                      {u.phone && <span className="text-sm text-brand-primary" dir="ltr">{u.phone}</span>}
                      {u.email && <span className="text-xs text-[#554337] truncate" dir="ltr">{u.email}</span>}
                    </div>

                    {/* סוג משתמש */}
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0 hidden md:flex">
                      <span className="text-xs text-[#9A8B7E]">סוג משתמש</span>
                      <span className="text-sm text-[#1C1C19] truncate">{u.userType || '—'}</span>
                    </div>

                    {/* affordance (leftmost) */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap bg-[#FFDCC5] text-[#301400]">
                        צפייה בפרטים
                      </span>
                      <ChevronStartIcon className="text-[#9A8B7E]" />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : view === 'open' ? (
          <RequestsPanel requests={requests} onHandle={handleRequestDone} />
        ) : (
          <ExceptionalRightsPanel rights={exceptionalRights} />
        )}
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

// A stat card that doubles as a view tab. Active tab gets a colored bottom border.
const StatTab: React.FC<{
  active: boolean;
  onClick: () => void;
  label: string;
  value?: number;
  icon: React.ReactNode;
  danger?: boolean;
}> = ({ active, onClick, label, value, icon, danger }) => (
  <button
    onClick={onClick}
    className={`bg-white border border-[#EBE8E3] rounded-2xl shadow-[0_4px_20px_rgba(179,93,0,0.05)] p-6 flex items-center justify-between text-right transition-colors border-b-4 ${
      active ? 'border-b-brand-primary' : 'border-b-transparent hover:border-b-[#EBE8E3]'
    }`}
  >
    <div className="flex flex-col gap-1">
      <p className="text-[#554337] text-sm">{label}</p>
      <p className={`text-4xl font-bold tabular-nums ${danger && value ? 'text-[#B91C1C]' : 'text-[#1C1C19]'}`}>
        {value === undefined ? '—' : value.toLocaleString('en-US')}
      </p>
    </div>
    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
      danger ? 'bg-red-100 text-[#B91C1C]' : 'bg-brand-light/40 text-brand-primary'
    }`}>
      {icon}
    </div>
  </button>
);

// The open requests view: a list of contact-page enquiries.
const RequestsPanel: React.FC<{
  requests: AdminRequest[];
  onHandle: (id: string) => void;
}> = ({ requests, onHandle }) => (
  <section className="bg-white border border-[#EBE8E3] rounded-2xl shadow-[0_4px_20px_rgba(179,93,0,0.05)] overflow-hidden">
    <div className="p-6 border-b border-[#F0EDE9]">
      <h2 className="text-2xl font-bold text-brand-primary">ניהול פניות פתוחות</h2>
    </div>
    <ul className="divide-y divide-[#F0EDE9]">
      {requests.length === 0 && (
        <li className="p-6 text-center text-[#554337]">אין פניות פתוחות.</li>
      )}
      {requests.map((r) => (
        <RequestRow key={r.id} req={r} onHandle={onHandle} />
      ))}
    </ul>
  </section>
);

// A request hanging this many days (or more) is "emergent" — painted red.
const REQUEST_URGENT_DAYS = 3;

// One request row. Right→left: date · פרטי הפונה (name/phone/email) · נושא · status.
// Rows older than REQUEST_URGENT_DAYS are painted red to flag them as urgent.
// Expanding reveals the full description and every detail.
const RequestRow: React.FC<{
  req: AdminRequest;
  onHandle: (id: string) => void;
}> = ({ req, onHandle }) => {
  const [open, setOpen] = useState(false);
  const urgent = req.waiting_days >= REQUEST_URGENT_DAYS;
  const date = new Date(req.created_at).toLocaleDateString('he-IL');
  const waiting =
    req.waiting_days === 0 ? 'היום' : req.waiting_days === 1 ? 'אתמול' : `לפני ${req.waiting_days} ימים`;

  return (
    <li className={urgent ? 'border-r-4 border-r-[#B91C1C]' : 'border-r-4 border-r-transparent'}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-6 px-6 py-5 hover:bg-[#FCF9F4] transition-colors text-right"
      >
        {/* תאריך הפנייה (rightmost) */}
        <div className="flex flex-col gap-0.5 w-28 shrink-0">
          <span className="text-xs text-[#9A8B7E]">תאריך הפנייה</span>
          <span className={`text-sm font-semibold ${urgent ? 'text-[#B91C1C]' : 'text-[#1C1C19]'}`}>{date}</span>
          <span className={`text-xs ${urgent ? 'text-[#B91C1C]' : 'text-[#9A8B7E]'}`}>{waiting}</span>
        </div>

        {/* פרטי הפונה — full name · phone · email */}
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span className="text-xs text-[#9A8B7E]">פרטי הפונה</span>
          <span className="text-base font-bold text-[#1C1C19] truncate">{req.name || 'ללא שם'}</span>
          {req.phone && <span className="text-sm text-brand-primary" dir="ltr">{req.phone}</span>}
          {req.email && <span className="text-xs text-[#554337] truncate" dir="ltr">{req.email}</span>}
        </div>

        {/* נושא הפנייה */}
        <div className="flex flex-col gap-0.5 flex-1 min-w-0 hidden md:flex">
          <span className="text-xs text-[#9A8B7E]">נושא הפנייה</span>
          <span className="text-sm text-[#1C1C19] truncate">{req.title || '—'}</span>
        </div>

        {/* status (leftmost) + chevron */}
        <div className="flex items-center gap-3 shrink-0">
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${
              urgent ? 'bg-red-100 text-[#B91C1C]' : 'bg-[#FFDCC5] text-[#301400]'
            }`}
          >
            {urgent ? 'דחופה' : 'פתוחה'}
          </span>
          <ChevronDownIcon className={`text-[#9A8B7E] transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="bg-[#FCF9F4] px-6 py-5 border-t border-[#F0EDE9] flex flex-col gap-4">
          <div>
            <h4 className="text-sm font-semibold text-[#8D4B00] mb-1">נושא</h4>
            <p className="text-sm text-[#1C1C19]">{req.title || '—'}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#8D4B00] mb-1">תיאור הפנייה</h4>
            <p className="text-sm text-[#1C1C19] whitespace-pre-wrap break-words">{req.description}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {req.name && (
              <div className="flex flex-col">
                <span className="text-xs text-[#9A8B7E]">שם מלא</span>
                <span className="text-sm text-[#1C1C19]">{req.name}</span>
              </div>
            )}
            {req.email && (
              <div className="flex flex-col">
                <span className="text-xs text-[#9A8B7E]">דוא"ל</span>
                <span className="text-sm text-[#1C1C19]" dir="ltr">{req.email}</span>
              </div>
            )}
            {req.phone && (
              <div className="flex flex-col">
                <span className="text-xs text-[#9A8B7E]">טלפון</span>
                <span className="text-sm text-[#1C1C19]" dir="ltr">{req.phone}</span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-xs text-[#9A8B7E]">נפתחה בתאריך</span>
              <span className="text-sm text-[#1C1C19]">{new Date(req.created_at).toLocaleString('he-IL')}</span>
            </div>
          </div>
          <div>
            <button
              onClick={() => onHandle(req.id)}
              className="bg-brand-primary text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-brand-primary/90 transition-colors"
            >
              סמן כטופל
            </button>
          </div>
        </div>
      )}
    </li>
  );
};

// The exceptional view: tracked rights stuck on 'in_process' for > 30 days.
const ExceptionalRightsPanel: React.FC<{ rights: AdminExceptionalRight[] }> = ({ rights }) => (
  <section className="bg-white border border-[#EBE8E3] rounded-2xl shadow-[0_4px_20px_rgba(179,93,0,0.05)] overflow-hidden">
    <div className="p-6 border-b border-[#F0EDE9]">
      <h2 className="text-2xl font-bold text-brand-primary">זכויות התקועות בטיפול</h2>
    </div>
    <ul className="divide-y divide-[#F0EDE9]">
      {rights.length === 0 && (
        <li className="p-6 text-center text-[#554337]">אין זכויות התקועות בטיפול מעל 30 ימים.</li>
      )}
      {rights.map((item) => (
        <ExceptionalRightRow key={`${item.user_id}-${item.right_id}`} item={item} />
      ))}
    </ul>
  </section>
);

// One stuck-right row, styled like a RequestRow. Right→left: בטיפול מאז (date) ·
// פרטי החבר (name/phone/email) · הזכות · status. These rights are stuck > 30
// days by definition, so every row gets the red "urgent" treatment. Expanding
// reveals the right link and full member details.
const ExceptionalRightRow: React.FC<{ item: AdminExceptionalRight }> = ({ item }) => {
  const [open, setOpen] = useState(false);
  const since = new Date(item.updated_at).toLocaleDateString('he-IL');
  const stuck =
    item.stuck_days === 1 ? 'לפני יום' : `לפני ${item.stuck_days} ימים`;

  return (
    <li className="border-r-4 border-r-[#B91C1C]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-6 px-6 py-5 hover:bg-[#FCF9F4] transition-colors text-right"
      >
        {/* בטיפול מאז (rightmost) */}
        <div className="flex flex-col gap-0.5 w-28 shrink-0">
          <span className="text-xs text-[#9A8B7E]">בטיפול מאז</span>
          <span className="text-sm font-semibold text-[#B91C1C]">{since}</span>
          <span className="text-xs text-[#B91C1C]">{stuck}</span>
        </div>

        {/* פרטי החבר — full name · phone · email */}
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span className="text-xs text-[#9A8B7E]">פרטי החבר</span>
          <span className="text-base font-bold text-[#1C1C19] truncate">{item.name || 'ללא שם'}</span>
          {item.phone && <span className="text-sm text-brand-primary" dir="ltr">{item.phone}</span>}
          {item.email && <span className="text-xs text-[#554337] truncate" dir="ltr">{item.email}</span>}
        </div>

        {/* הזכות */}
        <div className="flex flex-col gap-0.5 flex-1 min-w-0 hidden md:flex">
          <span className="text-xs text-[#9A8B7E]">הזכות התקועה</span>
          <span className="text-sm text-[#1C1C19] truncate">{item.name_he}</span>
        </div>

        {/* status (leftmost) + chevron */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap bg-red-100 text-[#B91C1C]">
            תקועה
          </span>
          <ChevronDownIcon className={`text-[#9A8B7E] transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="bg-[#FCF9F4] px-6 py-5 border-t border-[#F0EDE9] flex flex-col gap-4">
          <div>
            <h4 className="text-sm font-semibold text-[#8D4B00] mb-1">הזכות התקועה</h4>
            <p className="text-sm text-[#1C1C19]">{item.name_he}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-[#9A8B7E]">שם מלא</span>
              <span className="text-sm text-[#1C1C19]">{item.name || 'ללא שם'}</span>
            </div>
            {item.email && (
              <div className="flex flex-col">
                <span className="text-xs text-[#9A8B7E]">דוא"ל</span>
                <span className="text-sm text-[#1C1C19]" dir="ltr">{item.email}</span>
              </div>
            )}
            {item.phone && (
              <div className="flex flex-col">
                <span className="text-xs text-[#9A8B7E]">טלפון</span>
                <span className="text-sm text-[#1C1C19]" dir="ltr">{item.phone}</span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-xs text-[#9A8B7E]">בטיפול מאז</span>
              <span className="text-sm text-[#1C1C19]">{new Date(item.updated_at).toLocaleString('he-IL')}</span>
            </div>
            {item.source_url && (
              <div className="flex flex-col">
                <span className="text-xs text-[#9A8B7E]">מקור</span>
                <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-primary hover:underline">
                  קישור לזכות
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </li>
  );
};
