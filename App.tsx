import React, { useState, useCallback } from 'react';
import { Screen } from './types';

// Components
import WelcomeScreen from './components/WelcomeScreen';
import ThankYouScreen from './components/ThankYouScreen';
import BankConnectionScreen from './components/BankConnectionScreen';
import AccountsScreen from './components/AccountsScreen';
import FoundersPage from './components/FoundersPage';
import VerifyEmailScreen from './components/VerifyEmailScreen';
import { Header, BottomNav } from './components/Layout';

// Screens
import GrowScreen from './components/GrowScreen';
import UnplannedScreen from './components/UnplannedScreen';
import MonthliesScreen from './components/MonthliesScreen';
import FixedScreen from './components/FixedScreen';
import IncomeScreen from './components/IncomeScreen';

// Context
import { AuthProvider, useAuth } from './AuthContext';

const AppContent: React.FC = () => {
  const { isLoggedIn, logout } = useAuth();

  // Persist bank connection state to localStorage
  const [isBankConnected, setIsBankConnected] = useState(() => {
    return localStorage.getItem('isBankConnected') === 'true';
  });
  const [activeScreen, setActiveScreen] = useState<Screen>(Screen.Grow);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showAccounts, setShowAccounts] = useState(false);
  const [showFounders, setShowFounders] = useState(false);

  const handleShowThankYou = useCallback(() => {
    setShowThankYou(true);
  }, []);

  const handleBankConnectionComplete = useCallback(() => {
    setIsBankConnected(true);
    localStorage.setItem('isBankConnected', 'true');
  }, []);

  const handleSkipBankConnection = useCallback(() => {
    setIsBankConnected(true);
    localStorage.setItem('isBankConnected', 'true');
  }, []);

  const handleConnectBank = useCallback(() => {
    setIsBankConnected(false);
    localStorage.setItem('isBankConnected', 'false');
  }, []);

  const handleSignOut = useCallback(() => {
    logout();
    setIsBankConnected(false);
    localStorage.removeItem('isBankConnected');
  }, [logout]);

  const handleShowAccounts = useCallback(() => {
    setShowAccounts(true);
  }, []);

  const handleBackFromAccounts = useCallback(() => {
    setShowAccounts(false);
  }, []);

  const handleShowFounders = useCallback(() => {
    setShowFounders(true);
  }, []);

  const handleBackFromFounders = useCallback(() => {
    setShowFounders(false);
  }, []);

  const renderScreen = () => {
    switch (activeScreen) {
      case Screen.Grow:
        return <GrowScreen onConnectBank={handleConnectBank} />;
      case Screen.Unplanned:
        return <UnplannedScreen onConnectBank={handleConnectBank} />;
      case Screen.Monthlies:
        return <MonthliesScreen onConnectBank={handleConnectBank} />;
      case Screen.Fixed:
        return <FixedScreen onConnectBank={handleConnectBank} />;
      case Screen.Income:
        return <IncomeScreen onConnectBank={handleConnectBank} />;
      default:
        return <GrowScreen onConnectBank={handleConnectBank} />;
    }
  };

  if (showThankYou) {
    return <ThankYouScreen />;
  }

  if (showFounders) {
    return <FoundersPage onBack={handleBackFromFounders} />;
  }

  if (!isLoggedIn) {
    return <WelcomeScreen onShowThankYou={handleShowThankYou} onShowFounders={handleShowFounders} />;
  }

  if (!isBankConnected) {
    return (
      <BankConnectionScreen
        onConnectionComplete={handleBankConnectionComplete}
        onSkip={handleSkipBankConnection}
      />
    );
  }

  if (showAccounts) {
    return <AccountsScreen onBack={handleBackFromAccounts} />;
  }

  return (
    <div className="bg-slate-50 min-h-screen min-h-dvh w-full overflow-x-hidden font-sans text-slate-800">
      <div className="max-w-md mx-auto bg-slate-50">
        <Header onSignOut={handleSignOut} onShowAccounts={handleShowAccounts} />
        <main className="p-4 pb-24">
          {renderScreen()}
        </main>
        <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
      </div>
    </div>
  );
};

export default function App() {
  // Check if current path is /verify-email
  const isVerifyEmailPath = window.location.pathname === '/verify-email';

  if (isVerifyEmailPath) {
    return <VerifyEmailScreen />;
  }

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
