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
  const { isLoggedIn, isAuthLoading, logout } = useAuth();

  // Track if user has passed the bank connection screen (skipped OR connected)
  const [hasPassedBankScreen, setHasPassedBankScreen] = useState(() => {
    return localStorage.getItem('hasPassedBankScreen') === 'true';
  });

  // Track if user has actually connected a bank account (for data fetching)
  const [hasBankAccount, setHasBankAccount] = useState(() => {
    return localStorage.getItem('hasBankAccount') === 'true';
  });

  const [activeScreen, setActiveScreen] = useState<Screen>(Screen.Grow);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showAccounts, setShowAccounts] = useState(false);
  const [showFounders, setShowFounders] = useState(false);

  const handleShowThankYou = useCallback(() => {
    setShowThankYou(true);
  }, []);

  // User actually connected a bank
  const handleBankConnectionComplete = useCallback(() => {
    setHasPassedBankScreen(true);
    setHasBankAccount(true);
    localStorage.setItem('hasPassedBankScreen', 'true');
    localStorage.setItem('hasBankAccount', 'true');
  }, []);

  // User skipped bank connection - pass screen but no bank data
  const handleSkipBankConnection = useCallback(() => {
    setHasPassedBankScreen(true);
    localStorage.setItem('hasPassedBankScreen', 'true');
    // hasBankAccount stays false - don't fetch data
  }, []);

  // User wants to connect bank from dashboard
  const handleConnectBank = useCallback(() => {
    setHasPassedBankScreen(false);
    localStorage.setItem('hasPassedBankScreen', 'false');
  }, []);

  const handleSignOut = useCallback(() => {
    logout();
    setHasPassedBankScreen(false);
    setHasBankAccount(false);
    localStorage.removeItem('hasPassedBankScreen');
    localStorage.removeItem('hasBankAccount');
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
        return <GrowScreen hasBankAccount={hasBankAccount} onConnectBank={handleConnectBank} />;
      case Screen.Unplanned:
        return <UnplannedScreen hasBankAccount={hasBankAccount} onConnectBank={handleConnectBank} />;
      case Screen.Monthlies:
        return <MonthliesScreen hasBankAccount={hasBankAccount} onConnectBank={handleConnectBank} />;
      case Screen.Fixed:
        return <FixedScreen hasBankAccount={hasBankAccount} onConnectBank={handleConnectBank} />;
      case Screen.Income:
        return <IncomeScreen hasBankAccount={hasBankAccount} onConnectBank={handleConnectBank} />;
      default:
        return <GrowScreen hasBankAccount={hasBankAccount} onConnectBank={handleConnectBank} />;
    }
  };

  if (showThankYou) {
    return <ThankYouScreen />;
  }

  if (showFounders) {
    return <FoundersPage onBack={handleBackFromFounders} />;
  }

  // Show loading while checking auth state
  if (isAuthLoading) {
    return (
      <div className="bg-slate-50 min-h-screen min-h-dvh w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <WelcomeScreen onShowThankYou={handleShowThankYou} onShowFounders={handleShowFounders} />;
  }

  if (!hasPassedBankScreen) {
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
