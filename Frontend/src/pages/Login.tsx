import React from 'react';
import { TopNavBar } from '../components/TopNavBar';
import { LoginForm } from '../components/LoginForm';

export const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <TopNavBar />
      
      {/* Atmospheric Background Element */}
      <div className="absolute top-[-96px] left-[1024px] w-[384px] h-[378px] bg-brand-light blur-[64px] rounded-full pointer-events-none" />

      <main className="flex justify-center items-center h-screen pt-16">
        <LoginForm />
      </main>
    </div>
  );
};
