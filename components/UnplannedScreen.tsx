import React, { useState, useMemo } from 'react';
import { useAuth } from '../AuthContext';
import { useAccountFilter } from '../contexts/AccountFilterContext';
import { formatCurrency } from './shared';
import TransactionEditModal from './TransactionEditModal';
import { TransactionWithId, TransactionEditState } from '../types';

interface UnplannedScreenProps {
  hasBankAccount: boolean;
  onConnectBank: () => void;
}

const UnplannedScreen: React.FC<UnplannedScreenProps> = ({ hasBankAccount, onConnectBank }) => {
  const { fetchUnplanned } = useAuth();
  const { checkedAccountIds } = useAccountFilter();
  const [weeks, setWeeks] = useState<any[]>([]);
  const [totalUnplanned, setTotalUnplanned] = useState<number>(0);
  const [periodLabel, setPeriodLabel] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);
  const [editModalState, setEditModalState] = useState<TransactionEditState>({
    isOpen: false,
    transaction: null,
    transactionType: 'EXPENSE',
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

    // If no accounts are checked, show empty state without calling API
    if (accountIds.length === 0) {
      setWeeks([]);
      setTotalUnplanned(0);
      setPeriodLabel('No accounts selected');
      setIsLoading(false);
      return;
    }

    const loadUnplanned = async (showLoading = true) => {
      try {
        if (showLoading) setIsLoading(true);
        console.log('Fetching unplanned expenses with accounts:', accountIds);
        const data = await fetchUnplanned(accountIds);
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

    // Poll for new data every 30 seconds
    const interval = setInterval(() => {
      loadUnplanned(false); // Don't show loading spinner on background refresh
    }, 30000);

    return () => clearInterval(interval);
  }, [hasBankAccount, accountIdsKey, fetchUnplanned]);

  const handleToggleWeek = (weekStart: string) => {
    setExpandedWeek(expandedWeek === weekStart ? null : weekStart);
  };

  const handleTransactionClick = (txn: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const transaction: TransactionWithId = {
      id: txn.id,
      date: txn.date,
      description: txn.description,
      amount: txn.amount,
      category: txn.category,
      status: txn.status,
      is_recurring: txn.is_recurring,
    };
    setEditModalState({
      isOpen: true,
      transaction,
      transactionType: 'EXPENSE',
    });
  };

  const handleEditModalClose = () => {
    setEditModalState({
      isOpen: false,
      transaction: null,
      transactionType: 'EXPENSE',
    });
  };

  const handleEditSuccess = () => {
    // Show success message
    setSuccessMessage('Transaction updated successfully!');
    setTimeout(() => setSuccessMessage(null), 4000);
    // Re-fetch data
    const accountIds = accountIdsKey ? accountIdsKey.split(',') : [];
    fetchUnplanned(accountIds)
      .then(data => {
        setWeeks(data.weeks);
        setTotalUnplanned(data.total_unplanned);
        setPeriodLabel(data.period.label);
      })
      .catch(err => console.error('Failed to refresh unplanned:', err));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 text-slate-500">Loading unplanned expenses...</div>
      </div>
    );
  }

  // Show connect prompt if no bank account
  if (!hasBankAccount) {
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
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <p className="text-slate-500">Track your unplanned spending</p>
          <p className="text-sm text-slate-400 mt-2">Connect your bank to see unplanned expenses.</p>
          <button
            onClick={onConnectBank}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-full transition duration-300"
          >
            Connect Bank
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Success Toast */}
      {successMessage && (
        <div
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
          style={{ animation: 'fadeInDown 0.3s ease-out' }}
        >
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">{successMessage}</span>
            <button
              onClick={() => setSuccessMessage(null)}
              className="ml-2 hover:bg-green-700 rounded p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>

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
        <div className="text-3xl min-[390px]:text-4xl font-bold text-orange-600">${formatCurrency(totalUnplanned)}</div>
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
                  <div className="text-left min-w-0">
                    <div className="font-semibold text-slate-800">{week.week_label}</div>
                    <div className="text-xs text-slate-500">{week.week_range}</div>
                  </div>
                  <div className="flex items-center space-x-3 flex-shrink-0">
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
                        <div
                          key={txn.id}
                          onClick={(e) => handleTransactionClick(txn, e)}
                          className={`flex justify-between items-center py-2 px-2 rounded-lg cursor-pointer transition-colors ${
                            txn.status === 'pending'
                              ? 'bg-amber-50 border border-amber-200 hover:bg-amber-100'
                              : 'hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex-1">
                            <div className={`text-sm font-medium ${txn.status === 'pending' ? 'text-amber-700' : 'text-slate-700'}`}>
                              {txn.description}
                              {txn.status === 'pending' && (
                                <span className="ml-2 text-xs px-1.5 py-0.5 bg-amber-200 text-amber-800 rounded font-medium">Pending</span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500">{txn.date}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`text-sm font-semibold ${txn.status === 'pending' ? 'text-amber-600' : 'text-orange-600'}`}>
                              ${formatCurrency(txn.amount)}
                            </div>
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
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
          <p className="text-sm text-slate-400 mt-2">
            Great job! You have no unplanned spending to track.
          </p>
        </div>
      )}

      {/* Transaction Edit Modal */}
      <TransactionEditModal
        isOpen={editModalState.isOpen}
        transaction={editModalState.transaction}
        transactionType={editModalState.transactionType}
        onClose={handleEditModalClose}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default UnplannedScreen;
