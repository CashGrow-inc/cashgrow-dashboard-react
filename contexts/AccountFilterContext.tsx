import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config/api';
import { useAuth } from '../AuthContext';

export interface BankAccount {
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

interface AccountFilterContextType {
  accounts: BankAccount[];
  checkedAccountIds: Set<string>;
  isLoading: boolean;
  toggleAccount: (id: string) => void;
  setAllChecked: (checked: boolean) => void;
  refreshAccounts: () => Promise<void>;
}

const AccountFilterContext = createContext<AccountFilterContextType | null>(null);

const STORAGE_KEY = 'accountFilter_checkedIds';

export const AccountFilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isLoggedIn } = useAuth();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [checkedAccountIds, setCheckedAccountIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Load checked IDs from localStorage
  const loadFromStorage = useCallback((): Set<string> => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const ids = JSON.parse(stored);
        if (Array.isArray(ids)) {
          return new Set(ids);
        }
      }
    } catch (e) {
      console.error('Failed to load account filter from storage:', e);
    }
    return new Set();
  }, []);

  // Save checked IDs to localStorage
  const saveToStorage = useCallback((ids: Set<string>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
    } catch (e) {
      console.error('Failed to save account filter to storage:', e);
    }
  }, []);

  // Fetch accounts from API
  const refreshAccounts = useCallback(async () => {
    if (!token || !isLoggedIn) {
      setAccounts([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
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
      const fetchedAccounts: BankAccount[] = data.accounts || [];
      setAccounts(fetchedAccounts);

      // Initialize checked state
      const storedIds = loadFromStorage();
      const currentAccountIds = new Set(fetchedAccounts.map(acc => acc.id));

      if (!hasInitialized || storedIds.size === 0) {
        // First load or no stored selection: check all accounts
        setCheckedAccountIds(currentAccountIds);
        saveToStorage(currentAccountIds);
      } else {
        // Restore from storage, but only keep IDs that still exist
        // Also add any new accounts as checked by default
        const validStoredIds = new Set(
          Array.from(storedIds).filter(id => currentAccountIds.has(id))
        );

        // Add any new accounts that weren't in storage
        fetchedAccounts.forEach(acc => {
          if (!storedIds.has(acc.id)) {
            validStoredIds.add(acc.id);
          }
        });

        setCheckedAccountIds(validStoredIds);
        saveToStorage(validStoredIds);
      }

      setHasInitialized(true);
    } catch (error) {
      console.error('Error fetching accounts for filter:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token, isLoggedIn, loadFromStorage, saveToStorage, hasInitialized]);

  // Fetch accounts on mount and when auth changes
  useEffect(() => {
    if (isLoggedIn && token) {
      refreshAccounts();
    } else {
      setAccounts([]);
      setCheckedAccountIds(new Set());
      setIsLoading(false);
      setHasInitialized(false);
    }
  }, [isLoggedIn, token]);

  // Toggle single account
  const toggleAccount = useCallback((id: string) => {
    setCheckedAccountIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      saveToStorage(newSet);
      return newSet;
    });
  }, [saveToStorage]);

  // Check/uncheck all accounts
  const setAllChecked = useCallback((checked: boolean) => {
    if (checked) {
      const allIds = new Set(accounts.map(acc => acc.id));
      setCheckedAccountIds(allIds);
      saveToStorage(allIds);
    } else {
      setCheckedAccountIds(new Set());
      saveToStorage(new Set());
    }
  }, [accounts, saveToStorage]);

  return (
    <AccountFilterContext.Provider
      value={{
        accounts,
        checkedAccountIds,
        isLoading,
        toggleAccount,
        setAllChecked,
        refreshAccounts,
      }}
    >
      {children}
    </AccountFilterContext.Provider>
  );
};

export const useAccountFilter = () => {
  const context = useContext(AccountFilterContext);
  if (!context) {
    throw new Error('useAccountFilter must be used within an AccountFilterProvider');
  }
  return context;
};
