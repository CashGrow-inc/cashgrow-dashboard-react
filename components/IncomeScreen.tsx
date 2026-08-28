import React, { useMemo, useState } from 'react';
import { formatCurrency } from './shared';
import TransactionEditModal from './TransactionEditModal';
import { TransactionWithId, TransactionEditState } from '../types';
import {
  useAccountIds,
  useIncomeQuery,
  useIncomeTransactionsQuery,
  useInvalidateFinance,
  useThreeMonthAverageQuery,
} from '../hooks/financeQueries';

interface IncomeScreenProps {
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

const IncomeScreen: React.FC<IncomeScreenProps> = ({ hasBankAccount, onConnectBank }) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [editModalState, setEditModalState] = useState<TransactionEditState>({
    isOpen: false,
    transaction: null,
    transactionType: 'INCOME',
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { accountIds } = useAccountIds();
  const invalidateFinance = useInvalidateFinance();

  const { data, isLoading } = useIncomeQuery(hasBankAccount);
  const { data: averageData } = useThreeMonthAverageQuery('income', hasBankAccount);

  const categories = useMemo(
    () =>
      (data?.categories ?? []).map((cat, index) => ({
        ...cat,
        color: categoryColors[index % categoryColors.length],
      })),
    [data]
  );

  const totalEarned = data?.current_month_total ?? 0;
  const threeMonthAverage = averageData?.average ?? 0;
  const currentMonthLabel = accountIds.length === 0
    ? 'No accounts selected'
    : data?.current_month_period?.label ?? '';

  // Unlike the expense screens, income rows always fetch on expand — there is
  // no transaction_count short-circuit here, and there wasn't one before.
  const { data: expandedData, isLoading: isLoadingTransactions } = useIncomeTransactionsQuery(
    expandedCategory,
    hasBankAccount
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
      transactionType: 'INCOME',
    });
  };

  const handleEditModalClose = () => {
    setEditModalState({
      isOpen: false,
      transaction: null,
      transactionType: 'INCOME',
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
        <div className="text-center py-8 text-slate-500">Loading income data...</div>
      </div>
    );
  }

  // Show connect prompt if no bank account
  if (!hasBankAccount) {
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
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <p className="text-slate-500">Track your income sources</p>
          <p className="text-sm text-slate-400 mt-2">Connect your bank to see your income data.</p>
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
          <h2 className="text-slate-800 font-bold text-xl">Income</h2>
          <span className="flex items-center bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
            Monthly
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="text-slate-600 font-medium mb-2">Total Earned This Month</h3>
        <div className="text-3xl min-[390px]:text-4xl font-bold text-green-600">${formatCurrency(totalEarned)}</div>
        <p className="text-sm text-slate-500 mt-1">{currentMonthLabel}</p>
        {threeMonthAverage > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-200">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Expected:</span>
              <span className="font-semibold text-slate-700">${formatCurrency(threeMonthAverage)}</span>
            </div>
            {totalEarned !== threeMonthAverage && (
              <div className="flex justify-end mt-1">
                <span className={`text-xs font-medium ${totalEarned >= threeMonthAverage ? 'text-green-600' : 'text-red-500'}`}>
                  {totalEarned >= threeMonthAverage ? '+' : '-'}${formatCurrency(Math.abs(totalEarned - threeMonthAverage))}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {categories.length > 0 ? (
        categories.map((category) => {
          const isExpanded = expandedCategory === category.category;
          const transactions = isExpanded ? expandedTransactions : [];
          const isLoadingTxn = isExpanded && isLoadingTransactions;

          return (
            <div key={category.category} className="bg-white rounded-2xl shadow-sm p-4">
              <button
                onClick={() => handleToggleCategory(category.category)}
                className="w-full"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${category.color}`}></div>
                    <div className="text-left min-w-0">
                      <div className="font-semibold text-slate-800 capitalize truncate">
                        {category.category.replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs text-slate-500">
                        {category.transaction_count} transaction{category.transaction_count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        ${category.current_month_earned ? formatCurrency(category.current_month_earned) : '0.00'}
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
                  {isLoadingTxn ? (
                    <div className="text-center py-4 text-slate-500 text-sm">Loading transactions...</div>
                  ) : transactions.length > 0 ? (
                    <div className="space-y-2">
                      {transactions.map((txn: any, txnIndex: number) => (
                        <div
                          key={txnIndex}
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
                            <div className={`text-sm font-semibold ${txn.status === 'pending' ? 'text-amber-600' : 'text-green-600'}`}>
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
          <p className="text-sm text-slate-400 mt-2">
            Income transactions like salary and deposits will appear here.
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

export default IncomeScreen;
