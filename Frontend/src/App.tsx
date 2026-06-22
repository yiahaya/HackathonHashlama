import { useState } from 'react';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { FormWizard } from './pages/FormWizard'
import { Contact } from './pages/Contact';
import { Dashboard } from './pages/Dashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { VoiceAssistant } from './components/VoiceAssistant';

function App() {
  // Simple state-based routing for now
  const [currentRoute, setCurrentRoute] = useState<'home' | 'login' | 'form' | 'contact' | 'dashboard' | 'admin'>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
          className={`mr-2 px-3 py-1 rounded text-sm ${currentRoute === 'dashboard' ? 'bg-brand-primary text-white' : 'bg-gray-200'}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setCurrentRoute('admin')}
          className={`px-3 py-1 rounded text-sm ${currentRoute === 'admin' ? 'bg-brand-primary text-white' : 'bg-gray-200'}`}
        >
          Admin
        </button>
      </div>

      {currentRoute === 'home' && <Home onNavigate={setCurrentRoute} isLoggedIn={isLoggedIn} />}
      {currentRoute === 'login' && (
        <Login
          onLogin={(result) => {
            setIsLoggedIn(true);
            setCurrentRoute(result.is_admin ? 'admin' : 'dashboard');
          }}
        />
      )}
      {currentRoute === 'form' && <FormWizard onNavigate={setCurrentRoute} />}
      {currentRoute === 'contact' && <Contact onNavigate={setCurrentRoute} isLoggedIn={isLoggedIn} />}
      {currentRoute === 'dashboard' && <Dashboard onNavigate={setCurrentRoute} isLoggedIn={isLoggedIn} />}
      {currentRoute === 'admin' && <AdminDashboard onNavigate={setCurrentRoute} isLoggedIn={isLoggedIn} />}

      <VoiceAssistant onNavigate={setCurrentRoute} />
    </>
  );
}

export default App;
