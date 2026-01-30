import React, { useState, useMemo } from 'react';
import { useAuth } from '../AuthContext';
import { useAccountFilter } from '../contexts/AccountFilterContext';
import { WeeklyIcon, AutosaveIcon, GoalIcon } from './Icons';
import { formatCurrency } from './shared';

interface GrowScreenProps {
  hasBankAccount: boolean;
  onConnectBank: () => void;
}

const GrowScreen: React.FC<GrowScreenProps> = ({ hasBankAccount, onConnectBank }) => {
  const { fetchGrow } = useAuth();
  const { checkedAccountIds } = useAccountFilter();
  const [growValue, setGrowValue] = useState<number>(0);
  const [currentWeekLabel, setCurrentWeekLabel] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [monthlyGoal, setMonthlyGoal] = useState<number>(() => {
    const saved = localStorage.getItem('monthlyGoal');
    return saved ? parseFloat(saved) : 700;
  });
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);
  const [goalInputValue, setGoalInputValue] = useState<string>(monthlyGoal.toString());

  // Convert Set to stable string for dependency comparison
  const accountIdsKey = useMemo(() => Array.from(checkedAccountIds).sort().join(','), [checkedAccountIds]);

  React.useEffect(() => {
    // Don't fetch if user hasn't connected a bank
    if (!hasBankAccount) {
      setIsLoading(false);
      return;
    }

    // Derive accountIds from accountIdsKey to ensure it's fresh
    const accountIds = accountIdsKey ? accountIdsKey.split(',') : [];

    // If no accounts are checked, show zero state without calling API
    if (accountIds.length === 0) {
      setGrowValue(0);
      setCurrentWeekLabel('');
      setIsLoading(false);
      return;
    }

    const loadGrowData = async (showLoading = true) => {
      try {
        if (showLoading) setIsLoading(true);
        console.log('Fetching grow data with accounts:', accountIds, 'and monthly goal:', monthlyGoal);
        const data = await fetchGrow(monthlyGoal, accountIds);
        console.log('Grow data received:', data);

        // Find the current week (the week that contains today's date)
        if (data.weeks && data.weeks.length > 0) {
          const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
          const currentWeek = data.weeks.find(week => {
            return today >= week.week_start && today <= week.week_end;
          });

          if (currentWeek) {
            setGrowValue(currentWeek.grow);
            setCurrentWeekLabel(currentWeek.week_range);
            console.log('Current week grow value:', currentWeek.grow);
          } else {
            // Fall back to the last week if today isn't in any week
            const lastWeek = data.weeks[data.weeks.length - 1];
            setGrowValue(lastWeek.grow);
            setCurrentWeekLabel(lastWeek.week_range);
          }
        } else {
          setGrowValue(0);
          setCurrentWeekLabel('');
        }
      } catch (error) {
        console.error('Failed to load grow data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadGrowData();

    // Poll for new data every 30 seconds
    const interval = setInterval(() => {
      loadGrowData(false); // Don't show loading spinner on background refresh
    }, 30000);

    return () => clearInterval(interval);
  }, [hasBankAccount, monthlyGoal, accountIdsKey, fetchGrow]);

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
          <h2 className="text-slate-600 font-medium">Weekly Budget</h2>
          <span className="flex items-center bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
            <WeeklyIcon className="w-4 h-4 mr-1" />
            This Week
          </span>
        </div>
        <div className={`text-5xl font-bold mb-3 ${growValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {isLoading ? '...' : `$${formatCurrency(Math.abs(growValue))}`}
        </div>
        <p className="text-slate-600">
          {isLoading ? '' : growValue >= 0
            ? `You have $${formatCurrency(growValue)} left to spend this week`
            : `You're $${formatCurrency(Math.abs(growValue))} over budget this week`
          }
        </p>
        {currentWeekLabel && (
          <p className="text-sm text-slate-500 mt-1">{currentWeekLabel}</p>
        )}
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
      ) : growValue > 0 ? (
        <div className="bg-green-50 rounded-2xl p-5 text-green-800">
          <h3 className="font-bold text-lg">You're growing strong!</h3>
          <p className="text-green-700">Keep up the good work! Your budget is on track this week.</p>
        </div>
      ) : growValue < 0 ? (
        <div className="bg-red-50 rounded-2xl p-5 text-red-800">
          <h3 className="font-bold text-lg">Watch your spending</h3>
          <p className="text-red-700">You've exceeded your weekly budget. Consider cutting back on unplanned expenses.</p>
        </div>
      ) : null}

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
