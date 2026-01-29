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

const STORAGE_KEY_PREFIX = 'accountFilter_checkedIds_';

export const AccountFilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isLoggedIn, user } = useAuth();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [checkedAccountIds, setCheckedAccountIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Get user-specific storage key
  const getStorageKey = useCallback(() => {
    const userId = user?.id;
    return userId ? `${STORAGE_KEY_PREFIX}${userId}` : null;
  }, [user]);

  // Load checked IDs from localStorage
  // Returns null if no key exists (never initialized)
  // Returns Set (possibly empty) if key exists
  const loadFromStorage = useCallback((): Set<string> | null => {
    const storageKey = getStorageKey();
    if (!storageKey) return null;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored === null) {
        return null; // Key doesn't exist - never initialized
      }
      const ids = JSON.parse(stored);
      if (Array.isArray(ids)) {
        return new Set(ids); // Could be empty Set if user unchecked all
      }
    } catch (e) {
      console.error('Failed to load account filter from storage:', e);
    }
    return null;
  }, [getStorageKey]);

  // Save checked IDs to localStorage
  const saveToStorage = useCallback((ids: Set<string>) => {
    const storageKey = getStorageKey();
    if (!storageKey) return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(Array.from(ids)));
    } catch (e) {
      console.error('Failed to save account filter to storage:', e);
    }
  }, [getStorageKey]);

  // Fetch accounts from API
  const refreshAccounts = useCallback(async () => {
    if (!token || !isLoggedIn || !user?.id) {
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

      if (storedIds === null) {
        // First time for this user - no localStorage key exists
        // Initialize with all accounts checked
        setCheckedAccountIds(currentAccountIds);
        saveToStorage(currentAccountIds);
      } else {
        // User has previously set preferences (even if empty)
        // Restore from storage, keeping only IDs that still exist
        const validStoredIds = new Set(
          Array.from(storedIds).filter(id => currentAccountIds.has(id))
        );

        setCheckedAccountIds(validStoredIds);
        // Only save if some IDs were removed (account was deleted)
        if (validStoredIds.size !== storedIds.size) {
          saveToStorage(validStoredIds);
        }
      }
    } catch (error) {
      console.error('Error fetching accounts for filter:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token, isLoggedIn, user?.id, loadFromStorage, saveToStorage]);

  // Fetch accounts on mount and when auth changes
  useEffect(() => {
    if (isLoggedIn && token && user?.id) {
      refreshAccounts();
    } else {
      setAccounts([]);
      setCheckedAccountIds(new Set());
      setIsLoading(false);
    }
  }, [isLoggedIn, token, user?.id]);

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
