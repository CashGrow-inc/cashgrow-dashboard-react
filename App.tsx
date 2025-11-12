import React, { useState, useCallback } from 'react';
import { Screen, Transaction, MonthlyCategory, FixedCostCategory, IncomeData } from './types';
import {
  GrowIcon, UnplannedIcon, MonthliesIcon, FixedIcon, IncomeIcon, ProfileIcon,
  ChevronDownIcon, CashGrowLogo, WeeklyIcon, AutosaveIcon, GoalIcon,
  FacebookIcon, InstagramIcon, LinkedInIcon, YouTubeIcon, InsuranceIcon, LoanIcon, HousingIcon, RecurringIcon
} from './components/Icons';
import WelcomeScreen, { Logo } from './components/WelcomeScreen';
import ThankYouScreen from './components/ThankYouScreen';
import { unplannedData, monthliesData, fixedCostsData, incomeData } from './data/mockData';

// Reusable Components

const ProgressBar: React.FC<{ value: number; max: number; color?: string }> = ({ value, max, color = 'bg-blue-600' }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="w-full bg-slate-200 rounded-full h-2">
      <div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
    </div>
  );
};

const TransactionRow: React.FC<{ transaction: Transaction }> = ({ transaction }) => (
  <div className="flex justify-between items-center py-3">
    <div className="flex items-center space-x-4">
      <div className="text-sm text-slate-500">{transaction.date}</div>
      <div className="font-medium text-slate-800">{transaction.description}</div>
    </div>
    <div className="flex items-center space-x-4">
      <div className="font-semibold text-slate-800">${transaction.amount}</div>
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${transaction.categoryColor}`}>
        {transaction.categoryTag}
      </span>
    </div>
  </div>
);

interface AccordionProps {
  summary: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({ summary, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex justify-between items-center cursor-pointer" onClick={toggleOpen}>
        <div className="flex-grow">{summary}</div>
        <ChevronDownIcon className={`w-6 h-6 text-slate-400 transition-transform transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      {isOpen && <div className="mt-4 border-t border-slate-100 pt-2">{children}</div>}
    </div>
  );
};


// Header, BottomNav, Layout
const Header: React.FC<{ onSignOut: () => void }> = ({ onSignOut }) => (
  <header className="flex justify-between items-center p-4 bg-slate-50 sticky top-0 z-20">
    <Logo />
    <div className="flex items-center space-x-4">
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

interface BottomNavProps {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
}
const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, setActiveScreen }) => {
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


// Screens
const GrowScreen: React.FC = () => (
  <div className="space-y-4">
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-slate-600 font-medium">Budget</h2>
        <span className="flex items-center bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
          <WeeklyIcon className="w-4 h-4 mr-1" />
          Weekly
        </span>
      </div>
      <div className="text-5xl font-bold text-slate-800 mb-3">$506</div>
      <ProgressBar value={506} max={750} />
      <div className="flex justify-between items-center mt-2 text-sm text-slate-500">
        <span>Left to Spend till Wednesday</span>
        <span>2 Day Left</span>
      </div>
    </div>

    <div className="bg-green-50 rounded-2xl p-5 text-green-800">
      <h3 className="font-bold text-lg">You're growing strong!</h3>
      <p className="text-green-700">You spent 25% less on takeout this week. That's $32 growing in your pocket!</p>
    </div>

    <div className="bg-white rounded-2xl shadow-sm p-5">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center space-x-2">
          <GoalIcon className="w-8 h-8 text-slate-400" />
          <h2 className="text-slate-600 font-medium text-lg">Goal of the Month</h2>
        </div>
        <span className="flex items-center bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
          <AutosaveIcon className="w-4 h-4 mr-1" />
          AutoSave
        </span>
      </div>
      <div className="flex justify-between items-end mt-2">
        <span className="text-4xl font-bold text-slate-800">$700</span>
        <button className="text-sm font-semibold text-blue-600">Edit</button>
      </div>
    </div>
  </div>
);

const UnplannedScreen: React.FC = () => (
  <div className="space-y-4">
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-slate-600 font-medium">UnPlanned</h2>
        <span className="flex items-center bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
          Monthly
        </span>
      </div>
      <div className="text-5xl font-bold text-slate-800 mb-3">$2,000</div>
      <ProgressBar value={2000} max={3360} />
      <div className="flex justify-between items-center mt-2 text-sm text-slate-500">
        <span>Left to Spend till end of month</span>
        <span>8 Day Left</span>
      </div>
    </div>

    {unplannedData.map(week => (
      <Accordion
        key={week.id}
        defaultOpen={week.weekLabel === 'Week 2'}
        summary={
          <div className="flex justify-between items-center w-full">
            <span className="font-semibold text-slate-600">{week.weekLabel}</span>
            <span className="text-xl font-bold text-slate-800">${week.total.toLocaleString()}</span>
          </div>
        }
      >
        {week.transactions.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {week.transactions.map(tx => <TransactionRow key={tx.id} transaction={tx} />)}
          </div>
        ) : <p className="text-sm text-slate-500 text-center py-4">No transactions this week.</p>}
      </Accordion>
    ))}
  </div>
);

const MonthliesScreen: React.FC = () => (
  <div className="space-y-4">
    <div className="px-1">
      <div className="flex justify-between items-center">
        <h2 className="text-slate-800 font-bold text-xl">Monthlies</h2>
        <span className="flex items-center bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
          Monthly
        </span>
      </div>
    </div>
    {monthliesData.map(category => (
      <Accordion
        key={category.id}
        summary={
          <div className="w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className={`w-3 h-3 rounded-full ${category.color.replace('text-', 'bg-')}`}></span>
                <span className="font-semibold text-slate-800">{category.name}</span>
              </div>
              <span className="font-bold text-slate-800">${category.spent} / <span className="text-slate-500">${category.budget}</span></span>
            </div>
            <div className="mt-3">
              <ProgressBar value={category.spent} max={category.budget} color={category.color.replace('text-', 'bg-')} />
            </div>
          </div>
        }
      >
        {category.transactions.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {category.transactions.map(tx => <TransactionRow key={tx.id} transaction={tx} />)}
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">No transactions for this category.</p>
        )}
      </Accordion>
    ))}
  </div>
);

const FixedScreen: React.FC = () => (
  <div className="space-y-4">
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-slate-600 font-medium">Fixed Costs</h2>
        <span className="flex items-center bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
          Monthly
        </span>
      </div>
      <div className="text-5xl font-bold text-slate-800 mb-3">$4,900</div>
      <ProgressBar value={670} max={4900} />
      <div className="flex justify-between items-center mt-2 text-sm text-slate-500">
        <span>Expected expenses per month</span>
        <span>8 Day Left</span>
      </div>
    </div>
    {fixedCostsData.map(category => (
      <Accordion
        key={category.id}
        summary={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${category.bgColor}`}>
                <category.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-slate-800">{category.name}</div>
                <div className="text-sm text-slate-500">{category.subtitle}</div>
              </div>
            </div>
            <div className="font-bold text-slate-800">${category.spent}/<span className="font-medium text-slate-500">${category.budget}</span></div>
          </div>
        }
      >
        {category.transactions.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {category.transactions.map(tx => <TransactionRow key={tx.id} transaction={tx} />)}
          </div>
        ) : <p className="text-sm text-slate-500 text-center py-4">No transactions for this category.</p>}
      </Accordion>
    ))}
  </div>
);


const IncomeScreen: React.FC = () => (
  <div className="space-y-4">
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-slate-600 font-medium">Income</h2>
        <span className="flex items-center bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
          Monthly
        </span>
      </div>
      <div className="text-5xl font-bold text-slate-800 mb-3">$5,500</div>
      <ProgressBar value={5500} max={12000} />
      <div className="flex justify-between items-center mt-2 text-sm text-slate-500">
        <span>Expected income per month</span>
        <span>8 Day Left</span>
      </div>
    </div>
    {[...incomeData.recurring, ...incomeData.nonRecurring].map(category => (
      <Accordion
        key={category.id}
        summary={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
                <category.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-slate-800">{category.name}</div>
              </div>
            </div>
            <div className="font-bold text-slate-800">${(category.received / 1000).toFixed(1)}k/<span className="font-medium text-slate-500">${(category.expected / 1000).toFixed(0)}k</span></div>
          </div>
        }
      >
        <p className="text-sm text-slate-500 text-center py-4">Income details coming soon.</p>
      </Accordion>
    ))}
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <Accordion
        summary={
          <div className="flex justify-between items-center w-full">
            <div>
              <h3 className="font-bold text-slate-800">Non-Cash</h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="flex items-center bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                Monthly
              </span>
              <span className="text-2xl font-bold text-slate-800">${incomeData.nonCash.toLocaleString()}</span>
            </div>
          </div>
        }>
        <p className="text-sm text-slate-500 text-center py-4">Non-cash income details here.</p>
      </Accordion>
    </div>
  </div>
);



export default function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [activeScreen, setActiveScreen] = useState<Screen>(Screen.Grow);
  const [showThankYou, setShowThankYou] = useState(false);

  const handleSignIn = useCallback(() => {
    setIsSignedIn(true);
  }, []);

  const handleShowThankYou = useCallback(() => {
    setShowThankYou(true);
  }, []);

  const handleSignOut = useCallback(() => {
    setIsSignedIn(false);
  }, []);

  const renderScreen = () => {
    switch (activeScreen) {
      case Screen.Grow:
        return <GrowScreen />;
      case Screen.Unplanned:
        return <UnplannedScreen />;
      case Screen.Monthlies:
        return <MonthliesScreen />;
      case Screen.Fixed:
        return <FixedScreen />;
      case Screen.Income:
        return <IncomeScreen />;
      default:
        return <GrowScreen />;
    }
  };

  if (showThankYou) {
    return <ThankYouScreen />;
  }

  if (!isSignedIn) {
    return <WelcomeScreen onSignIn={handleSignIn} onShowThankYou={handleShowThankYou} />;
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
      <div className="max-w-md mx-auto bg-slate-50">
        <Header onSignOut={handleSignOut} />
        <main className="p-4 pb-24">
          {renderScreen()}
        </main>
        <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
      </div>
    </div>
  );
}
