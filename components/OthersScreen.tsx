import React, { useState, useMemo } from 'react';
import { useAuth } from '../AuthContext';
import { useAccountFilter } from '../contexts/AccountFilterContext';
import { formatCurrency } from './shared';
import TransactionEditModal from './TransactionEditModal';
import { TransactionWithId, TransactionEditState } from '../types';

interface OthersScreenProps {
  hasBankAccount: boolean;
  onConnectBank: () => void;
}

interface ExpandedCategory {
  name: string;
  type: 'INCOME' | 'EXPENSE';
}

const OthersScreen: React.FC<OthersScreenProps> = ({ hasBankAccount, onConnectBank }) => {
  const { fetchOffBudget, fetchOffBudgetTransactions } = useAuth();
  const { checkedAccountIds } = useAccountFilter();
  const [incomeCategories, setIncomeCategories] = useState<any[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<any[]>([]);
  const [totalIn, setTotalIn] = useState<number>(0);
  const [totalOut, setTotalOut] = useState<number>(0);
  const [net, setNet] = useState<number>(0);
  const [periodLabel, setPeriodLabel] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedCategory, setExpandedCategory] = useState<ExpandedCategory | null>(null);
  const [categoryTransactions, setCategoryTransactions] = useState<{ [key: string]: any[] }>({});
  const [loadingTransactions, setLoadingTransactions] = useState<string | null>(null);
  const [editModalState, setEditModalState] = useState<TransactionEditState>({
    isOpen: false,
    transaction: null,
    transactionType: 'EXPENSE',
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const incomeColors = [
    'bg-emerald-500',
    'bg-green-500',
    'bg-teal-500',
    'bg-lime-500',
    'bg-emerald-400',
    'bg-green-400',
    'bg-teal-400',
    'bg-lime-400',
  ];

  const expenseColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-rose-500',
    'bg-amber-500',
    'bg-red-400',
    'bg-orange-400',
    'bg-rose-400',
    'bg-amber-400',
  ];

  const accountIdsKey = useMemo(() => Array.from(checkedAccountIds).sort().join(','), [checkedAccountIds]);

  const getAccountIds = () => accountIdsKey ? accountIdsKey.split(',') : [];

  const makeCacheKey = (type: 'INCOME' | 'EXPENSE', name: string) => `${type}:${name}`;

  const loadOffBudget = React.useCallback(async (showLoading = true, clearCache = true) => {
    const accountIds = getAccountIds();

    if (accountIds.length === 0) {
      setIncomeCategories([]);
      setExpenseCategories([]);
      setTotalIn(0);
      setTotalOut(0);
      setNet(0);
      setPeriodLabel('No accounts selected');
      setCategoryTransactions({});
      setIsLoading(false);
      return;
    }

    try {
      if (showLoading) setIsLoading(true);

      const data = await fetchOffBudget(accountIds);

      const incomeCats = (data.income_categories || []).map((cat: any, index: number) => ({
        ...cat,
        color: incomeColors[index % incomeColors.length],
      }));

      const expenseCats = (data.expense_categories || []).map((cat: any, index: number) => ({
        ...cat,
        color: expenseColors[index % expenseColors.length],
      }));

      setIncomeCategories(incomeCats);
      setExpenseCategories(expenseCats);
      setTotalIn(data.total_in);
      setTotalOut(data.total_out);
      setNet(data.net);

      if (data.period_start && data.period_end) {
        const start = new Date(data.period_start + 'T00:00:00');
        const end = new Date(data.period_end + 'T00:00:00');
        setPeriodLabel(`${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`);
      }

      if (clearCache) {
        setCategoryTransactions({});
      }
    } catch (error) {
      console.error('Failed to load off-budget data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [accountIdsKey, fetchOffBudget]);

  React.useEffect(() => {
    if (!hasBankAccount) {
      setIsLoading(false);
      return;
    }

    loadOffBudget();

    const interval = setInterval(() => {
      loadOffBudget(false, false);
    }, 30000);

    return () => clearInterval(interval);
  }, [hasBankAccount, loadOffBudget]);

  const handleToggleCategory = async (categoryName: string, transactionType: 'INCOME' | 'EXPENSE') => {
    const isCurrentlyExpanded = expandedCategory?.name === categoryName && expandedCategory?.type === transactionType;

    if (isCurrentlyExpanded) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory({ name: categoryName, type: transactionType });

      const cacheKey = makeCacheKey(transactionType, categoryName);
      if (!categoryTransactions[cacheKey]) {
        try {
          setLoadingTransactions(cacheKey);
          const accountIds = accountIdsKey ? accountIdsKey.split(',') : [];
          const data = await fetchOffBudgetTransactions(categoryName, transactionType, accountIds);
          setCategoryTransactions(prev => ({
            ...prev,
            [cacheKey]: data.transactions
          }));
        } catch (error) {
          console.error(`Failed to load transactions for ${categoryName}:`, error);
        } finally {
          setLoadingTransactions(null);
        }
      }
    }
  };

  const handleTransactionClick = (txn: any, transactionType: 'INCOME' | 'EXPENSE', e: React.MouseEvent) => {
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
      transactionType,
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

    await loadOffBudget(false, true);

    if (expandedCategory) {
      const accountIds = getAccountIds();
      const cacheKey = makeCacheKey(expandedCategory.type, expandedCategory.name);
      fetchOffBudgetTransactions(expandedCategory.name, expandedCategory.type, accountIds)
        .then(data => {
          setCategoryTransactions(prev => ({
            ...prev,
            [cacheKey]: data.transactions
          }));
        })
        .catch(err => console.error('Failed to refresh transactions:', err));
    }
  };

  const renderCategoryCard = (category: any, transactionType: 'INCOME' | 'EXPENSE') => {
    const cacheKey = makeCacheKey(transactionType, category.category);
    const isExpanded = expandedCategory?.name === category.category && expandedCategory?.type === transactionType;
    const transactions = categoryTransactions[cacheKey] || [];
    const isLoadingTxn = loadingTransactions === cacheKey;
    const amountColor = transactionType === 'INCOME' ? 'text-green-600' : 'text-red-500';

    return (
      <div key={cacheKey} className="bg-white rounded-2xl shadow-sm p-4">
        <button
          onClick={() => handleToggleCategory(category.category, transactionType)}
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
                <div className={`font-bold ${amountColor}`}>
                  ${formatCurrency(category.total)}
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
                    onClick={(e) => handleTransactionClick(txn, transactionType, e)}
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
                      <div className={`text-sm font-semibold ${txn.status === 'pending' ? 'text-amber-600' : amountColor}`}>
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
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 text-slate-500">Loading off-budget data...</div>
      </div>
    );
  }

  if (!hasBankAccount) {
    return (
      <div className="space-y-4">
        <div className="px-1">
          <div className="flex justify-between items-center">
            <h2 className="text-slate-800 font-bold text-xl">Others</h2>
            <span className="flex items-center bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1 rounded-full">
              Off-Budget
            </span>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <p className="text-slate-500">Track off-budget transactions</p>
          <p className="text-sm text-slate-400 mt-2">Connect your bank to see transfers, credit card payments, and other off-budget activity.</p>
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
          <h2 className="text-slate-800 font-bold text-xl">Others</h2>
          <span className="flex items-center bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1 rounded-full">
            Off-Budget
          </span>
        </div>
      </div>

      {/* Net Balance Panel */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="text-slate-600 font-medium mb-2">Net Balance</h3>
        <div className={`text-4xl font-bold ${net >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {net < 0 ? '-' : ''}${formatCurrency(Math.abs(net))}
        </div>
        {periodLabel && <p className="text-sm text-slate-500 mt-1">{periodLabel}</p>}
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-500">Total In:</span>
            <span className="font-semibold text-green-600">${formatCurrency(totalIn)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Total Out:</span>
            <span className="font-semibold text-red-500">${formatCurrency(totalOut)}</span>
          </div>
        </div>
      </div>

      {/* Income Categories Section */}
      {incomeCategories.length > 0 && (
        <>
          <div className="px-1">
            <h3 className="text-slate-700 font-semibold text-sm uppercase tracking-wide">
              Income ({incomeCategories.length})
            </h3>
          </div>
          {incomeCategories.map((category) => renderCategoryCard(category, 'INCOME'))}
        </>
      )}

      {/* Expense Categories Section */}
      {expenseCategories.length > 0 && (
        <>
          <div className="px-1">
            <h3 className="text-slate-700 font-semibold text-sm uppercase tracking-wide">
              Expenses ({expenseCategories.length})
            </h3>
          </div>
          {expenseCategories.map((category) => renderCategoryCard(category, 'EXPENSE'))}
        </>
      )}

      {/* Empty state */}
      {incomeCategories.length === 0 && expenseCategories.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <p className="text-slate-500">No off-budget data available</p>
          <p className="text-sm text-slate-400 mt-2">
            Transfers, credit card payments, and other off-budget transactions will appear here.
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

export default OthersScreen;
