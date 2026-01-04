import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config/api';

interface BankAccount {
  id: string;
  plaid_account_id: string;
  name: string;
  official_name: string | null;
  institution_name: string;
  type: string;
  subtype: string | null;
  current_balance: number;
  available_balance: number | null;
  currency_code: string;
  last_synced_at: string;
  created_at: string;
}

interface AccountsScreenProps {
  onBack: () => void;
}

const AccountsScreen: React.FC<AccountsScreenProps> = ({ onBack }) => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set());
  const { token } = useAuth();

  // Fetch accounts on component mount
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/plaid/accounts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch accounts');
      }

      const data = await response.json();
      setAccounts(data.accounts || []);
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError('Failed to load accounts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (accountId: string, accountName: string) => {
    if (!confirm(`Are you sure you want to delete "${accountName}"? This will also delete all transactions for this account.`)) {
      return;
    }

    try {
      setDeletingAccountId(accountId);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/plaid/accounts/${accountId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      const data = await response.json();
      console.log('Account deleted:', data);

      // Remove from UI
      setAccounts(accounts.filter(acc => acc.id !== accountId));
      setSelectedAccounts(prev => {
        const newSet = new Set(prev);
        newSet.delete(accountId);
        return newSet;
      });

      alert(`Account deleted successfully! ${data.transactions_deleted} transactions were also removed.`);
    } catch (err) {
      console.error('Error deleting account:', err);
      setError('Failed to delete account. Please try again.');
    } finally {
      setDeletingAccountId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedAccounts.size === 0) {
      alert('Please select accounts to delete');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedAccounts.size} account(s)? This will also delete all associated transactions.`)) {
      return;
    }

    try {
      setError(null);
      const deletePromises = Array.from(selectedAccounts).map(async (accountId) => {
        const response = await fetch(`${API_BASE_URL}/api/plaid/accounts/${accountId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to delete account ${accountId}`);
        }

        return response.json();
      });

      const results = await Promise.all(deletePromises);
      const totalTransactionsDeleted = results.reduce((sum, result) => sum + result.transactions_deleted, 0);

      // Remove deleted accounts from UI
      setAccounts(accounts.filter(acc => !selectedAccounts.has(acc.id)));
      setSelectedAccounts(new Set());

      alert(`${results.length} account(s) deleted successfully! ${totalTransactionsDeleted} transactions were also removed.`);
    } catch (err) {
      console.error('Error during bulk delete:', err);
      setError('Failed to delete some accounts. Please try again.');
    }
  };

  const toggleAccountSelection = (accountId: string) => {
    setSelectedAccounts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(accountId)) {
        newSet.delete(accountId);
      } else {
        newSet.add(accountId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedAccounts.size === accounts.length) {
      setSelectedAccounts(new Set());
    } else {
      setSelectedAccounts(new Set(accounts.map(acc => acc.id)));
    }
  };

  const formatCurrency = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getAccountTypeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'CHECKING':
        return 'bg-blue-100 text-blue-800';
      case 'SAVINGS':
        return 'bg-green-100 text-green-800';
      case 'CREDIT':
        return 'bg-purple-100 text-purple-800';
      case 'LOAN':
        return 'bg-orange-100 text-orange-800';
      case 'INVESTMENT':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 p-4 pb-20">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-slate-600 hover:text-slate-900 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Connected Accounts</h1>
          <div className="w-20"></div> {/* Spacer for center alignment */}
        </div>

        {/* Bulk Actions Bar */}
        {selectedAccounts.size > 0 && (
          <div className="bg-blue-600 text-white rounded-xl p-4 mb-4 flex items-center justify-between">
            <span className="font-medium">{selectedAccounts.size} account(s) selected</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedAccounts(new Set())}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors font-medium"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : accounts.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <p className="text-slate-600">No connected accounts found.</p>
          </div>
        ) : (
          <>
            {/* Select All Checkbox */}
            {accounts.length > 1 && (
              <div className="bg-white rounded-xl p-4 mb-4 flex items-center">
                <input
                  type="checkbox"
                  checked={selectedAccounts.size === accounts.length}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label className="ml-3 text-slate-700 font-medium">Select All</label>
              </div>
            )}

            {/* Accounts List */}
            <div className="space-y-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className={`bg-white rounded-xl shadow-sm p-6 transition-all ${
                    selectedAccounts.has(account.id) ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedAccounts.has(account.id)}
                      onChange={() => toggleAccountSelection(account.id)}
                      className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Account Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{account.name}</h3>
                          {account.official_name && account.official_name !== account.name && (
                            <p className="text-sm text-slate-500">{account.official_name}</p>
                          )}
                          <p className="text-sm text-slate-600 mt-1">{account.institution_name}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAccountTypeColor(account.type)}`}>
                          {account.type}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4 mb-4">
                        <div>
                          <p className="text-xs text-slate-500">Current Balance</p>
                          <p className="text-lg font-bold text-slate-900">
                            {formatCurrency(account.current_balance, account.currency_code)}
                          </p>
                        </div>
                        {account.available_balance !== null && (
                          <div>
                            <p className="text-xs text-slate-500">Available Balance</p>
                            <p className="text-lg font-bold text-slate-900">
                              {formatCurrency(account.available_balance, account.currency_code)}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                        <p className="text-xs text-slate-500">
                          Last synced: {formatDate(account.last_synced_at)}
                        </p>
                        <button
                          onClick={() => handleDeleteAccount(account.id, account.name)}
                          disabled={deletingAccountId === account.id}
                          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingAccountId === account.id ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Deleting...
                            </span>
                          ) : (
                            'Delete'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AccountsScreen;
