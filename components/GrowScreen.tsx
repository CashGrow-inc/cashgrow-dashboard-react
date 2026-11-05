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
import { useViewMonth } from '../contexts/MonthContext';

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

  const { data: growData, isLoading, isPlaceholderData } = useGrowQuery(hasBankAccount);
  const { data: goalData } = useMonthlyGoalQuery();
  const { isCurrentMonth, selectedLabel } = useViewMonth();
  const monthName = selectedLabel.split(' ')[0];

  const monthlyGoal =
    goalData?.monthly_goal ?? growData?.budget_breakdown?.monthly_goal ?? 0;

  // The week containing today, falling back to the last week in the range —
  // which, for a past month, is the month-end result with all carryover in.
  const currentWeek = useMemo(() => {
    const weeks = growData?.weeks;
    if (!weeks || weeks.length === 0) return null;
    const now = new Date();
    // Local date, not toISOString(): UTC would flip to tomorrow in the evening west of UTC.
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return weeks.find(week => today >= week.week_start && today <= week.week_end)
      ?? weeks[weeks.length - 1];
  }, [growData]);

  const growValue = currentWeek?.grow ?? 0;
  const currentWeekLabel = currentWeek?.week_range ?? '';
  const breakdown = growData?.budget_breakdown;
  const stateOfFunds = breakdown?.current_state_of_funds ?? 0;
  const [showFundsBreakdown, setShowFundsBreakdown] = useState<boolean>(false);

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
    <div className={`space-y-4 transition-opacity duration-200 ${isPlaceholderData ? 'opacity-60' : ''}`}>
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-slate-600 font-medium">{isCurrentMonth ? 'Weekly Budget' : `${monthName} Result`}</h2>
          <span className="flex items-center bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
            <WeeklyIcon className="w-4 h-4 mr-1" />
            {isCurrentMonth ? 'This Week' : 'Month End'}
          </span>
        </div>
        <div className={`text-3xl min-[390px]:text-5xl font-bold mb-3 ${growValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {isLoading ? '...' : growValue >= 0 ? `$${formatCurrency(growValue)}` : `-$${formatCurrency(Math.abs(growValue))}`}
        </div>
        <p className="text-slate-600">
          {isLoading ? '' : !isCurrentMonth
            ? growValue >= 0
              ? `You finished ${monthName} $${formatCurrency(growValue)} under budget`
              : `You finished ${monthName} $${formatCurrency(Math.abs(growValue))} over budget`
            : growValue >= 0
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
      ) : (
        // Expected income - expected fixed - expected monthlies - goal - actual unplanned
        <div className={`rounded-2xl p-5 text-center ${stateOfFunds >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <h3 className="font-bold text-lg text-slate-800">Current state of funds</h3>
          <div className={`text-3xl min-[390px]:text-4xl font-bold mt-1 ${stateOfFunds >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {isLoading ? '...' : stateOfFunds >= 0 ? `$${formatCurrency(stateOfFunds)}` : `-$${formatCurrency(Math.abs(stateOfFunds))}`}
          </div>
          {!isLoading && (
            <p className={`text-sm mt-1 ${stateOfFunds >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {isCurrentMonth
                ? stateOfFunds >= 0
                  ? `You can still spend $${formatCurrency(stateOfFunds)} on unplanned purchases this month and reach your savings goal.`
                  : `You've spent $${formatCurrency(Math.abs(stateOfFunds))} more on unplanned purchases than this month allows, so you're $${formatCurrency(Math.abs(stateOfFunds))} short of your savings goal.`
                : stateOfFunds >= 0
                  ? `You finished ${monthName} with $${formatCurrency(stateOfFunds)} to spare after your savings goal.`
                  : `You finished ${monthName} $${formatCurrency(Math.abs(stateOfFunds))} short of your savings goal.`}
            </p>
          )}
          {breakdown && (
            <>
              <button
                type="button"
                onClick={() => setShowFundsBreakdown(prev => !prev)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 mt-3"
              >
                {showFundsBreakdown ? 'Hide calculation' : 'How is this calculated?'}
              </button>
              {showFundsBreakdown && (
                <div className="mt-2 bg-white rounded-xl p-3 text-left text-sm text-slate-700 space-y-1">
                  {[
                    ['Expected income', breakdown.avg_income, '+'],
                    ['Expected fixed costs', breakdown.avg_fixed, '−'],
                    ['Expected monthlies', breakdown.expected_monthlies, '−'],
                    ['Savings goal', breakdown.monthly_goal, '−'],
                    [isCurrentMonth ? 'Unplanned spent so far' : 'Unplanned spent', breakdown.unplanned_spent, '−'],
                  ].map(([label, amount, sign]) => (
                    <div key={label as string} className="flex justify-between">
                      <span>{label}</span>
                      <span className="font-medium">{sign} ${formatCurrency(amount as number)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-slate-200 pt-1 font-bold">
                    <span>State of funds</span>
                    <span>{stateOfFunds < 0 ? '-' : ''}${formatCurrency(Math.abs(stateOfFunds))}</span>
                  </div>
                  <p className="text-xs text-slate-500 pt-1">
                    Expected amounts are your averages over the last 3 months (recurring income only).
                    Bills you pay don't change this number, since they're already counted as expected.
                    Unplanned spending lowers it as it happens.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}

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
            ) : isCurrentMonth ? (
              <button
                onClick={handleEditGoal}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Edit
              </button>
            ) : null}
          </div>
        </div>
        {!isCurrentMonth && (
          // One goal per user, not per month — editing it from history would
          // silently rewrite every month's figures.
          <p className="text-xs text-slate-500 mt-2">You can change your goal from the current month.</p>
        )}
      </div>
    </div>
  );
};

export default GrowScreen;
