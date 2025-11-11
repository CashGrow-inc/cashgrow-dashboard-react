import React, { useState } from 'react';
// FIX: Added IncomeSource to import to resolve type error.
import type { MonthlyCategory, FixedCostCategory, Transaction, IncomeSource } from '../types';
import {
  LogoIcon,
  UserIcon,
  HomeIcon,
  ClockIcon,
  CalendarIcon,
  BillIcon,
  IncomeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  unplannedTransactions,
  monthlyCategories,
  fixedCosts,
  incomeSources,
} from '../constants';

type View = 'grow' | 'unplanned' | 'monthlies' | 'fixed' | 'income';

interface MainAppScreenProps {
  onLogout: () => void;
}

// Helper Components defined within the main file

const Card: React.FC<{children: React.ReactNode; className?: string}> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl p-4 sm:p-6 shadow-sm ${className}`}>
    {children}
  </div>
);

const ProgressBar: React.FC<{ value: number; max: number; color: string }> = ({ value, max, color }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="w-full bg-gray-200 rounded-full h-2 my-2">
      <div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
    </div>
  );
};

const Header: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="sticky top-0 bg-gray-50/90 backdrop-blur-sm z-10 px-4 pt-4">
      <div className="flex justify-between items-center pb-4">
        <div className="flex items-center gap-2">
          <LogoIcon className="h-7 w-7 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-800">CashGrow</h1>
        </div>
        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-full hover:bg-gray-200">
            <UserIcon className="h-6 w-6 text-gray-600" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-20">
              <button onClick={onLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const BottomNav: React.FC<{ activeView: View; setActiveView: (view: View) => void }> = ({ activeView, setActiveView }) => {
  const navItems = [
    { id: 'grow', label: 'Grow', icon: HomeIcon },
    { id: 'unplanned', label: 'Unplanned', icon: ClockIcon },
    { id: 'monthlies', label: 'Monthlies', icon: CalendarIcon },
    { id: 'fixed', label: 'Fixed', icon: BillIcon },
    { id: 'income', label: 'Income', icon: IncomeIcon },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-t">
      <div className="flex justify-around max-w-lg mx-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-xs ${activeView === item.id ? 'text-blue-600' : 'text-gray-500'}`}
          >
            <item.icon className="h-6 w-6 mb-1" />
            <span>{item.label}</span>
            {activeView === item.id && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1"></div>}
          </button>
        ))}
      </div>
    </nav>
  );
};


// View Components

const GrowView: React.FC = () => (
  <div className="space-y-6">
    <Card>
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-gray-800">Budget</h2>
        <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">Weekly</span>
      </div>
      <p className="text-4xl font-bold text-gray-900 mt-2">$506</p>
      <div className="flex justify-between items-baseline text-sm text-gray-500 mt-1">
        <span>Left to Spend till Wednesday</span>
        <span>2 Day Left</span>
      </div>
      <ProgressBar value={506} max={750} color="bg-blue-600" />
    </Card>
    <Card className="bg-green-50">
      <h3 className="text-lg font-bold text-green-800">You're growing strong!</h3>
      <p className="text-green-700 mt-1">You spent 25% less on takeout this week. That's $32 growing in your pocket!</p>
    </Card>
    <Card>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-2 rounded-full">
                <BillIcon className="w-6 h-6 text-gray-500" />
            </div>
            <h2 className="font-semibold text-gray-800 text-lg">Goal of the Month</h2>
        </div>
        <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">⚡ AutoSave</span>
      </div>
      <div className="flex justify-between items-end mt-2">
        <p className="text-4xl font-bold text-gray-900">$700</p>
        <button className="text-sm font-semibold text-blue-600">Edit</button>
      </div>
    </Card>
  </div>
);

const TransactionItem: React.FC<{ transaction: Transaction, showCategory?: boolean }> = ({ transaction, showCategory = false }) => (
    <div className="flex items-center justify-between py-3">
        <div className="flex-1">
            {/* FIX: Use 'description' instead of 'merchant' to match Transaction type. */}
            <p className="font-medium text-gray-800">{transaction.description}</p>
            <p className="text-sm text-gray-500">{transaction.date}</p>
        </div>
        <div className="text-right">
            <p className="font-semibold text-gray-800">${transaction.amount}</p>
            {showCategory && (
                <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full mt-1 inline-block">
                    {/* FIX: Use 'categoryTag' instead of 'category' to match Transaction type. */}
                    {transaction.categoryTag}
                </span>
            )}
        </div>
    </div>
);

const WeeklyExpenseGroup: React.FC<{ week: number, total: number, transactions: Transaction[] }> = ({ week, total, transactions }) => {
    const [isOpen, setIsOpen] = useState(week === 2); // Default open week 2 as in image
    return (
        <Card>
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-700">Week {week}</h3>
                <div className="flex items-center gap-4">
                    <p className="text-xl font-bold text-gray-900">${total.toLocaleString()}</p>
                    {isOpen ? <ChevronUpIcon className="w-5 h-5 text-gray-500" /> : <ChevronDownIcon className="w-5 h-5 text-gray-500" />}
                </div>
            </button>
            {isOpen && (
                <div className="mt-4 divide-y divide-gray-100">
                    {transactions.map(tx => <TransactionItem key={tx.id} transaction={tx} showCategory />)}
                </div>
            )}
        </Card>
    );
};

const UnplannedView: React.FC = () => (
    <div className="space-y-6">
        <Card>
            <div className="flex justify-between items-center">
                <h2 className="font-semibold text-gray-800 text-lg">UnPlanned</h2>
                <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">Monthly</span>
            </div>
            <p className="text-4xl font-bold text-gray-900 mt-2">$2,000</p>
            <div className="flex justify-between items-baseline text-sm text-gray-500 mt-1">
                <span>Left to Spend till end of month</span>
                <span>8 Day Left</span>
            </div>
            <ProgressBar value={1200} max={2000} color="bg-blue-600" />
        </Card>
        <WeeklyExpenseGroup week={1} total={1360} transactions={[]} />
        <WeeklyExpenseGroup week={2} total={2100} transactions={unplannedTransactions.slice(0,3)} />
        <WeeklyExpenseGroup week={3} total={1560} transactions={[]} />
    </div>
);

const MonthlyCategoryItem: React.FC<{ category: MonthlyCategory }> = ({ category }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const colorVariants: {[key:string]: string} = {
        'text-green-500': 'bg-green-500',
        'text-orange-500': 'bg-orange-500',
        'text-blue-500': 'bg-blue-500',
        'text-purple-500': 'bg-purple-500',
    }

    return (
        <Card>
            <button className="w-full flex flex-col" onClick={() => setIsOpen(!isOpen)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full ${colorVariants[category.color].replace('text', 'bg')}`}></span>
                        <h3 className="font-semibold text-gray-800">{category.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900">${category.spent} / <span className="text-gray-500 font-medium">${category.budget}</span></p>
                        <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                </div>
                <ProgressBar value={category.spent} max={category.budget} color={colorVariants[category.color]} />
            </button>
            {isOpen && (
                <div className="mt-4 divide-y divide-gray-100">
                    {/* FIX: 'transactions' property will now exist on MonthlyCategory type. */}
                    {category.transactions.map(tx => <TransactionItem key={tx.id} transaction={tx} />)}
                </div>
            )}
        </Card>
    );
};


const MonthliesView: React.FC = () => (
    <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
            <h2 className="text-lg font-bold">Monthlies</h2>
            <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">Monthly</span>
        </div>
        {monthlyCategories.map(cat => <MonthlyCategoryItem key={cat.id} category={cat} />)}
    </div>
);

const FixedCostItem: React.FC<{ cost: FixedCostCategory }> = ({ cost }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Card>
            <button className="flex justify-between items-center w-full" onClick={() => setIsOpen(!isOpen)}>
                <div className="flex items-center gap-4">
                    {/* FIX: Use 'bgColor' instead of 'iconBgColor' to match FixedCostCategory type. */}
                    <div className={`p-3 rounded-full ${cost.bgColor}`}>
                        <cost.icon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-left">{cost.name}</h3>
                        {/* FIX: Use 'subtitle' instead of 'description' to match FixedCostCategory type. */}
                        <p className="text-gray-500 text-sm text-left">{cost.subtitle}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                     {/* FIX: Use 'spent' and 'budget' instead of 'paid' and 'total'. */}
                     <p className="font-bold text-gray-900 text-lg">${cost.spent}/<span className="font-medium text-gray-500">${cost.budget}</span></p>
                     <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>
            {isOpen && (
                 <div className="mt-4 pl-4 border-l-2 ml-6 space-y-2">
                    {/* FIX: Use 'transactions' instead of 'items' and 'item.description' instead of 'item.name'. */}
                    {cost.transactions.map(item => (
                        <div key={item.id} className="flex justify-between items-center">
                            <span className="text-gray-600">{item.description}</span>
                            <span className="font-semibold text-gray-800">${item.amount}</span>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

const FixedView: React.FC = () => (
    <div className="space-y-6">
        <Card>
            <div className="flex justify-between items-center">
                <h2 className="font-semibold text-gray-800 text-lg">Fixed Costs</h2>
                <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">Monthly</span>
            </div>
            <p className="text-4xl font-bold text-gray-900 mt-2">$4,900</p>
            <div className="flex justify-between items-baseline text-sm text-gray-500 mt-1">
                <span>Expected expenses per month</span>
                <span>8 Day Left</span>
            </div>
            <ProgressBar value={670} max={4900} color="bg-blue-600" />
        </Card>
        <div className="space-y-4">
            {fixedCosts.map(cost => <FixedCostItem key={cost.id} cost={cost} />)}
        </div>
    </div>
);

const IncomeItem: React.FC<{ source: IncomeSource }> = ({ source }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
         <Card>
            <button className="w-full flex justify-between items-center" onClick={() => setIsOpen(!isOpen)}>
                <div className="flex items-center gap-4">
                    {!source.isNonCash && 
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                            <BillIcon className="w-6 h-6" />
                        </div>
                    }
                    <h3 className="font-bold text-lg">{source.name}</h3>
                    {source.period && <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">{source.period}</span>}
                </div>
                <div className="flex items-center gap-2">
                     <p className="font-bold text-gray-900 text-lg">${(source.received / 1000).toFixed(source.received % 1000 !== 0 ? 1: 0)}k/<span className="font-medium text-gray-500">${(source.total/1000)}k</span></p>
                     <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>
         </Card>
    );
};

const IncomeView: React.FC = () => (
    <div className="space-y-6">
        <Card>
            <div className="flex justify-between items-center">
                <h2 className="font-semibold text-gray-800 text-lg">Income</h2>
                <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">Monthly</span>
            </div>
            <p className="text-4xl font-bold text-gray-900 mt-2">$5,500</p>
            <div className="flex justify-between items-baseline text-sm text-gray-500 mt-1">
                <span>Expected income per month</span>
                <span>8 Day Left</span>
            </div>
            <ProgressBar value={5500} max={12000} color="bg-blue-600" />
        </Card>
        <div className="space-y-4">
            <IncomeItem source={incomeSources[0]} />
            <IncomeItem source={incomeSources[1]} />
        </div>
        <div className="space-y-2">
             <IncomeItem source={incomeSources[2]} />
        </div>
    </div>
);


const MainAppScreen: React.FC<MainAppScreenProps> = ({ onLogout }) => {
  const [activeView, setActiveView] = useState<View>('grow');

  const renderView = () => {
    switch (activeView) {
      case 'unplanned':
        return <UnplannedView />;
      case 'monthlies':
        return <MonthliesView />;
      case 'fixed':
        return <FixedView />;
      case 'income':
        return <IncomeView />;
      case 'grow':
      default:
        return <GrowView />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Header onLogout={onLogout} />
      <main className="p-4 pb-24">
        {renderView()}
      </main>
      <BottomNav activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
};

export default MainAppScreen;
