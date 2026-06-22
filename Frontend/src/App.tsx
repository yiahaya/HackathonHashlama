import React, { useState } from 'react';
import { Home } from './pages/Home';
import { Login } from './pages/Login';

function App() {
  // Simple state-based routing for now
  const [currentRoute, setCurrentRoute] = useState<'home' | 'login'>('home');

  return (
    <>
      <div className="fixed bottom-4 left-4 z-[9999] bg-white p-2 rounded shadow-lg border border-gray-200">
        <p className="text-sm font-bold mb-2">Dev Navigation</p>
        <button 
          onClick={() => setCurrentRoute('home')}
          className={`mr-2 px-3 py-1 rounded text-sm ${currentRoute === 'home' ? 'bg-brand-primary text-white' : 'bg-gray-200'}`}
        >
          Home
        </button>
        <button 
          onClick={() => setCurrentRoute('login')}
          className={`px-3 py-1 rounded text-sm ${currentRoute === 'login' ? 'bg-brand-primary text-white' : 'bg-gray-200'}`}
        >
          Login
        </button>
      </div>

      {currentRoute === 'home' ? <Home /> : <Login />}
    </>
  );
}

export default App;
