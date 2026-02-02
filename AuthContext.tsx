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
    status?: 'pending' | 'posted';
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

interface GrowWeek {
    week_num: number;
    week_start: string;
    week_end: string;
    week_label: string;
    week_range: string;
    unplanned_spent: number;
    grow: number;
}

interface BudgetBreakdown {
    avg_income: number;
    avg_fixed: number;
    avg_monthlies: number;
    monthly_goal: number;
    available_budget: number;
    weekly_budget: number;
    num_weeks: number;
}

interface GrowData {
    weeks: GrowWeek[];
    budget_breakdown: BudgetBreakdown;
    period: PeriodInfo;
}

interface MonthlyTotal {
    month: string;
    total: number;
}

interface ThreeMonthAverageData {
    category_group: string;
    months: MonthlyTotal[];
    average: number;
}

interface SpecificCategoryAverageData {
    category_name: string;
    category_group: string;
    average: number;
    months: MonthlyTotal[];
    transaction_count: number;
}

interface AvailableCategory {
    id: number;
    plaid_detailed: string;
    cashgrow_category: string;
    cashgrow_group: string;
}

interface AvailableCategoriesData {
    transaction_id: string;
    transaction_type: 'INCOME' | 'EXPENSE';
    current_category_id: number | null;
    categories: AvailableCategory[];
}

interface MonthlyGoalData {
    monthly_goal: number;
}

interface AuthContextType {
    isLoggedIn: boolean;
    isAuthLoading: boolean;
    token: string | null;
    user: any;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    fetchUserProfile: () => Promise<void>;
    fetchBudgetSummary: (periodDays?: number, accountIds?: string[]) => Promise<BudgetSummary>;
    fetchMonthlies: (periodDays?: number, accountIds?: string[]) => Promise<MonthliesData>;
    fetchFixed: (periodDays?: number, accountIds?: string[]) => Promise<MonthliesData>;
    fetchFixedTransactions: (category: string, periodDays?: number, accountIds?: string[]) => Promise<CategoryTransactionsData>;
    fetchMonthliesTransactions: (category: string, periodDays?: number, accountIds?: string[]) => Promise<CategoryTransactionsData>;
    fetchIncome: (accountIds?: string[]) => Promise<IncomeComparisonData>;
    fetchIncomeTransactions: (category: string, accountIds?: string[]) => Promise<CategoryTransactionsData>;
    fetchUnplanned: (accountIds?: string[]) => Promise<UnplannedData>;
    fetchGrow: (accountIds?: string[]) => Promise<GrowData>;
    fetchMonthlyGoal: () => Promise<MonthlyGoalData>;
    updateMonthlyGoal: (monthlyGoal: number) => Promise<MonthlyGoalData>;
    fetchThreeMonthAverage: (categoryGroup: string, accountIds?: string[]) => Promise<ThreeMonthAverageData>;
    fetchCategoryAverage: (categoryName: string, accountIds?: string[]) => Promise<SpecificCategoryAverageData>;
    fetchAvailableCategories: (transactionId: string) => Promise<AvailableCategoriesData>;
    updateTransactionCategory: (transactionId: string, categoryId: number) => Promise<void>;
    updateTransactionRecurring: (transactionId: string, isRecurring: boolean) => Promise<void>;
    resetTransactionCategory: (transactionId: string) => Promise<void>;
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

    const fetchBudgetSummary = async (periodDays: number = 7, accountIds?: string[]): Promise<BudgetSummary> => {
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            const params: Record<string, any> = {
                period_days: periodDays
            };
            if (accountIds && accountIds.length > 0) {
                params.account_ids = accountIds.join(',');
            }
            const response = await axios.get(`${API_BASE_URL}/api/budget/summary`, {
                params: Object.keys(params).length > 0 ? params : undefined,
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

    const fetchMonthlies = async (periodDays?: number, accountIds?: string[]): Promise<MonthliesData> => {
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            const params: Record<string, any> = {};
            if (periodDays) {
                params.period_days = periodDays;
            }
            if (accountIds && accountIds.length > 0) {
                params.account_ids = accountIds.join(',');
            }
            const response = await axios.get(`${API_BASE_URL}/api/monthlies`, {
                params: Object.keys(params).length > 0 ? params : undefined,
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

    const fetchFixed = async (periodDays?: number, accountIds?: string[]): Promise<MonthliesData> => {
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            const params: Record<string, any> = {};
            if (periodDays) {
                params.period_days = periodDays;
            }
            if (accountIds && accountIds.length > 0) {
                params.account_ids = accountIds.join(',');
            }
            const response = await axios.get(`${API_BASE_URL}/api/fixed`, {
                params: Object.keys(params).length > 0 ? params : undefined,
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

    const fetchFixedTransactions = async (category: string, periodDays?: number, accountIds?: string[]): Promise<CategoryTransactionsData> => {
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            const params: Record<string, any> = { category };
            if (periodDays) {
                params.period_days = periodDays;
            }
            if (accountIds && accountIds.length > 0) {
                params.account_ids = accountIds.join(',');
            }
            const response = await axios.get(`${API_BASE_URL}/api/fixed/transactions`, {
                params,
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

    const fetchMonthliesTransactions = async (category: string, periodDays?: number, accountIds?: string[]): Promise<CategoryTransactionsData> => {
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            const params: Record<string, any> = { category };
            if (periodDays) {
                params.period_days = periodDays;
            }
            if (accountIds && accountIds.length > 0) {
                params.account_ids = accountIds.join(',');
            }
            const response = await axios.get(`${API_BASE_URL}/api/monthlies/transactions`, {
                params,
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

    const fetchIncome = async (accountIds?: string[]): Promise<IncomeComparisonData> => {
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            const params: Record<string, any> = {};
            if (accountIds && accountIds.length > 0) {
                params.account_ids = accountIds.join(',');
            }
            const response = await axios.get(`${API_BASE_URL}/income`, {
                params: Object.keys(params).length > 0 ? params : undefined,
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

    const fetchIncomeTransactions = async (category: string, accountIds?: string[]): Promise<CategoryTransactionsData> => {
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            const params: Record<string, any> = { category };
            if (accountIds && accountIds.length > 0) {
                params.account_ids = accountIds.join(',');
            }
            const response = await axios.get(`${API_BASE_URL}/income/transactions`, {
                params,
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

    const fetchUnplanned = async (accountIds?: string[]): Promise<UnplannedData> => {
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            const params: Record<string, any> = {};
            if (accountIds && accountIds.length > 0) {
                params.account_ids = accountIds.join(',');
            }
            const response = await axios.get(`${API_BASE_URL}/unplanned`, {
                params: Object.keys(params).length > 0 ? params : undefined,
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

    const fetchGrow = async (accountIds?: string[]): Promise<GrowData> => {
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            const params: Record<string, any> = {};
            if (accountIds && accountIds.length > 0) {
                params.account_ids = accountIds.join(',');
            }
            const response = await axios.get(`${API_BASE_URL}/api/budget/grow`, {
                params: Object.keys(params).length > 0 ? params : undefined,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch grow data:', error);
            throw error;
        }
    };

    const fetchMonthlyGoal = async (): Promise<MonthlyGoalData> => {
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/api/budget/goal`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch monthly goal:', error);
            throw error;
        }
    };

    const updateMonthlyGoal = async (monthlyGoal: number): Promise<MonthlyGoalData> => {
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            const response = await axios.put(`${API_BASE_URL}/api/budget/goal`,
                { monthly_goal: monthlyGoal },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error('Failed to update monthly goal:', error);
            throw error;
        }
    };

    const fetchThreeMonthAverage = async (categoryGroup: string, accountIds?: string[]): Promise<ThreeMonthAverageData> => {
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            const params: Record<string, any> = {};
            if (accountIds && accountIds.length > 0) {
                params.account_ids = accountIds.join(',');
            }
            const response = await axios.get(`${API_BASE_URL}/api/average/${encodeURIComponent(categoryGroup)}`, {
                params: Object.keys(params).length > 0 ? params : undefined,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch 3-month average for ${categoryGroup}:`, error);
            throw error;
        }
    };

    const fetchCategoryAverage = async (categoryName: string, accountIds?: string[]): Promise<SpecificCategoryAverageData> => {
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            const params: Record<string, any> = { category: categoryName };
            if (accountIds && accountIds.length > 0) {
                params.account_ids = accountIds.join(',');
            }
            const response = await axios.get(`${API_BASE_URL}/finances/average/category`, {
                params,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch 3-month average for category ${categoryName}:`, error);
            throw error;
        }
    };

    const fetchAvailableCategories = async (transactionId: string): Promise<AvailableCategoriesData> => {
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/transactions/${transactionId}/available-categories`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch available categories for transaction ${transactionId}:`, error);
            throw error;
        }
    };

    const updateTransactionCategory = async (transactionId: string, categoryId: number): Promise<void> => {
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            await axios.patch(`${API_BASE_URL}/transactions/${transactionId}/category`,
                { category_id: categoryId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (error) {
            console.error(`Failed to update category for transaction ${transactionId}:`, error);
            throw error;
        }
    };

    const updateTransactionRecurring = async (transactionId: string, isRecurring: boolean): Promise<void> => {
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            await axios.patch(`${API_BASE_URL}/transactions/${transactionId}/recurring`,
                { is_recurring: isRecurring },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (error) {
            console.error(`Failed to update recurring status for transaction ${transactionId}:`, error);
            throw error;
        }
    };

    const resetTransactionCategory = async (transactionId: string): Promise<void> => {
        if (!token) {
            throw new Error('No authentication token available');
        }

        try {
            await axios.delete(`${API_BASE_URL}/transactions/${transactionId}/category`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (error) {
            console.error(`Failed to reset category for transaction ${transactionId}:`, error);
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
        <AuthContext.Provider value={{ isLoggedIn, isAuthLoading, token, user, login, logout, fetchUserProfile, fetchBudgetSummary, fetchMonthlies, fetchFixed, fetchFixedTransactions, fetchMonthliesTransactions, fetchIncome, fetchIncomeTransactions, fetchUnplanned, fetchGrow, fetchMonthlyGoal, updateMonthlyGoal, fetchThreeMonthAverage, fetchCategoryAverage, fetchAvailableCategories, updateTransactionCategory, updateTransactionRecurring, resetTransactionCategory }}>
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