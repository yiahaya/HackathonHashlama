// API client for the backend. Defaults to same-origin relative paths so it works
// through a tunnel/reverse proxy (Vite proxies /login, /admin, … to the backend —
// see vite.config.ts). Override with VITE_API_BASE to hit a backend directly.
const API_BASE = import.meta.env.VITE_API_BASE ?? '';

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export interface LoginResult {
  user_id: string | null;
  is_admin: boolean;
}

// POC auth: returns the matched registration id (or null) and whether it's an
// admin. `success` is derived for the existing LoginForm call site.
export const login = async (
  email: string,
  password: string
): Promise<LoginResult & { success: boolean }> => {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status}`);
  const data = (await res.json()) as LoginResult;
  return { ...data, success: data.user_id !== null };
};

// --- Admin panel ---

export interface AdminStats {
  registered_users: number;
}

export interface AdminUserSummary {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  userType: string | null;
  created_at: string;
}

export interface AdminUserRight {
  right_id: number;
  name_he: string;
  source_url: string | null;
  status: 'realized' | 'in_process' | 'worth_checking' | null;
  confidence: number | null;
}

export interface AdminUserDetail {
  profile: Record<string, any>;
  rights: AdminUserRight[];
}

export const getAdminStats = () => getJson<AdminStats>('/admin/stats');

export const getAdminUsers = () =>
  getJson<{ users: AdminUserSummary[] }>('/admin/users').then((d) => d.users);

export const getAdminUser = (id: string) =>
  getJson<AdminUserDetail>(`/admin/users/${id}`);
