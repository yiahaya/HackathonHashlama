import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LoginForm } from './LoginForm';
import * as api from '../services/api';

// Mock the API service
vi.mock('../services/api', () => ({
  login: vi.fn()
}));

describe('LoginForm', () => {
  it('renders email and password inputs', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/דואר אלקטרוני/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/סיסמה/i)).toBeInTheDocument();
  });

  it('shows error on failed login', async () => {
    vi.mocked(api.login).mockResolvedValueOnce({ success: false, user_id: null, is_admin: false });
    
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/דואר אלקטרוני/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/סיסמה/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /כניסה/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/שם משתמש או סיסמה שגויים/i)).toBeInTheDocument();
    });
  });
});
