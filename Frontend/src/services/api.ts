// API client for the backend. Defaults to same-origin relative paths so it works
// through a tunnel/reverse proxy (Vite proxies /login, /admin, /registrations,
// /users, /evaluate to the backend — see vite.config.ts). Override with
// VITE_API_BASE to hit a backend directly.
const API_BASE = import.meta.env.VITE_API_BASE ?? '';

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export interface LoginResult {
  success: boolean;
  user_id: string | null;
  is_admin: boolean;
  error?: string;
}

// POC auth: returns whether login succeeded, the matched registration id, and
// whether it's an admin (used to gate the admin panel).
export const login = async (email: string, password: string): Promise<LoginResult> => {
  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (response.ok && data.user_id) {
      return { success: true, user_id: data.user_id, is_admin: !!data.is_admin };
    }
    return { success: false, user_id: null, is_admin: false, error: data.error || 'Login failed' };
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, user_id: null, is_admin: false, error: error.message };
  }
};

export const registerFull = async (formData: any): Promise<{ success: boolean; user_id?: string; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE}/registrations/full`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await response.json();
    if (response.ok && data.user_id) {
      return { success: true, user_id: data.user_id };
    }
    return { success: false, error: data.error || 'Registration failed' };
  } catch (error: any) {
    console.error('Registration error:', error);
    return { success: false, error: error.message };
  }
};

export const getUserRights = async (userId: string): Promise<{ success: boolean; rights?: any[]; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}/rights`);
    const data = await response.json();
    if (response.ok) {
      return { success: true, rights: data.rights };
    }
    return { success: false, error: data.error || 'Failed to fetch user rights' };
  } catch (error: any) {
    console.error('getUserRights error:', error);
    return { success: false, error: error.message };
  }
};

export const getUserEvaluation = async (userId: string): Promise<{ success: boolean; name?: string; rights?: any[]; disclaimer?: string; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}/evaluation`);
    const data = await response.json();
    if (response.ok) {
      return { success: true, name: data.name, rights: data.rights, disclaimer: data.disclaimer };
    }
    return { success: false, error: data.error || 'Failed to fetch user evaluation' };
  } catch (error: any) {
    console.error('getUserEvaluation error:', error);
    return { success: false, error: error.message };
  }
};

export const updateRightStatus = async (userId: string, rightId: number | string, status: string | null): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}/rights/${rightId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (response.ok) {
      return { success: true };
    }
    const data = await response.json();
    return { success: false, error: data.error || 'Failed to update right status' };
  } catch (error: any) {
    console.error('updateRightStatus error:', error);
    return { success: false, error: error.message };
  }
};

export const updateStepStatus = async (userId: string, rightId: number | string, step: string, is_completed: boolean): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}/rights/${rightId}/steps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step, is_completed })
    });
    if (response.ok) {
      return { success: true };
    }
    const data = await response.json();
    return { success: false, error: data.error || 'Failed to update step status' };
  } catch (error: any) {
    console.error('updateStepStatus error:', error);
    return { success: false, error: error.message };
  }
};

// POST /requests — submit a contact-page enquiry.
export const createRequest = async (payload: {
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  description: string;
}): Promise<{ success: boolean; id?: string; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (response.ok && data.id) {
      return { success: true, id: data.id };
    }
    return { success: false, error: data.error || 'Failed to submit request' };
  } catch (error: any) {
    console.error('createRequest error:', error);
    return { success: false, error: error.message };
  }
};

// --- Admin panel ---

export interface AdminStats {
  registered_users: number;
  open_requests: number;
  exceptional_rights: number;
}

export interface AdminRequest {
  id: string;
  name: string | null;
  title: string | null;
  email: string | null;
  phone: string | null;
  description: string;
  status: 'open' | 'handled';
  created_at: string;
  waiting_days: number;
}

export const getAdminRequests = () =>
  getJson<{ requests: AdminRequest[] }>('/admin/requests').then((d) => d.requests);

export interface AdminExceptionalRight {
  user_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  right_id: number;
  name_he: string;
  source_url: string | null;
  updated_at: string;
  stuck_days: number;
}

export const getAdminExceptionalRights = () =>
  getJson<{ rights: AdminExceptionalRight[] }>('/admin/exceptional-rights').then((d) => d.rights);

export const updateRequestStatus = async (id: string, status: 'open' | 'handled') => {
  const res = await fetch(`${API_BASE}/admin/requests/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`Failed to update request: ${res.status}`);
  return res.json();
};

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
