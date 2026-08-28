import React, { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../AuthContext';
import { WeeklyIcon, GoalIcon } from './Icons';
import { formatCurrency } from './shared';
import {
  FINANCE_KEY,
  useGrowQuery,
  useInvalidateFinance,
  useMonthlyGoalQuery,
} from '../hooks/financeQueries';

interface GrowScreenProps {
  hasBankAccount: boolean;
  onConnectBank: () => void;
}

const GrowScreen: React.FC<GrowScreenProps> = ({ hasBankAccount, onConnectBank }) => {
  const { updateMonthlyGoal } = useAuth();
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);
  const [goalInputValue, setGoalInputValue] = useState<string>('0');
  const [isSavingGoal, setIsSavingGoal] = useState<boolean>(false);

  const queryClient = useQueryClient();
  const invalidateFinance = useInvalidateFinance();

  const { data: growData, isLoading } = useGrowQuery(hasBankAccount);
  const { data: goalData } = useMonthlyGoalQuery();

  const monthlyGoal =
    goalData?.monthly_goal ?? growData?.budget_breakdown?.monthly_goal ?? 0;

  // The week containing today, falling back to the last week in the range.
  const currentWeek = useMemo(() => {
    const weeks = growData?.weeks;
    if (!weeks || weeks.length === 0) return null;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return weeks.find(week => today >= week.week_start && today <= week.week_end)
      ?? weeks[weeks.length - 1];
  }, [growData]);

  const growValue = currentWeek?.grow ?? 0;
  const currentWeekLabel = currentWeek?.week_range ?? '';

  const handleEditGoal = () => {
    setIsEditingGoal(true);
    setGoalInputValue(monthlyGoal.toString());
  };

  const handleSaveGoal = async () => {
    const newGoal = parseFloat(goalInputValue);
    if (!isNaN(newGoal) && newGoal >= 0) {
      try {
        setIsSavingGoal(true);
        await updateMonthlyGoal(newGoal);
        setIsEditingGoal(false);

        // Show the new goal immediately, then let the invalidation refetch it
        // along with the grow numbers it feeds into.
        queryClient.setQueryData([FINANCE_KEY, 'monthlyGoal'], { monthly_goal: newGoal });
        await invalidateFinance();
      } catch (error) {
        console.error('Failed to save monthly goal:', error);
      } finally {
        setIsSavingGoal(false);
      }
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
        <div className={`text-3xl min-[390px]:text-5xl font-bold mb-3 ${growValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {isLoading ? '...' : growValue >= 0 ? `$${formatCurrency(growValue)}` : `-$${formatCurrency(Math.abs(growValue))}`}
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
        <div className="flex items-center space-x-2 mb-1">
          <GoalIcon className="w-8 h-8 text-slate-400" />
          <h2 className="text-slate-600 font-medium text-lg">Monthly Saving Goal</h2>
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
                className="text-2xl min-[390px]:text-4xl font-bold text-slate-800 border-b-2 border-blue-500 focus:outline-none w-32 min-[390px]:w-40"
                autoFocus
                placeholder="700"
              />
            </div>
          ) : (
            <span className="text-2xl min-[390px]:text-4xl font-bold text-slate-800">${formatCurrency(monthlyGoal)}</span>
          )}
          <div className="flex items-center space-x-2">
            {isEditingGoal ? (
              <>
                <button
                  onClick={handleSaveGoal}
                  disabled={isSavingGoal}
                  className="text-sm font-semibold text-green-600 hover:text-green-700 px-3 py-1 bg-green-50 rounded disabled:opacity-50"
                >
                  {isSavingGoal ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelGoal}
                  disabled={isSavingGoal}
                  className="text-sm font-semibold text-slate-600 hover:text-slate-700 px-3 py-1 bg-slate-50 rounded disabled:opacity-50"
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
