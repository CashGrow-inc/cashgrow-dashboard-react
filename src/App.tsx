import React, { useCallback, useEffect, useState } from 'react';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';

type AppView = 'landing' | 'dashboard';

const resolveViewFromHash = (): AppView => {
  if (typeof window === 'undefined') {
    return 'landing';
  }
  return window.location.hash === '#dashboard' ? 'dashboard' : 'landing';
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(resolveViewFromHash);

  const goToLanding = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.location.hash = '';
    }
    setView('landing');
  }, []);

  const goToDashboard = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.location.hash = '#dashboard';
    }
    setView('dashboard');
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const handleHashChange = () => {
      setView(resolveViewFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (view === 'dashboard') {
    return <Dashboard onNavigateToLanding={goToLanding} />;
  }

  return <Landing onNavigateToDashboard={goToDashboard} />;
};

export default App;
