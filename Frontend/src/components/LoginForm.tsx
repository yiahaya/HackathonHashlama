import React, { useState } from 'react';
import { Button } from './Button';
import { login } from '../services/api';

interface LoginFormProps {
  onLogin?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      if (result.success) {
        alert('התחברת בהצלחה!');
        onLogin?.();
      } else {
        setError('שם משתמש או סיסמה שגויים');
      }
    } catch (err) {
      setError('אירעה שגיאה. אנא נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-[0_10px_30px_-10px_rgba(120,53,15,0.1)] border border-brand-primary/10 max-w-md w-full relative z-10">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-brand-primary mb-2">התחברות לאזור האישי</h2>
        <p className="text-brand-textDark/80 text-sm">אנחנו כאן כדי ללוות אותך בדרכך</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-right">
            {error}
          </div>
        )}
        
        <div className="flex flex-col gap-2">
          <label className="text-right text-sm font-medium text-brand-textDark" htmlFor="email">
            דואר אלקטרוני
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-3 text-right focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors"
            placeholder="test@test.com"
            dir="ltr"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-right text-sm font-medium text-brand-textDark" htmlFor="password">
            סיסמה
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-3 text-right focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors"
            placeholder="password123"
            dir="ltr"
          />
        </div>

        <div className="text-right mt-[-8px]">
          <a href="#" className="text-sm text-brand-primary hover:underline">
            שכחת סיסמה?
          </a>
        </div>

        <Button type="submit" fullWidth disabled={loading}>
          {loading ? 'מתחבר...' : 'כניסה'}
        </Button>
      </form>
    </div>
  );
};
