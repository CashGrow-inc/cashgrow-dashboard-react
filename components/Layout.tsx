import React from 'react';
import { Screen } from '../types';
import { useAuth } from '../AuthContext';
import { Logo } from './WelcomeScreen';
import {
  GrowIcon,
  UnplannedIcon,
  MonthliesIcon,
  FixedIcon,
  IncomeIcon,
  ProfileIcon
} from './Icons';

interface HeaderProps {
  onSignOut: () => void;
  onShowAccounts: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSignOut, onShowAccounts }) => {
  const { user } = useAuth();

  return (
    <header className="flex justify-between items-center p-4 bg-slate-50 sticky top-0 z-20">
      <div className="flex items-center space-x-4">
        <Logo />
        {user && (
          <span className="text-lg font-semibold text-slate-800">
            {user.full_name || user.email}!
          </span>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={onShowAccounts}
          className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          Accounts
        </button>
        <button
          onClick={onSignOut}
          className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          Sign Out
        </button>
        <ProfileIcon className="w-7 h-7 text-slate-500" />
      </div>
    </header>
  );
};

interface BottomNavProps {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, setActiveScreen }) => {
  const navItems = [
    { screen: Screen.Grow, Icon: GrowIcon, label: 'Grow' },
    { screen: Screen.Unplanned, Icon: UnplannedIcon, label: 'Unplanned' },
    { screen: Screen.Monthlies, Icon: MonthliesIcon, label: 'Monthlies' },
    { screen: Screen.Fixed, Icon: FixedIcon, label: 'Fixed' },
    { screen: Screen.Income, Icon: IncomeIcon, label: 'Income' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-20">
      {navItems.map(({ screen, Icon, label }) => {
        const isActive = activeScreen === screen;
        return (
          <button
            key={screen}
            onClick={() => setActiveScreen(screen)}
            className="flex flex-col items-center justify-center w-1/5 text-xs font-medium"
          >
            <Icon className={`w-6 h-6 mb-1 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
            <span className={isActive ? 'text-blue-600' : 'text-slate-500'}>{label}</span>
            {isActive && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1"></div>}
          </button>
        );
      })}
    </nav>
  );
};
