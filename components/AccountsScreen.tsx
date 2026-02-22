import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useAccountFilter, BankAccount } from '../contexts/AccountFilterContext';
import { API_BASE_URL } from '../config/api';

interface AccountsScreenProps {
  onBack: () => void;
}

const AccountsScreen: React.FC<AccountsScreenProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<{ id: string; name: string } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { token } = useAuth();
  const { accounts, checkedAccountIds, toggleAccount, setAllChecked, refreshAccounts, isLoading: filterLoading } = useAccountFilter();

  // Fetch accounts on component mount
  useEffect(() => {
    const loadAccounts = async () => {
      setLoading(true);
      setError(null);
      try {
        await refreshAccounts();
      } catch (err) {
        console.error('Error fetching accounts:', err);
        setError('Failed to load accounts. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadAccounts();
  }, []);

  const handleDeleteClick = (accountId: string, accountName: string) => {
    setAccountToDelete({ id: accountId, name: accountName });
  };

  const handleConfirmDelete = async () => {
    if (!accountToDelete) return;

    try {
      setDeletingAccountId(accountToDelete.id);
      setAccountToDelete(null);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/plaid/accounts/${accountToDelete.id}`, {
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

      // Refresh accounts to update the list and filter state
      await refreshAccounts();

      // Show success message
      setSuccessMessage(data.message || 'Account deleted successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Error deleting account:', err);
      setError('Failed to delete account. Please try again.');
    } finally {
      setDeletingAccountId(null);
    }
  };

  const handleCancelDelete = () => {
    setAccountToDelete(null);
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

  const isAllChecked = accounts.length > 0 && checkedAccountIds.size === accounts.length;
  const checkedCount = checkedAccountIds.size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 p-4 pb-20">
    <div className="max-w-md mx-auto">
      {/* Animation keyframes */}
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

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

      {/* Delete Confirmation Modal */}
      {accountToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            style={{ animation: 'scaleIn 0.2s ease-out' }}
          >
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Delete Account</h3>
            <p className="text-slate-600 text-center mb-6">
              Are you sure you want to delete <span className="font-semibold">"{accountToDelete.name}"</span>?
              This will permanently remove all transactions associated with this account.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="max-w-md mx-auto">
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

        {/* Filter Status Indicator */}
        {accounts.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="text-blue-800 font-medium">
                  Showing transactions from {checkedCount} of {accounts.length} account{accounts.length !== 1 ? 's' : ''}
                </span>
              </div>
              {checkedCount < accounts.length && (
                <button
                  onClick={() => setAllChecked(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Show all
                </button>
              )}
            </div>
            <p className="text-sm text-blue-600 mt-1">
              Check accounts below to include their transactions in your dashboard.
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {(loading || filterLoading) ? (
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
                  checked={isAllChecked}
                  onChange={() => setAllChecked(!isAllChecked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label className="ml-3 text-slate-700 font-medium">
                  {isAllChecked ? 'Uncheck All' : 'Select All'}
                </label>
              </div>
            )}

            {/* Accounts List */}
            <div className="space-y-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className={`bg-white rounded-xl shadow-sm p-6 transition-all ${
                    checkedAccountIds.has(account.id) ? 'ring-2 ring-blue-500' : 'opacity-75'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={checkedAccountIds.has(account.id)}
                      onChange={() => toggleAccount(account.id)}
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
                          onClick={() => handleDeleteClick(account.id, account.name)}
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
    </div>
  );
};

export default AccountsScreen;
