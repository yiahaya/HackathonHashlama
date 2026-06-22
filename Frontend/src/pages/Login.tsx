import React from 'react';
import { LoginForm } from '../components/LoginForm';
import { TopNavBar } from '../components/TopNavBar';

interface LoginProps {
  onLogin?: (result: { user_id: string | null; is_admin: boolean }) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <TopNavBar isLoggedIn={false} />
      
      {/* Atmospheric Background Element */}
      <div className="absolute top-[-96px] left-[1024px] w-[384px] h-[378px] bg-brand-light blur-[64px] rounded-full pointer-events-none" />

      <main className="flex justify-center items-center h-screen pt-16">
        <LoginForm onLogin={onLogin} />
      </main>
    </div>
  );
};
