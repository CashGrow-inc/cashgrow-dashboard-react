import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import { TransactionWithId, AvailableCategory } from '../types';
import { formatCurrency } from './shared';

interface TransactionEditModalProps {
  isOpen: boolean;
  transaction: TransactionWithId | null;
  transactionType: 'INCOME' | 'EXPENSE';
  onClose: () => void;
  onSuccess: () => void;
}

const TransactionEditModal: React.FC<TransactionEditModalProps> = ({
  isOpen,
  transaction,
  transactionType,
  onClose,
  onSuccess,
}) => {
  const { fetchAvailableCategories, updateTransactionCategory, updateTransactionRecurring, resetTransactionCategory } = useAuth();

  const [categories, setCategories] = useState<AvailableCategory[]>([]);
  const [currentCategoryId, setCurrentCategoryId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [originalIsRecurring, setOriginalIsRecurring] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load available categories when modal opens
  useEffect(() => {
    if (isOpen && transaction) {
      loadCategories();
      setIsRecurring(transaction.is_recurring || false);
      setOriginalIsRecurring(transaction.is_recurring || false);
    }
  }, [isOpen, transaction]);

  const loadCategories = async () => {
    if (!transaction) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchAvailableCategories(transaction.id);
      setCategories(data.categories);
      setCurrentCategoryId(data.current_category_id);
      setSelectedCategoryId(data.current_category_id);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Failed to load categories. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSave = async () => {
    if (!transaction) return;

    setIsSaving(true);
    setError(null);

    try {
      // Update category if changed
      if (selectedCategoryId !== currentCategoryId && selectedCategoryId !== null) {
        await updateTransactionCategory(transaction.id, selectedCategoryId);
      }

      // Update recurring status if changed (income only)
      if (transactionType === 'INCOME' && isRecurring !== originalIsRecurring) {
        await updateTransactionRecurring(transaction.id, isRecurring);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to save changes:', err);
      setError('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!transaction) return;

    setIsSaving(true);
    setError(null);

    try {
      await resetTransactionCategory(transaction.id);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to reset category:', err);
      setError('Failed to reset category. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Group categories by cashgrow_group
  const groupedCategories = categories.reduce((acc, cat) => {
    const group = cat.cashgrow_group;
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(cat);
    return acc;
  }, {} as Record<string, AvailableCategory[]>);

  const hasChanges = selectedCategoryId !== currentCategoryId ||
    (transactionType === 'INCOME' && isRecurring !== originalIsRecurring);

  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      {/* Animation keyframes */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(100%); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @media (min-width: 640px) {
          .modal-content {
            animation: scaleIn 0.2s ease-out;
          }
        }
        @media (max-width: 639px) {
          .modal-content {
            animation: slideUp 0.3s ease-out;
          }
        }
      `}</style>

      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal content */}
      <div className="modal-content relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-900">Edit Transaction</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Transaction summary */}
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="font-medium text-slate-800 truncate">{transaction.description}</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm text-slate-500">{formatDate(transaction.date)}</span>
              <span className={`font-bold ${transactionType === 'INCOME' ? 'text-green-600' : 'text-slate-800'}`}>
                ${formatCurrency(transaction.amount)}
              </span>
            </div>
            {transaction.status === 'pending' && (
              <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-amber-200 text-amber-800 rounded font-medium">
                Pending
              </span>
            )}
          </div>
        </div>

        {/* Body - scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Category selection */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Select Category</h3>
                <div className="space-y-4">
                  {Object.entries(groupedCategories).map(([group, cats]) => (
                    <div key={group}>
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                        {group.replace(/_/g, ' ')}
                      </div>
                      <div className="space-y-1">
                        {cats.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => setSelectedCategoryId(cat.id)}
                            className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center justify-between ${
                              selectedCategoryId === cat.id
                                ? 'bg-blue-100 border-2 border-blue-500'
                                : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent'
                            }`}
                          >
                            <span className="text-sm text-slate-800">{cat.cashgrow_category}</span>
                            {selectedCategoryId === cat.id && (
                              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recurring toggle (income only) */}
              {transactionType === 'INCOME' && (
                <div className="mb-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700">Recurring Income</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Mark this as a recurring income source</p>
                    </div>
                    <button
                      onClick={() => setIsRecurring(!isRecurring)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        isRecurring ? 'bg-green-500' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${
                          isRecurring ? 'translate-x-6' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 space-y-3">
          {/* Reset button */}
          <button
            onClick={handleReset}
            disabled={isSaving || isLoading}
            className="w-full px-4 py-2.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          >
            Reset to Original Category
          </button>

          {/* Action buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || isLoading || !hasChanges}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionEditModal;
