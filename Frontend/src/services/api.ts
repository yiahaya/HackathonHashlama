export const login = async (email: string, password: string): Promise<{ success: boolean; token?: string }> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      if (email === 'test@test.com' && password === 'password123') {
        resolve({ success: true, token: 'mock-jwt-token' });
      } else {
        resolve({ success: false });
      }
    }, 1000);
  });
};
