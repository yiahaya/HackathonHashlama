import { useState, useEffect } from 'react';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { FormWizard } from './pages/FormWizard'
import { Contact } from './pages/Contact';
import { Dashboard } from './pages/Dashboard';
import { VoiceAssistant } from './components/VoiceAssistant';

function App() {
  const [currentRoute, setCurrentRoute] = useState<'home' | 'login' | 'form' | 'contact' | 'dashboard'>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = (id: string) => {
    setUserId(id);
    setIsLoggedIn(true);
    localStorage.setItem('userId', id);
    setCurrentRoute('dashboard');
  };

  const handleLogout = () => {
    setUserId(null);
    setIsLoggedIn(false);
    localStorage.removeItem('userId');
    setCurrentRoute('home');
  };

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
          className={`mr-2 px-3 py-1 rounded text-sm ${currentRoute === 'login' ? 'bg-brand-primary text-white' : 'bg-gray-200'}`}
        >
          Login
        </button>
        <button 
          onClick={() => setCurrentRoute('form')}
          className={`mr-2 px-3 py-1 rounded text-sm ${currentRoute === 'form' ? 'bg-brand-primary text-white' : 'bg-gray-200'}`}
        >
          Form Wizard
        </button>
        <button 
          onClick={() => setCurrentRoute('contact')}
          className={`mr-2 px-3 py-1 rounded text-sm ${currentRoute === 'contact' ? 'bg-brand-primary text-white' : 'bg-gray-200'}`}
        >
          Contact
        </button>
        <button 
          onClick={() => setCurrentRoute('dashboard')}
          className={`px-3 py-1 rounded text-sm ${currentRoute === 'dashboard' ? 'bg-brand-primary text-white' : 'bg-gray-200'}`}
        >
          Dashboard
        </button>
        {isLoggedIn && (
          <button 
            onClick={handleLogout}
            className={`ml-2 px-3 py-1 rounded text-sm bg-red-500 text-white`}
          >
            Logout
          </button>
        )}
      </div>

      {currentRoute === 'home' && <Home onNavigate={setCurrentRoute} isLoggedIn={isLoggedIn} />}
      {currentRoute === 'login' && <Login onLogin={handleLoginSuccess} />}
      {currentRoute === 'form' && <FormWizard onNavigate={setCurrentRoute} onLoginSuccess={handleLoginSuccess} />}
      {currentRoute === 'contact' && <Contact onNavigate={setCurrentRoute} isLoggedIn={isLoggedIn} />}
      {currentRoute === 'dashboard' && <Dashboard onNavigate={setCurrentRoute} isLoggedIn={isLoggedIn} userId={userId} />}

      <VoiceAssistant onNavigate={setCurrentRoute} />
    </>
  );
}

export default App;
