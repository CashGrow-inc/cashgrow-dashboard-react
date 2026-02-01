import React, { useState, useMemo } from 'react';
import { useAuth } from '../AuthContext';
import { useAccountFilter } from '../contexts/AccountFilterContext';
import { formatCurrency } from './shared';
import TransactionEditModal from './TransactionEditModal';
import { TransactionWithId, TransactionEditState } from '../types';

interface IncomeScreenProps {
  hasBankAccount: boolean;
  onConnectBank: () => void;
}

const IncomeScreen: React.FC<IncomeScreenProps> = ({ hasBankAccount, onConnectBank }) => {
  const { fetchIncome, fetchIncomeTransactions, fetchThreeMonthAverage } = useAuth();
  const { checkedAccountIds } = useAccountFilter();
  const [categories, setCategories] = useState<any[]>([]);
  const [totalEarned, setTotalEarned] = useState<number>(0);
  const [threeMonthAverage, setThreeMonthAverage] = useState<number>(0);
  const [currentMonthLabel, setCurrentMonthLabel] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [categoryTransactions, setCategoryTransactions] = useState<{ [key: string]: any[] }>({});
  const [loadingTransactions, setLoadingTransactions] = useState<string | null>(null);
  const [editModalState, setEditModalState] = useState<TransactionEditState>({
    isOpen: false,
    transaction: null,
    transactionType: 'INCOME',
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
      setCategories([]);
      setTotalEarned(0);
      setThreeMonthAverage(0);
      setCurrentMonthLabel('No accounts selected');
      setCategoryTransactions({});
      setIsLoading(false);
      return;
    }

    const loadIncome = async (showLoading = true, clearCache = true) => {
      try {
        if (showLoading) setIsLoading(true);
        console.log('Fetching income with accounts:', accountIds);

        // Fetch both income data and 3-month average in parallel
        const [data, averageData] = await Promise.all([
          fetchIncome(accountIds),
          fetchThreeMonthAverage('income', accountIds).catch(() => null)
        ]);

        console.log('Income data received:', data);
        console.log('3-month average received:', averageData);

        const categoriesWithColors = data.categories.map((cat, index) => ({
          ...cat,
          color: categoryColors[index % categoryColors.length],
        }));

        setCategories(categoriesWithColors);
        setTotalEarned(data.current_month_total);
        setThreeMonthAverage(averageData?.average || 0);
        setCurrentMonthLabel(data.current_month_period.label);
        // Only clear cached transactions on initial load, not background refresh
        if (clearCache) {
          setCategoryTransactions({});
        }
      } catch (error) {
        console.error('Failed to load income:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadIncome();

    // Poll for new data every 30 seconds
    const interval = setInterval(() => {
      loadIncome(false, false); // Don't show loading spinner or clear cache on background refresh
    }, 30000);

    return () => clearInterval(interval);
  }, [hasBankAccount, accountIdsKey, fetchIncome, fetchThreeMonthAverage]);

  const handleToggleCategory = async (categoryName: string) => {
    if (expandedCategory === categoryName) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryName);

      if (!categoryTransactions[categoryName]) {
        try {
          setLoadingTransactions(categoryName);
          // Derive accountIds from accountIdsKey to ensure it's fresh
          const accountIds = accountIdsKey ? accountIdsKey.split(',') : [];
          const data = await fetchIncomeTransactions(categoryName, accountIds);
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

  const handleEditSuccess = () => {
    // Clear cached transactions to force refresh
    setCategoryTransactions({});
    // Show success message
    setSuccessMessage('Transaction updated successfully!');
    setTimeout(() => setSuccessMessage(null), 4000);
    // Re-fetch the expanded category if any
    if (expandedCategory) {
      const accountIds = accountIdsKey ? accountIdsKey.split(',') : [];
      fetchIncomeTransactions(expandedCategory, accountIds)
        .then(data => {
          setCategoryTransactions(prev => ({
            ...prev,
            [expandedCategory]: data.transactions
          }));
        })
        .catch(err => console.error('Failed to refresh transactions:', err));
    }
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
        <div className="text-4xl font-bold text-green-600">${formatCurrency(totalEarned)}</div>
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
