import React, { useState, useCallback } from 'react';
import { Screen, Transaction, UnplannedWeek, MonthlyCategory, FixedCostCategory, IncomeCategory } from './types';
import { 
    GrowIcon, UnplannedIcon, MonthliesIcon, FixedIcon, IncomeIcon, ProfileIcon,
    ChevronDownIcon, CashGrowLogo, WeeklyIcon, AutosaveIcon, GoalIcon,
    FacebookIcon, InstagramIcon, LinkedInIcon, YouTubeIcon, InsuranceIcon, LoanIcon, HousingIcon
} from './components/Icons';
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
  <header className="flex justify-between items-center p-4 bg-slate-50">
    <CashGrowLogo />
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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2">
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
      <ProgressBar value={506} max={1000} />
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
          <GoalIcon className="w-8 h-8 text-slate-400"/>
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
      <ProgressBar value={2000} max={3000} />
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
      <div className="bg-white rounded-2xl shadow-sm p-5">
         <div className="flex justify-between items-center mb-1">
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
                                <span className={`w-3 h-3 rounded-full ${category.color}`}></span>
                                <span className="font-semibold text-slate-800">{category.name}</span>
                            </div>
                            <span className="font-bold text-slate-800">${category.spent} / <span className="text-slate-500">${category.budget}</span></span>
                        </div>
                        <div className="mt-3">
                            <ProgressBar value={category.spent} max={category.budget} color={category.color} />
                        </div>
                    </div>
                }
            >
                <p className="text-sm text-slate-500 text-center py-4">Transaction details coming soon.</p>
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
      <ProgressBar value={4900} max={6000} />
      <div className="flex justify-between items-center mt-2 text-sm text-slate-500">
        <span>Expected expenses per month</span>
        <span>8 Day Left</span>
      </div>
    </div>
    {fixedCostsData.map(category => (
        <Accordion 
          key={category.id}
          defaultOpen={category.name === 'Housing'}
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
                <div className="font-bold text-slate-800">${(category.received/1000).toFixed(1)}k/<span className="font-medium text-slate-500">${(category.expected/1000).toFixed(0)}k</span></div>
            </div>
          }
        >
          <p className="text-sm text-slate-500 text-center py-4">Income details coming soon.</p>
        </Accordion>
    ))}
    <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800">Non-Cash</h3>
            </div>
            <div className="flex items-center space-x-2">
                <span className="flex items-center bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                    Monthly
                </span>
                <span className="text-2xl font-bold text-slate-800">${incomeData.nonCash.toLocaleString()}</span>
                <ChevronDownIcon className="w-6 h-6 text-slate-400" />
            </div>
        </div>
    </div>
    </div>
);

const ExpenseCardsVisual: React.FC = () => (
  <div className="relative mt-12 lg:mt-16 h-96">
    {/* Card 1: Monthlies */}
    <div className="absolute top-1/2 -translate-y-1/2 right-0 lg:right-10 w-64 bg-white rounded-2xl shadow-xl p-4 transform lg:scale-105 z-20">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800 text-sm">Monthlies</h3>
        <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">Monthly</span>
      </div>
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <div className="flex items-center space-x-2"><span className="w-2 h-2 bg-green-400 rounded-full"></span><span>Groceries</span></div>
            <span className="font-semibold text-slate-600">$420 / $500</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5"><div className="bg-green-400 h-1.5 rounded-full" style={{width: '84%'}}></div></div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <div className="flex items-center space-x-2"><span className="w-2 h-2 bg-orange-400 rounded-full"></span><span>Dining Out</span></div>
            <span className="font-semibold text-slate-600">$280 / $350</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5"><div className="bg-orange-400 h-1.5 rounded-full" style={{width: '80%'}}></div></div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <div className="flex items-center space-x-2"><span className="w-2 h-2 bg-blue-400 rounded-full"></span><span>Pharmacy</span></div>
            <span className="font-semibold text-slate-600">$35 / $100</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5"><div className="bg-blue-400 h-1.5 rounded-full" style={{width: '35%'}}></div></div>
        </div>
      </div>
    </div>

    {/* Card 2: Unplanned */}
    <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-60 bg-white rounded-2xl shadow-2xl p-4 z-10">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-slate-800">UnPlanned</h3>
        <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">Monthly</span>
      </div>
      <p className="text-4xl font-bold text-slate-800">$2,000</p>
      <p className="text-xs text-slate-500">Left to Spend till end of...</p>
      <div className="w-full bg-slate-200 rounded-full h-2 my-3"><div className="bg-blue-500 h-2 rounded-full" style={{width: '66%'}}></div></div>
      <div className="border-t border-slate-100 pt-2 space-y-2 text-sm">
         <div className="flex justify-between items-center"><span className="font-semibold">Week 1</span><span>$1,360</span></div>
         <div className="flex justify-between items-center"><span className="font-semibold">Week 2</span><span>$2,100</span></div>
      </div>
    </div>

    {/* Card 3: Fixed Costs */}
    <div className="absolute top-1/2 -translate-y-1/2 left-0 lg:left-10 w-56 bg-white rounded-2xl shadow-xl p-4">
      <p className="text-sm text-slate-500">Fixed costs</p>
      <p className="text-3xl font-bold text-slate-800">$4,900</p>
      <div className="mt-4 space-y-3">
        <div className="flex items-center space-x-2 text-sm"><div className="p-2 bg-blue-100 rounded-full"><InsuranceIcon className="w-4 h-4 text-blue-600"/></div><p>Insurance</p></div>
        <div className="flex items-center space-x-2 text-sm"><div className="p-2 bg-green-100 rounded-full"><LoanIcon className="w-4 h-4 text-green-600"/></div><p>Loan</p></div>
        <div className="flex items-center space-x-2 text-sm"><div className="p-2 bg-orange-100 rounded-full"><HousingIcon className="w-4 h-4 text-orange-600"/></div><p>Housing</p></div>
      </div>
    </div>
  </div>
);

const WelcomeScreen: React.FC<{ onSignIn: () => void }> = ({ onSignIn }) => (
  <div className="bg-white font-sans text-slate-800">
    {/* Hero Section */}
    <div className="relative min-h-[80vh] flex items-center">
        <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1533423996333-e523f38b053c?q=80&w=2078&auto=format&fit=crop')" }}>
        </div>
        
        <header className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-20">
            <CashGrowLogo textColor="text-slate-800" />
            <button 
                onClick={onSignIn} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full text-sm transition duration-300"
            >
                Sign up
            </button>
        </header>

        <div className="relative z-10 bg-white/60 backdrop-blur-sm p-8 md:p-12 rounded-2xl text-left max-w-lg md:max-w-xl mx-4 my-24 ml-4 md:ml-12 lg:ml-24">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">
                CashGrow makes<br/>money feel simple
            </h1>
            <p className="text-lg md:text-xl text-slate-700 mb-8 max-w-md">
                Save more, worry less, and feel good about your spending
            </p>
            <button 
                onClick={onSignIn} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300"
            >
                Try CashGrow Free
            </button>
        </div>
    </div>

    {/* What Is CashGrow Section */}
    <section className="py-16 md:py-24 text-center px-4">
      <a href="#" className="text-blue-600 font-semibold mb-4 inline-block">What Is CashGrow?</a>
      <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Money made easy,</h2>
      <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">growth made natural</h2>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto">
        An easy app that helps you track, save, and grow your money, no stress or spreadsheets
      </p>
    </section>

    {/* In Control Section */}
    <section className="bg-slate-50 py-16 md:py-24 px-4 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 text-center mb-4">In Control on Your Expenses</h2>
        <ExpenseCardsVisual />
      </div>
    </section>

    {/* Footer */}
    <footer className="bg-blue-700 text-white py-12 md:py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4 flex justify-between items-center">Company <ChevronDownIcon className="w-5 h-5 md:hidden" /></h3>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 flex justify-between items-center">Resources <ChevronDownIcon className="w-5 h-5 md:hidden" /></h3>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 flex justify-between items-center">Legal <ChevronDownIcon className="w-5 h-5 md:hidden" /></h3>
            </div>
          </div>
          <div className="text-left">
             <div className="flex justify-start mb-4">
                <CashGrowLogo textColor="text-white"/>
             </div>
            <p className="text-sm">9511 Ferndale, Richmond BC</p>
          </div>
        </div>
        <div className="border-t border-blue-600 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex space-x-4 mb-4 md:mb-0">
             <a href="#" aria-label="Facebook"><FacebookIcon className="w-6 h-6 hover:text-blue-300"/></a>
             <a href="#" aria-label="Instagram"><InstagramIcon className="w-6 h-6 hover:text-blue-300"/></a>
             <a href="#" aria-label="LinkedIn"><LinkedInIcon className="w-6 h-6 hover:text-blue-300"/></a>
             <a href="#" aria-label="YouTube"><YouTubeIcon className="w-6 h-6 hover:text-blue-300"/></a>
          </div>
          <p className="text-sm text-blue-200">@2025 Cashgrow</p>
        </div>
      </div>
    </footer>
  </div>
);


export default function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [activeScreen, setActiveScreen] = useState<Screen>(Screen.Grow);

  const handleSignIn = useCallback(() => {
    setIsSignedIn(true);
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

  if (!isSignedIn) {
    return <WelcomeScreen onSignIn={handleSignIn} />;
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
        <div className="max-w-md mx-auto">
            <Header onSignOut={handleSignOut} />
            <main className="p-4 pb-24">
                {renderScreen()}
            </main>
            <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
        </div>
    </div>
  );
}