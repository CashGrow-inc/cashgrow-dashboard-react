import React, { useState, useMemo } from 'react';
import { useAuth } from '../AuthContext';
import { useAccountFilter } from '../contexts/AccountFilterContext';
import { ChevronDownIcon } from './Icons';
import { formatCurrency, ProgressBar } from './shared';
import TransactionEditModal from './TransactionEditModal';
import { TransactionWithId, TransactionEditState } from '../types';

interface FixedScreenProps {
  hasBankAccount: boolean;
  onConnectBank: () => void;
}

const FixedScreen: React.FC<FixedScreenProps> = ({ hasBankAccount, onConnectBank }) => {
  const { fetchFixed, fetchFixedTransactions, fetchThreeMonthAverage, fetchCategoryAverage } = useAuth();
  const { checkedAccountIds } = useAccountFilter();
  const [categories, setCategories] = useState<any[]>([]);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [threeMonthAverage, setThreeMonthAverage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [categoryTransactions, setCategoryTransactions] = useState<{ [key: string]: any[] }>({});
  const [loadingTransactions, setLoadingTransactions] = useState<string | null>(null);
  const [editModalState, setEditModalState] = useState<TransactionEditState>({
    isOpen: false,
    transaction: null,
    transactionType: 'EXPENSE',
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
      setTotalSpent(0);
      setThreeMonthAverage(0);
      setCategoryTransactions({});
      setIsLoading(false);
      return;
    }

    const loadFixed = async (showLoading = true, clearCache = true) => {
      try {
        if (showLoading) setIsLoading(true);
        console.log('Fetching fixed costs with accounts:', accountIds);

        // Fetch both fixed costs data and 3-month average in parallel
        const [data, averageData] = await Promise.all([
          fetchFixed(undefined, accountIds),
          fetchThreeMonthAverage('fixed_costs', accountIds).catch(() => null)
        ]);

        console.log('Fixed costs data received:', data);
        console.log('3-month average received:', averageData);

        // Fetch 3-month average for each category in parallel
        const categoryAverages = await Promise.all(
          data.categories.map(cat =>
            fetchCategoryAverage(cat.category, accountIds)
              .then(avg => ({ category: cat.category, average: avg.average }))
              .catch(() => ({ category: cat.category, average: 0 }))
          )
        );

        // Create a map for quick lookup
        const averageMap = new Map(categoryAverages.map(ca => [ca.category, ca.average]));

        const categoriesWithColors = data.categories.map((cat, index) => {
          const categoryAverage = averageMap.get(cat.category) || 0;
          return {
            ...cat,
            color: categoryColors[index % categoryColors.length],
            budget: categoryAverage > 0 ? categoryAverage : cat.spent
          };
        });

        setCategories(categoriesWithColors);
        setTotalSpent(data.total_spent);
        setThreeMonthAverage(averageData?.average || 0);
        // Only clear cached transactions on initial load, not background refresh
        if (clearCache) {
          setCategoryTransactions({});
        }
      } catch (error) {
        console.error('Failed to load fixed costs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFixed();

    // Poll for new data every 30 seconds
    const interval = setInterval(() => {
      loadFixed(false, false); // Don't show loading spinner or clear cache on background refresh
    }, 30000);

    return () => clearInterval(interval);
  }, [hasBankAccount, accountIdsKey, fetchFixed, fetchThreeMonthAverage, fetchCategoryAverage]);

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
          const data = await fetchFixedTransactions(categoryName, undefined, accountIds);
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
    // Clear cached transactions to force refresh
    setCategoryTransactions({});
    // Show success message
    setSuccessMessage('Transaction updated successfully!');
    setTimeout(() => setSuccessMessage(null), 4000);
    // Re-fetch the expanded category if any
    if (expandedCategory) {
      const accountIds = accountIdsKey ? accountIdsKey.split(',') : [];
      fetchFixedTransactions(expandedCategory, undefined, accountIds)
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
        <div className="text-4xl font-bold text-slate-800">${formatCurrency(totalSpent)}</div>
        <p className="text-sm text-slate-500 mt-1">Last 30 days</p>
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
                        <div
                          key={txnIndex}
                          onClick={(e) => handleTransactionClick(txn, e)}
                          className={`flex justify-between items-center py-2 px-3 rounded-lg cursor-pointer transition-colors ${
                            txn.status === 'pending'
                              ? 'bg-amber-50 border border-amber-200 hover:bg-amber-100'
                              : 'bg-white hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`text-sm ${txn.status === 'pending' ? 'text-amber-700' : 'text-slate-700'}`}>{txn.description}</span>
                            {formattedDate && <span className="text-xs text-slate-500">{formattedDate}</span>}
                            {txn.status === 'pending' && (
                              <span className="text-xs px-1.5 py-0.5 bg-amber-200 text-amber-800 rounded font-medium">Pending</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
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
                  <div className="p-4 text-center text-slate-500 text-sm">No transactions found</div>
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
