import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { WeeklyIcon, AutosaveIcon, GoalIcon } from './Icons';
import { formatCurrency, ProgressBar } from './shared';

interface GrowScreenProps {
  hasBankAccount: boolean;
  onConnectBank: () => void;
}

const GrowScreen: React.FC<GrowScreenProps> = ({ hasBankAccount, onConnectBank }) => {
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
    // Don't fetch if user hasn't connected a bank
    if (!hasBankAccount) {
      setIsLoading(false);
      return;
    }

    const loadBudget = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching budget summary...');
        const summary = await fetchBudgetSummary(7, monthlyGoal);
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
  }, [hasBankAccount, monthlyGoal]);

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

      {!hasBankAccount ? (
        <div className="bg-blue-50 rounded-2xl p-5 text-center">
          <h3 className="font-bold text-lg text-slate-800">Connect your bank to get started</h3>
          <p className="text-slate-600 mt-1">Link your accounts to see your real budget and spending insights.</p>
          <button
            onClick={onConnectBank}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-full transition duration-300"
          >
            Connect Bank
          </button>
        </div>
      ) : (
        <div className="bg-green-50 rounded-2xl p-5 text-green-800">
          <h3 className="font-bold text-lg">You're growing strong!</h3>
          <p className="text-green-700">You spent 25% less on takeout this week. That's $32 growing in your pocket!</p>
        </div>
      )}

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

export default GrowScreen;
