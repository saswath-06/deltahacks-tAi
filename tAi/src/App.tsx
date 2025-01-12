import { useState } from 'react';
import StudyDashboard from './components/StudyDashboard';
import LoginScreen from './components/LoginScreen';

type User = {
  email: string;
} | null;

function App() {
  const [user, setUser] = useState<User>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleLogin = (email: string) => {
    setIsTransitioning(true);
    // Simulate auth delay
    setTimeout(() => {
      setUser({ email });
      setIsTransitioning(false);
    }, 500);
  };

  const handleSignOut = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setUser(null);
      setIsTransitioning(false);
    }, 500);
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      <div className={`absolute inset-0 bg-blue-600 transform transition-transform duration-500 ease-in-out ${isTransitioning ? 'translate-x-0' : '-translate-x-full'}`} />
      
      <div className={`h-full w-full transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        {user ? (
          <StudyDashboard user={user} onSignOut={handleSignOut} />
        ) : (
          <LoginScreen onLogin={handleLogin} />
        )}
      </div>
    </div>
  );
}

export default App;