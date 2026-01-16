import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { API_BASE_URL } from './config/api';

interface BudgetSummary {
    budget: number;  // Total income - total expenses
    total_income: number;
    total_expenses: number;
    transaction_count: number;
    period_start?: string;
    period_end?: string;
}

interface CategoryExpense {
    category: string;
    category_group: string;
    spent: number;
    transaction_count: number;
}

interface MonthliesData {
    categories: CategoryExpense[];
    total_spent: number;
    period_start: string;
    period_end: string;
}

interface TransactionDetail {
    description: string;
    amount: number;
    date: string;
}

interface CategoryTransactionsData {
    category: string;
    transactions: TransactionDetail[];
    total_count: number;
}

interface CategoryComparison {
    category: string;
    category_group: string;
    prior_month_spent?: number;
    current_month_spent?: number;
    prior_month_earned?: number;
    current_month_earned?: number;
    transaction_count: number;
    change_amount: number;
    change_percent: number;
}

interface PeriodInfo {
    start: string;
    end: string;
    label: string;
}

interface IncomeComparisonData {
    categories: CategoryComparison[];
    prior_month_total: number;
    current_month_total: number;
    prior_month_period: PeriodInfo;
    current_month_period: PeriodInfo;
}

interface UnplannedTransaction {
    id: string;
    description: string;
    amount: number;
    date: string;
    category: string;
}

interface UnplannedWeek {
    week_start: string;
    week_end: string;
    week_label: string;
    week_range: string;
    transactions: UnplannedTransaction[];
    total: number;
}

interface UnplannedData {
    weeks: UnplannedWeek[];
    total_unplanned: number;
    period: PeriodInfo;
}

interface AuthContextType {
    isLoggedIn: boolean;
    isAuthLoading: boolean;
    token: string | null;
    user: any;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    fetchUserProfile: () => Promise<void>;
    fetchBudgetSummary: (periodDays?: number, monthlyGoal?: number) => Promise<BudgetSummary>;
    fetchMonthlies: (periodDays?: number) => Promise<MonthliesData>;
    fetchFixed: (periodDays?: number) => Promise<MonthliesData>;
    fetchFixedTransactions: (category: string, periodDays?: number) => Promise<CategoryTransactionsData>;
    fetchMonthliesTransactions: (category: string, periodDays?: number) => Promise<CategoryTransactionsData>;
    fetchIncome: () => Promise<IncomeComparisonData>;
    fetchIncomeTransactions: (category: string) => Promise<CategoryTransactionsData>;
    fetchUnplanned: () => Promise<UnplannedData>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
    // Initialize isLoggedIn based on whether token exists to prevent race condition
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('authToken'));
    // Initialize user from localStorage if available
    const [user, setUser] = useState<any>(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    // Loading state for initial auth check
    const [isAuthLoading, setIsAuthLoading] = useState(!!localStorage.getItem('authToken'));

    const login = async (email: string, password: string) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
                email,
                password,
            });

            const { token: newToken } = response.data;
            localStorage.setItem('authToken', newToken);
            setToken(newToken);
            setIsLoggedIn(true);
            await fetchUserProfile();
        } catch (error) {
            throw new Error('Login failed');
        }
    };

    const fetchUserProfile = async () => {
        if (!token) {
            setIsAuthLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('User profile response:', response.data);
            setUser(response.data);
            // Persist user data to localStorage
            localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error: any) {
            console.error('Failed to fetch user profile:', error);
            // If token is invalid/expired (401), log the user out
            if (error?.response?.status === 401) {
                console.log('Token expired or invalid, logging out');
                logout();
            }
        } finally {
            setIsAuthLoading(false);
        }
    };

    const fetchBudgetSummary = async (periodDays: number = 7, monthlyGoal: number = 700): Promise<BudgetSummary> => {
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/api/budget/summary`, {
                params: {
                    period_days: periodDays,
                    monthly_goal: monthlyGoal
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch budget summary:', error);
            throw error;
        }
    };

    const fetchMonthlies = async (periodDays?: number): Promise<MonthliesData> => {
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/api/monthlies`, {
                params: periodDays ? { period_days: periodDays } : undefined,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch monthlies:', error);
            throw error;
        }
    };

    const fetchFixed = async (periodDays?: number): Promise<MonthliesData> => {
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/api/fixed`, {
                params: periodDays ? { period_days: periodDays } : undefined,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch fixed costs:', error);
            throw error;
        }
    };

    const fetchFixedTransactions = async (category: string, periodDays?: number): Promise<CategoryTransactionsData> => {
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/api/fixed/transactions/${encodeURIComponent(category)}`, {
                params: periodDays ? { period_days: periodDays } : undefined,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch transactions for ${category}:`, error);
            throw error;
        }
    };

    const fetchMonthliesTransactions = async (category: string, periodDays?: number): Promise<CategoryTransactionsData> => {
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/api/monthlies/transactions/${encodeURIComponent(category)}`, {
                params: periodDays ? { period_days: periodDays } : undefined,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch monthlies transactions for ${category}:`, error);
            throw error;
        }
    };

    const fetchIncome = async (): Promise<IncomeComparisonData> => {
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/income`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch income:', error);
            throw error;
        }
    };

    const fetchIncomeTransactions = async (category: string): Promise<CategoryTransactionsData> => {
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/income/transactions/${encodeURIComponent(category)}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch income transactions for ${category}:`, error);
            throw error;
        }
    };

    const fetchUnplanned = async (): Promise<UnplannedData> => {
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/unplanned`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch unplanned expenses:', error);
            throw error;
        }
    };

    const logout = () => {
        setIsLoggedIn(false);
        setToken(null);
        setUser(null);
        setIsAuthLoading(false);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    };

    React.useEffect(() => {
        if (token) {
            setIsLoggedIn(true);
            fetchUserProfile();
        }
    }, [token]);

    return (
        <AuthContext.Provider value={{ isLoggedIn, isAuthLoading, token, user, login, logout, fetchUserProfile, fetchBudgetSummary, fetchMonthlies, fetchFixed, fetchFixedTransactions, fetchMonthliesTransactions, fetchIncome, fetchIncomeTransactions, fetchUnplanned }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};