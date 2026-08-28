import React, { useMemo, useState } from 'react';
import { ChevronDownIcon } from './Icons';
import { formatCurrency, ProgressBar } from './shared';
import TransactionEditModal from './TransactionEditModal';
import { TransactionWithId, TransactionEditState } from '../types';
import {
  useCategoryAverageMap,
  useFixedQuery,
  useFixedTransactionsQuery,
  useInvalidateFinance,
  useThreeMonthAverageQuery,
} from '../hooks/financeQueries';

interface FixedScreenProps {
  hasBankAccount: boolean;
  onConnectBank: () => void;
}

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

const FixedScreen: React.FC<FixedScreenProps> = ({ hasBankAccount, onConnectBank }) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [editModalState, setEditModalState] = useState<TransactionEditState>({
    isOpen: false,
    transaction: null,
    transactionType: 'EXPENSE',
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const invalidateFinance = useInvalidateFinance();

  const { data, isLoading } = useFixedQuery(hasBankAccount);
  const { data: averageData } = useThreeMonthAverageQuery('fixed_costs', hasBankAccount);
  const averageMap = useCategoryAverageMap('fixed_costs', hasBankAccount);

  const categories = useMemo(
    () =>
      (data?.categories ?? []).map((cat, index) => {
        const categoryAverage = averageMap.get(cat.category) || 0;
        return {
          ...cat,
          color: categoryColors[index % categoryColors.length],
          budget: categoryAverage > 0 ? categoryAverage : cat.spent,
        };
      }),
    [data, averageMap]
  );

  const totalSpent = data?.total_spent ?? 0;
  const threeMonthAverage = averageData?.average ?? 0;

  const currentPeriodLabel = useMemo(() => {
    if (!data?.period_start || !data?.period_end) return '';
    const start = new Date(data.period_start + 'T00:00:00');
    const end = new Date(data.period_end + 'T00:00:00');
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('en-US', opts)} - ${end.toLocaleDateString('en-US', opts)}`;
  }, [data]);

  // A category with no transactions still must not hit the API — the old code
  // short-circuited in the click handler, this expresses it as a disabled query.
  const expandedHasTransactions =
    (categories.find(cat => cat.category === expandedCategory)?.transaction_count ?? 0) > 0;
  const { data: expandedData, isLoading: isLoadingTransactions } = useFixedTransactionsQuery(
    expandedCategory,
    hasBankAccount && expandedHasTransactions
  );
  const expandedTransactions = expandedData?.transactions ?? [];

  const handleToggleCategory = (categoryName: string) => {
    setExpandedCategory(prev => (prev === categoryName ? null : categoryName));
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

  const handleEditSuccess = async () => {
    setSuccessMessage('Transaction updated successfully!');
    setTimeout(() => setSuccessMessage(null), 4000);

    // Recategorizing moves money between groups, so drop every cached figure,
    // not just this screen's. Mounted queries refetch and swap in place — the
    // expanded row's transactions included — with no loading flash.
    await invalidateFinance();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 text-slate-500">Loading fixed costs...</div>
      </div>
    );
  }

  // Show connect prompt if no bank account
  if (!hasBankAccount) {
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
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <p className="text-slate-500">Track your fixed monthly costs</p>
          <p className="text-sm text-slate-400 mt-2">Connect your bank to see your fixed expenses.</p>
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
          <h2 className="text-slate-800 font-bold text-xl">Fixed Costs</h2>
          <span className="flex items-center bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
            Monthly
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="text-slate-600 font-medium mb-2">Total Spent</h3>
        <div className="text-3xl min-[390px]:text-4xl font-bold text-slate-800">${formatCurrency(totalSpent)}</div>
        <p className="text-sm text-slate-500 mt-1">{currentPeriodLabel}</p>
        {threeMonthAverage > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-200">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Expected:</span>
              <span className="font-semibold text-slate-700">${formatCurrency(threeMonthAverage)}</span>
            </div>
            {totalSpent !== threeMonthAverage && (
              <div className="flex justify-end mt-1">
                <span className={`text-xs font-medium ${totalSpent <= threeMonthAverage ? 'text-green-600' : 'text-red-500'}`}>
                  {totalSpent <= threeMonthAverage ? '-' : '+'}${formatCurrency(Math.abs(totalSpent - threeMonthAverage))}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {categories.length > 0 ? (
        categories.map((category, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div
              className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => handleToggleCategory(category.category)}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center space-x-3 min-w-0">
                  <span className={`w-3 h-3 rounded-full flex-shrink-0 ${category.color}`}></span>
                  <span className="font-semibold text-slate-800 truncate">{category.category}</span>
                  <ChevronDownIcon
                    className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${
                      expandedCategory === category.category ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                <span className="font-bold text-slate-800 flex-shrink-0 whitespace-nowrap text-sm min-[390px]:text-base">
                  ${formatCurrency(category.spent)} / <span className="text-slate-500">${formatCurrency(category.budget)}</span>
                </span>
              </div>
              <div className="mt-3">
                <ProgressBar value={category.spent} max={category.budget} color={category.color} />
              </div>
              <p className="text-xs text-slate-500 mt-2">{category.transaction_count} transactions</p>
            </div>

            {expandedCategory === category.category && (
              <div className="border-t border-slate-100 bg-slate-50">
                {isLoadingTransactions ? (
                  <div className="p-4 text-center text-slate-500 text-sm">Loading transactions...</div>
                ) : expandedTransactions.length > 0 ? (
                  <div className="p-4 space-y-2">
                    {expandedTransactions.map((txn: any, txnIndex: number) => {
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
                        <div
                          key={txnIndex}
                          onClick={(e) => handleTransactionClick(txn, e)}
                          className={`flex justify-between items-center py-2 px-3 rounded-lg cursor-pointer transition-colors ${
                            txn.status === 'pending'
                              ? 'bg-amber-50 border border-amber-200 hover:bg-amber-100'
                              : 'bg-white hover:bg-slate-100'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <span className={`block truncate text-sm ${txn.status === 'pending' ? 'text-amber-700' : 'text-slate-700'}`}>{txn.description}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              {formattedDate && <span className="text-xs text-slate-500">{formattedDate}</span>}
                              {txn.status === 'pending' && (
                                <span className="text-xs px-1.5 py-0.5 bg-amber-200 text-amber-800 rounded font-medium">Pending</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-sm font-semibold ${txn.status === 'pending' ? 'text-amber-700' : 'text-slate-800'}`}>${formatCurrency(txn.amount)}</span>
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center text-slate-500 text-sm">No transactions this month</div>
                )}
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <p className="text-slate-500">No fixed cost expenses found.</p>
          <p className="text-sm text-slate-400 mt-2">
            Fixed costs like rent, subscriptions, and utilities will appear here.
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

export default FixedScreen;
