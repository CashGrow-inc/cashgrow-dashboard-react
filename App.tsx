import React, { useState, useCallback, useEffect } from 'react';
import { Screen, Transaction, MonthlyCategory, FixedCostCategory, IncomeData } from './types';
import {
  GrowIcon, UnplannedIcon, MonthliesIcon, FixedIcon, IncomeIcon, ProfileIcon,
  ChevronDownIcon, CashGrowLogo, WeeklyIcon, AutosaveIcon, GoalIcon,
  FacebookIcon, InstagramIcon, LinkedInIcon, YouTubeIcon, InsuranceIcon, LoanIcon, HousingIcon, RecurringIcon
} from './components/Icons';
import WelcomeScreen, { Logo } from './components/WelcomeScreen';
import ThankYouScreen from './components/ThankYouScreen';
import BankConnectionScreen from './components/BankConnectionScreen';
import VerifyEmailScreen from './components/VerifyEmailScreen';
import ResetPasswordScreen from './components/ResetPasswordScreen';
import AccountsScreen from './components/AccountsScreen';
import FoundersPage from './components/FoundersPage';
import { unplannedData, monthliesData, incomeData } from './data/mockData';
import { AuthProvider } from './AuthContext';
import { useAuth } from './AuthContext';

// Helper function to format numbers with thousand separators
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

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
const Header: React.FC<{ onSignOut: () => void; onShowAccounts: () => void }> = ({ onSignOut, onShowAccounts }) => {
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
const GrowScreen: React.FC = () => {
  const { fetchBudgetSummary } = useAuth();
  const [budget, setBudget] = useState<number>(0);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [monthlyGoal, setMonthlyGoal] = useState<number>(() => {
    const saved = localStorage.getItem('monthlyGoal');
    return saved ? parseFloat(saved) : 700;
  });
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);
  const [goalInputValue, setGoalInputValue] = useState<string>(monthlyGoal.toString());

  React.useEffect(() => {
    const loadBudget = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching budget summary...');
        const summary = await fetchBudgetSummary(7, monthlyGoal); // Pass monthly goal
        console.log('Budget summary received:', summary);
        setBudget(summary.budget);
        setTotalIncome(summary.total_income);
        setTotalExpenses(summary.total_expenses);
      } catch (error) {
        console.error('Failed to load budget:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBudget();
  }, [monthlyGoal]); // Reload when monthly goal changes

  const handleEditGoal = () => {
    setIsEditingGoal(true);
    setGoalInputValue(monthlyGoal.toString());
  };

  const handleSaveGoal = () => {
    const newGoal = parseFloat(goalInputValue);
    if (!isNaN(newGoal) && newGoal > 0) {
      setMonthlyGoal(newGoal);
      localStorage.setItem('monthlyGoal', newGoal.toString());
      setIsEditingGoal(false);
    }
  };

  const handleCancelGoal = () => {
    setGoalInputValue(monthlyGoal.toString());
    setIsEditingGoal(false);
  };

  const handleGoalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setGoalInputValue(value);
    }
  };

  const handleGoalKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveGoal();
    } else if (e.key === 'Escape') {
      handleCancelGoal();
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-slate-600 font-medium">Budget</h2>
          <span className="flex items-center bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
            <WeeklyIcon className="w-4 h-4 mr-1" />
            Weekly
          </span>
        </div>
        <div className="text-5xl font-bold text-slate-800 mb-3">
          {isLoading ? '...' : `$${formatCurrency(budget)}`}
        </div>
        <ProgressBar value={Math.abs(budget)} max={totalIncome > 0 ? totalIncome : 1000} color={budget >= 0 ? 'bg-green-600' : 'bg-red-600'} />
        <div className="flex justify-between items-center mt-2 text-sm text-slate-500">
          <span>Income: ${formatCurrency(totalIncome)} - Expenses: ${formatCurrency(totalExpenses)}</span>
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
          {isEditingGoal ? (
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-slate-800">$</span>
              <input
                type="text"
                value={goalInputValue}
                onChange={handleGoalInputChange}
                onKeyDown={handleGoalKeyPress}
                className="text-4xl font-bold text-slate-800 border-b-2 border-blue-500 focus:outline-none w-40"
                autoFocus
                placeholder="700"
              />
            </div>
          ) : (
            <span className="text-4xl font-bold text-slate-800">${formatCurrency(monthlyGoal)}</span>
          )}
          <div className="flex items-center space-x-2">
            {isEditingGoal ? (
              <>
                <button
                  onClick={handleSaveGoal}
                  className="text-sm font-semibold text-green-600 hover:text-green-700 px-3 py-1 bg-green-50 rounded"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelGoal}
                  className="text-sm font-semibold text-slate-600 hover:text-slate-700 px-3 py-1 bg-slate-50 rounded"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleEditGoal}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const UnplannedScreen: React.FC = () => {
  const { fetchUnplanned } = useAuth();
  const [weeks, setWeeks] = useState<any[]>([]);
  const [totalUnplanned, setTotalUnplanned] = useState<number>(0);
  const [periodLabel, setPeriodLabel] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);

  React.useEffect(() => {
    const loadUnplanned = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching unplanned expenses...');
        const data = await fetchUnplanned();
        console.log('Unplanned data received:', data);

        setWeeks(data.weeks);
        setTotalUnplanned(data.total_unplanned);
        setPeriodLabel(data.period.label);
      } catch (error) {
        console.error('Failed to load unplanned expenses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUnplanned();
  }, []);

  const handleToggleWeek = (weekStart: string) => {
    setExpandedWeek(expandedWeek === weekStart ? null : weekStart);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 text-slate-500">Loading unplanned expenses...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="px-1">
        <div className="flex justify-between items-center">
          <h2 className="text-slate-800 font-bold text-xl">Unplanned</h2>
          <span className="flex items-center bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full">
            Monthly
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="text-slate-600 font-medium mb-2">Total Unplanned</h3>
        <div className="text-4xl font-bold text-orange-600">${formatCurrency(totalUnplanned)}</div>
        <p className="text-sm text-slate-500 mt-1">{periodLabel}</p>
      </div>

      {weeks.length > 0 ? (
        weeks.map((week) => {
          const isExpanded = expandedWeek === week.week_start;

          return (
            <div key={week.week_start} className="bg-white rounded-2xl shadow-sm p-4">
              <button
                onClick={() => handleToggleWeek(week.week_start)}
                className="w-full"
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="font-semibold text-slate-800">{week.week_label}</div>
                    <div className="text-xs text-slate-500">{week.week_range}</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="font-bold text-orange-600 text-xl">
                        ${formatCurrency(week.total)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {week.transactions.length} transaction{week.transactions.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  {week.transactions.length > 0 ? (
                    <div className="space-y-2">
                      {week.transactions.map((txn: any) => (
                        <div key={txn.id} className="flex justify-between items-center py-2">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-slate-700">{txn.description}</div>
                            <div className="text-xs text-slate-500">{txn.date}</div>
                          </div>
                          <div className="text-sm font-semibold text-orange-600">
                            ${formatCurrency(txn.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-slate-500 text-sm">No transactions this week</div>
                  )}
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <p className="text-slate-500">No unplanned expenses this month</p>
        </div>
      )}
    </div>
  );
};

const MonthliesScreen: React.FC = () => {
  const { fetchMonthlies, fetchMonthliesTransactions } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [categoryTransactions, setCategoryTransactions] = useState<{ [key: string]: any[] }>({});
  const [loadingTransactions, setLoadingTransactions] = useState<string | null>(null);

  // Color palette for categories
  const categoryColors = [
    'bg-green-500',
    'bg-blue-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-yellow-500',
    'bg-indigo-500',
    'bg-red-500',
  ];

  React.useEffect(() => {
    const loadMonthlies = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching monthlies...');
        const data = await fetchMonthlies(30); // Last 30 days
        console.log('Monthlies data received:', data);

        // Assign colors to categories
        const categoriesWithColors = data.categories.map((cat, index) => ({
          ...cat,
          color: categoryColors[index % categoryColors.length],
          // For now, set budget as 1.5x of spent (you can make this dynamic later)
          budget: cat.spent * 1.5
        }));

        setCategories(categoriesWithColors);
        setTotalSpent(data.total_spent);
      } catch (error) {
        console.error('Failed to load monthlies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMonthlies();
  }, []);

  const handleToggleCategory = async (categoryName: string) => {
    if (expandedCategory === categoryName) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryName);

      // Fetch transactions if not already loaded
      if (!categoryTransactions[categoryName]) {
        try {
          setLoadingTransactions(categoryName);
          const data = await fetchMonthliesTransactions(categoryName, 30);
          setCategoryTransactions(prev => ({
            ...prev,
            [categoryName]: data.transactions
          }));
        } catch (error) {
          console.error(`Failed to load transactions for ${categoryName}:`, error);
        } finally {
          setLoadingTransactions(null);
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 text-slate-500">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="px-1">
        <div className="flex justify-between items-center">
          <h2 className="text-slate-800 font-bold text-xl">Monthlies</h2>
          <span className="flex items-center bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
            Monthly
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="text-slate-600 font-medium mb-2">Total Spent</h3>
        <div className="text-4xl font-bold text-slate-800">${formatCurrency(totalSpent)}</div>
        <p className="text-sm text-slate-500 mt-1">Last 30 days</p>
      </div>

      {categories.length > 0 ? (
        categories.map((category, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div
              className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => handleToggleCategory(category.category)}
            >
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <ChevronDownIcon
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        expandedCategory === category.category ? 'rotate-180' : ''
                      }`}
                    />
                    <span className={`w-3 h-3 rounded-full ${category.color}`}></span>
                    <span className="font-semibold text-slate-800">{category.category}</span>
                  </div>
                  <span className="font-bold text-slate-800">
                    ${formatCurrency(category.spent)} / <span className="text-slate-500">${formatCurrency(category.budget)}</span>
                  </span>
                </div>
                <div className="mt-3">
                  <ProgressBar value={category.spent} max={category.budget} color={category.color} />
                </div>
                <p className="text-xs text-slate-500 mt-2">{category.transaction_count} transactions</p>
              </div>
            </div>

            {/* Transaction List */}
            {expandedCategory === category.category && (
              <div className="border-t border-slate-100 bg-slate-50">
                {loadingTransactions === category.category ? (
                  <div className="p-4 text-center text-slate-500 text-sm">Loading transactions...</div>
                ) : categoryTransactions[category.category]?.length > 0 ? (
                  <div className="p-4 space-y-2">
                    {categoryTransactions[category.category].map((txn, txnIndex) => {
                      let formattedDate = '';
                      try {
                        if (txn.date) {
                          const dateParts = txn.date.split('-');
                          if (dateParts.length === 3) {
                            const day = dateParts[2];
                            const month = dateParts[1];
                            formattedDate = `${day}/${month}`;
                          } else {
                            formattedDate = txn.date;
                          }
                        }
                      } catch (e) {
                        formattedDate = '';
                      }
                      return (
                        <div key={txnIndex} className="flex justify-between items-center py-2 px-3 bg-white rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-700">{txn.description}</span>
                            {formattedDate && <span className="text-xs text-slate-500">{formattedDate}</span>}
                          </div>
                          <span className="text-sm font-semibold text-slate-800">${formatCurrency(txn.amount)}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center text-slate-500 text-sm">No transactions found</div>
                )}
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <p className="text-slate-500">No categorized expenses found.</p>
          <p className="text-sm text-slate-400 mt-2">Sync your Plaid transactions to see categories.</p>
        </div>
      )}
    </div>
  );
};

const FixedScreen: React.FC = () => {
  const { fetchFixed, fetchFixedTransactions } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [categoryTransactions, setCategoryTransactions] = useState<{ [key: string]: any[] }>({});
  const [loadingTransactions, setLoadingTransactions] = useState<string | null>(null);

  // Color palette for categories
  const categoryColors = [
    'bg-green-500',
    'bg-blue-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-yellow-500',
    'bg-indigo-500',
    'bg-red-500',
  ];

  React.useEffect(() => {
    const loadFixed = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching fixed costs...');
        const data = await fetchFixed(30); // Last 30 days
        console.log('Fixed costs data received:', data);

        // Assign colors to categories
        const categoriesWithColors = data.categories.map((cat, index) => ({
          ...cat,
          color: categoryColors[index % categoryColors.length],
          // For now, set budget as 1.5x of spent (you can make this dynamic later)
          budget: cat.spent * 1.5
        }));

        setCategories(categoriesWithColors);
        setTotalSpent(data.total_spent);
      } catch (error) {
        console.error('Failed to load fixed costs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFixed();
  }, []);

  const handleToggleCategory = async (categoryName: string) => {
    if (expandedCategory === categoryName) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryName);

      // Fetch transactions if not already loaded
      if (!categoryTransactions[categoryName]) {
        try {
          setLoadingTransactions(categoryName);
          const data = await fetchFixedTransactions(categoryName, 30);
          setCategoryTransactions(prev => ({
            ...prev,
            [categoryName]: data.transactions
          }));
        } catch (error) {
          console.error(`Failed to load transactions for ${categoryName}:`, error);
        } finally {
          setLoadingTransactions(null);
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 text-slate-500">Loading fixed costs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="px-1">
        <div className="flex justify-between items-center">
          <h2 className="text-slate-800 font-bold text-xl">Fixed Costs</h2>
          <span className="flex items-center bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
            Monthly
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="text-slate-600 font-medium mb-2">Total Spent</h3>
        <div className="text-4xl font-bold text-slate-800">${formatCurrency(totalSpent)}</div>
        <p className="text-sm text-slate-500 mt-1">Last 30 days</p>
      </div>

      {categories.length > 0 ? (
        categories.map((category, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div
              className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => handleToggleCategory(category.category)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`w-3 h-3 rounded-full ${category.color}`}></span>
                  <span className="font-semibold text-slate-800">{category.category}</span>
                  <ChevronDownIcon
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      expandedCategory === category.category ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                <span className="font-bold text-slate-800">
                  ${formatCurrency(category.spent)} / <span className="text-slate-500">${formatCurrency(category.budget)}</span>
                </span>
              </div>
              <div className="mt-3">
                <ProgressBar value={category.spent} max={category.budget} color={category.color} />
              </div>
              <p className="text-xs text-slate-500 mt-2">{category.transaction_count} transactions</p>
            </div>

            {/* Transaction List */}
            {expandedCategory === category.category && (
              <div className="border-t border-slate-100 bg-slate-50">
                {loadingTransactions === category.category ? (
                  <div className="p-4 text-center text-slate-500 text-sm">Loading transactions...</div>
                ) : categoryTransactions[category.category]?.length > 0 ? (
                  <div className="p-4 space-y-2">
                    {categoryTransactions[category.category].map((txn, txnIndex) => {
                      let formattedDate = '';
                      try {
                        if (txn.date) {
                          const dateParts = txn.date.split('-');
                          if (dateParts.length === 3) {
                            const day = dateParts[2];
                            const month = dateParts[1];
                            formattedDate = `${day}/${month}`;
                          } else {
                            formattedDate = txn.date;
                          }
                        }
                      } catch (e) {
                        formattedDate = '';
                      }
                      return (
                        <div key={txnIndex} className="flex justify-between items-center py-2 px-3 bg-white rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-700">{txn.description}</span>
                            {formattedDate && <span className="text-xs text-slate-500">{formattedDate}</span>}
                          </div>
                          <span className="text-sm font-semibold text-slate-800">${formatCurrency(txn.amount)}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center text-slate-500 text-sm">No transactions found</div>
                )}
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <p className="text-slate-500">No fixed cost expenses found.</p>
          <p className="text-sm text-slate-400 mt-2">Sync your Plaid transactions to see fixed costs.</p>
        </div>
      )}
    </div>
  );
};


const IncomeScreen: React.FC = () => {
  const { fetchIncome, fetchIncomeTransactions } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [totalEarned, setTotalEarned] = useState<number>(0);
  const [priorMonthTotal, setPriorMonthTotal] = useState<number>(0);
  const [currentMonthLabel, setCurrentMonthLabel] = useState<string>('');
  const [priorMonthLabel, setPriorMonthLabel] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [categoryTransactions, setCategoryTransactions] = useState<{ [key: string]: any[] }>({});
  const [loadingTransactions, setLoadingTransactions] = useState<string | null>(null);

  // Color palette for categories
  const categoryColors = [
    'bg-green-500',
    'bg-blue-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-yellow-500',
    'bg-indigo-500',
    'bg-red-500',
  ];

  React.useEffect(() => {
    const loadIncome = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching income...');
        const data = await fetchIncome();
        console.log('Income data received:', data);

        // Assign colors to categories
        const categoriesWithColors = data.categories.map((cat, index) => ({
          ...cat,
          color: categoryColors[index % categoryColors.length],
        }));

        setCategories(categoriesWithColors);
        setTotalEarned(data.current_month_total);
        setPriorMonthTotal(data.prior_month_total);
        setCurrentMonthLabel(data.current_month_period.label);
        setPriorMonthLabel(data.prior_month_period.label);
      } catch (error) {
        console.error('Failed to load income:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadIncome();
  }, []);

  const handleToggleCategory = async (categoryName: string) => {
    if (expandedCategory === categoryName) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryName);

      // Fetch transactions if not already loaded
      if (!categoryTransactions[categoryName]) {
        try {
          setLoadingTransactions(categoryName);
          const data = await fetchIncomeTransactions(categoryName);
          setCategoryTransactions(prev => ({
            ...prev,
            [categoryName]: data.transactions
          }));
        } catch (error) {
          console.error(`Failed to load transactions for ${categoryName}:`, error);
        } finally {
          setLoadingTransactions(null);
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 text-slate-500">Loading income data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="px-1">
        <div className="flex justify-between items-center">
          <h2 className="text-slate-800 font-bold text-xl">Income</h2>
          <span className="flex items-center bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
            Monthly
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="text-slate-600 font-medium mb-2">Total Earned This Month</h3>
        <div className="text-4xl font-bold text-green-600">${formatCurrency(totalEarned)}</div>
        <p className="text-sm text-slate-500 mt-1">{currentMonthLabel}</p>
        {priorMonthTotal > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-200">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{priorMonthLabel}:</span>
              <span className="font-semibold text-slate-700">${formatCurrency(priorMonthTotal)}</span>
            </div>
          </div>
        )}
      </div>

      {categories.length > 0 ? (
        categories.map((category) => {
          const isExpanded = expandedCategory === category.category;
          const transactions = categoryTransactions[category.category] || [];
          const isLoadingTxn = loadingTransactions === category.category;

          return (
            <div key={category.category} className="bg-white rounded-2xl shadow-sm p-4">
              <button
                onClick={() => handleToggleCategory(category.category)}
                className="w-full"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                    <div className="text-left">
                      <div className="font-semibold text-slate-800 capitalize">
                        {category.category.replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs text-slate-500">
                        {category.transaction_count} transaction{category.transaction_count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        ${category.current_month_earned ? formatCurrency(category.current_month_earned) : '0.00'}
                      </div>
                      {category.prior_month_earned > 0 && (
                        <div className="text-xs text-slate-500">
                          vs ${formatCurrency(category.prior_month_earned)}
                        </div>
                      )}
                    </div>
                    <svg
                      className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  {isLoadingTxn ? (
                    <div className="text-center py-4 text-slate-500 text-sm">Loading transactions...</div>
                  ) : transactions.length > 0 ? (
                    <div className="space-y-2">
                      {transactions.map((txn, txnIndex) => (
                        <div key={txnIndex} className="flex justify-between items-center py-2">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-slate-700">{txn.description}</div>
                            <div className="text-xs text-slate-500">{txn.date}</div>
                          </div>
                          <div className="text-sm font-semibold text-green-600">
                            ${formatCurrency(txn.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-slate-500 text-sm">No transactions found</div>
                  )}
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <p className="text-slate-500">No income data available</p>
        </div>
      )}
    </div>
  );
};



const AppContent: React.FC = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isBankConnected, setIsBankConnected] = useState(false);
  const [activeScreen, setActiveScreen] = useState<Screen>(Screen.Grow);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showVerifyEmail, setShowVerifyEmail] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showAccounts, setShowAccounts] = useState(false);
  const [showFounders, setShowFounders] = useState(false);

  // Check URL on mount to see if we should show verify-email or reset-password
  useEffect(() => {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);

    // Check if this is an email verification link (has token parameter or /verify-email path)
    if (path.includes('/verify-email') || searchParams.has('token')) {
      setShowVerifyEmail(true);
    } else if (path.includes('/reset-password') || searchParams.has('reset-password')) {
      setShowResetPassword(true);
    }
  }, []);

  const handleSignIn = useCallback(() => {
    setIsSignedIn(true);
  }, []);

  const handleShowThankYou = useCallback(() => {
    setShowThankYou(true);
  }, []);

  const handleBankConnectionComplete = useCallback(() => {
    setIsBankConnected(true);
  }, []);

  const handleSkipBankConnection = useCallback(() => {
    setIsBankConnected(true);
  }, []);

  const handleSignOut = useCallback(() => {
    setIsSignedIn(false);
    setIsBankConnected(false);
  }, []);

  const handleVerificationComplete = useCallback(() => {
    setShowVerifyEmail(false);
    // Clear URL parameters
    window.history.replaceState({}, '', '/');
  }, []);

  const handleResetComplete = useCallback(() => {
    setShowResetPassword(false);
    // Clear URL parameters
    window.history.replaceState({}, '', '/');
  }, []);

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

  // Show verify email screen if accessed via verification link
  if (showVerifyEmail) {
    return <VerifyEmailScreen onVerificationComplete={handleVerificationComplete} />;
  }

  // Show reset password screen if accessed via reset link
  if (showResetPassword) {
    return <ResetPasswordScreen onResetComplete={handleResetComplete} />;
  }

  if (showThankYou) {
    return <ThankYouScreen />;
  }

  if (showFounders) {
    return <FoundersPage onBack={handleBackFromFounders} />;
  }

  if (!isSignedIn) {
    return <WelcomeScreen onSignIn={handleSignIn} onShowThankYou={handleShowThankYou} onShowFounders={handleShowFounders} />;
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
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
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
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
