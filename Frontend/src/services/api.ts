const API_BASE_URL = 'http://localhost:3000';

export const login = async (email: string, password: string): Promise<{ success: boolean; token?: string; user_id?: string; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (response.ok && data.user_id) {
      return { success: true, user_id: data.user_id };
    }
    return { success: false, error: data.error || 'Login failed' };
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
};

export const registerFull = async (formData: any): Promise<{ success: boolean; user_id?: string; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/registrations/full`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
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
    const response = await fetch(`${API_BASE_URL}/users/${userId}/rights`);
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

export const getUserEvaluation = async (userId: string): Promise<{ success: boolean; rights?: any[]; disclaimer?: string; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/evaluation`);
    const data = await response.json();
    if (response.ok) {
      return { success: true, rights: data.rights, disclaimer: data.disclaimer };
    }
    return { success: false, error: data.error || 'Failed to fetch user evaluation' };
  } catch (error: any) {
    console.error('getUserEvaluation error:', error);
    return { success: false, error: error.message };
  }
};

export const updateRightStatus = async (userId: string, rightId: number | string, status: string | null): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/rights/${rightId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
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
