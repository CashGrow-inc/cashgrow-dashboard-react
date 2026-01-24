import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { ChevronDownIcon } from './Icons';
import { formatCurrency, ProgressBar } from './shared';

interface FixedScreenProps {
  hasBankAccount: boolean;
  onConnectBank: () => void;
}

const FixedScreen: React.FC<FixedScreenProps> = ({ hasBankAccount, onConnectBank }) => {
  const { fetchFixed, fetchFixedTransactions } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [categoryTransactions, setCategoryTransactions] = useState<{ [key: string]: any[] }>({});
  const [loadingTransactions, setLoadingTransactions] = useState<string | null>(null);

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

  React.useEffect(() => {
    // Don't fetch if user hasn't connected a bank
    if (!hasBankAccount) {
      setIsLoading(false);
      return;
    }

    const loadFixed = async (showLoading = true) => {
      try {
        if (showLoading) setIsLoading(true);
        console.log('Fetching fixed costs...');
        const data = await fetchFixed();
        console.log('Fixed costs data received:', data);

        const categoriesWithColors = data.categories.map((cat, index) => ({
          ...cat,
          color: categoryColors[index % categoryColors.length],
          budget: cat.spent * 1.5
        }));

        setCategories(categoriesWithColors);
        setTotalSpent(data.total_spent);
        // Clear cached transactions so they get refreshed on next expand
        setCategoryTransactions({});
      } catch (error) {
        console.error('Failed to load fixed costs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFixed();

    // Poll for new data every 30 seconds
    const interval = setInterval(() => {
      loadFixed(false); // Don't show loading spinner on background refresh
    }, 30000);

    return () => clearInterval(interval);
  }, [hasBankAccount]);

  const handleToggleCategory = async (categoryName: string) => {
    if (expandedCategory === categoryName) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryName);

      if (!categoryTransactions[categoryName]) {
        try {
          setLoadingTransactions(categoryName);
          const data = await fetchFixedTransactions(categoryName);
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
                        <div key={txnIndex} className="flex justify-between items-center py-2 px-3 bg-white rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-700">{txn.description}</span>
                            {formattedDate && <span className="text-xs text-slate-500">{formattedDate}</span>}
                          </div>
                          <span className="text-sm font-semibold text-slate-800">${formatCurrency(txn.amount)}</span>
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
    </div>
  );
};

export default FixedScreen;
