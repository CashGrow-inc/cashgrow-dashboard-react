import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../AuthContext';
import { useAccountFilter } from '../contexts/AccountFilterContext';
import { POLL_MS } from '../queryClient';

/**
 * Every server-derived financial query hangs off this prefix, so a single
 * `invalidateFinance()` after a write busts all of them at once — the client
 * mirror of the backend's `invalidate_user()`.
 */
export const FINANCE_KEY = 'finance';

/**
 * The checked-account filter, in both the shapes callers need: a stable string
 * for query keys and deps, and the array the API layer takes.
 *
 * `isPending` is true while the account list is still being fetched. Until it
 * resolves the filter looks empty, which would otherwise gate every query off
 * and make a cold load flash an empty state before the real one.
 */
export function useAccountIds() {
  const { checkedAccountIds, isLoading } = useAccountFilter();
  const accountIdsKey = useMemo(
    () => Array.from(checkedAccountIds).sort().join(','),
    [checkedAccountIds]
  );
  const accountIds = useMemo(
    () => (accountIdsKey ? accountIdsKey.split(',') : []),
    [accountIdsKey]
  );
  return { accountIds, accountIdsKey, isPending: isLoading };
}

interface FinanceQueryOptions {
  /** Caller-side gate — usually `hasBankAccount`. */
  enabled: boolean;
  /** Refetch in the background every 30s while mounted. */
  poll?: boolean;
  /** Report `isLoading` even though the query is still gated off. */
  pendingAccounts?: boolean;
}

/**
 * Shared wiring for the finance queries: namespaced key, auth gate, polling.
 *
 * `queryFn` may be a fresh closure on every render — TanStack keys off
 * `queryKey`, not function identity, so the unmemoized fetchers on AuthContext
 * no longer cause refetches the way they did with the old useEffect loaders.
 */
function useFinanceQuery<T>(
  key: readonly unknown[],
  queryFn: () => Promise<T>,
  { enabled, poll, pendingAccounts }: FinanceQueryOptions
) {
  const { token } = useAuth();
  const query = useQuery({
    queryKey: [FINANCE_KEY, ...key],
    queryFn,
    enabled: !!token && enabled,
    refetchInterval: poll ? POLL_MS : false,
  });
  // A query waiting on the account list has nothing to show yet, but it isn't
  // "loaded and empty" either — keep the caller on its loading state. Cached
  // data always wins, so this never covers a screen that could already render.
  return pendingAccounts && query.data === undefined ? { ...query, isLoading: true } : query;
}

/** Drop every cached financial figure. Call after any write. */
export function useInvalidateFinance() {
  const queryClient = useQueryClient();
  return useCallback(
    () => queryClient.invalidateQueries({ queryKey: [FINANCE_KEY] }),
    [queryClient]
  );
}

// --- Screen-level summaries -------------------------------------------------
//
// Each takes `enabled` (the screen's `hasBankAccount`) and additionally gates
// on there being at least one checked account, preserving the existing rule
// that zero accounts renders the empty state without calling the API.

export function useGrowQuery(enabled: boolean) {
  const { fetchGrow } = useAuth();
  const { accountIds, accountIdsKey, isPending } = useAccountIds();
  return useFinanceQuery(
    ['grow', accountIdsKey],
    () => fetchGrow(accountIds),
    { enabled: enabled && accountIds.length > 0, poll: true, pendingAccounts: enabled && isPending }
  );
}

export function useMonthlyGoalQuery(enabled = true) {
  const { fetchMonthlyGoal } = useAuth();
  return useFinanceQuery(['monthlyGoal'], () => fetchMonthlyGoal(), { enabled });
}

export function useUnplannedQuery(enabled: boolean) {
  const { fetchUnplanned } = useAuth();
  const { accountIds, accountIdsKey, isPending } = useAccountIds();
  return useFinanceQuery(
    ['unplanned', accountIdsKey],
    () => fetchUnplanned(accountIds),
    { enabled: enabled && accountIds.length > 0, poll: true, pendingAccounts: enabled && isPending }
  );
}

export function useMonthliesQuery(enabled: boolean) {
  const { fetchMonthlies } = useAuth();
  const { accountIds, accountIdsKey, isPending } = useAccountIds();
  return useFinanceQuery(
    ['monthlies', accountIdsKey],
    () => fetchMonthlies(undefined, accountIds),
    { enabled: enabled && accountIds.length > 0, poll: true, pendingAccounts: enabled && isPending }
  );
}

export function useFixedQuery(enabled: boolean) {
  const { fetchFixed } = useAuth();
  const { accountIds, accountIdsKey, isPending } = useAccountIds();
  return useFinanceQuery(
    ['fixed', accountIdsKey],
    () => fetchFixed(undefined, accountIds),
    { enabled: enabled && accountIds.length > 0, poll: true, pendingAccounts: enabled && isPending }
  );
}

export function useIncomeQuery(enabled: boolean) {
  const { fetchIncome } = useAuth();
  const { accountIds, accountIdsKey, isPending } = useAccountIds();
  return useFinanceQuery(
    ['income', accountIdsKey],
    () => fetchIncome(accountIds),
    { enabled: enabled && accountIds.length > 0, poll: true, pendingAccounts: enabled && isPending }
  );
}

export function useOffBudgetQuery(enabled: boolean) {
  const { fetchOffBudget } = useAuth();
  const { accountIds, accountIdsKey, isPending } = useAccountIds();
  return useFinanceQuery(
    ['offBudget', accountIdsKey],
    () => fetchOffBudget(accountIds),
    { enabled: enabled && accountIds.length > 0, poll: true, pendingAccounts: enabled && isPending }
  );
}

// --- 3-month averages -------------------------------------------------------

export function useThreeMonthAverageQuery(categoryGroup: string, enabled: boolean) {
  const { fetchThreeMonthAverage } = useAuth();
  const { accountIds, accountIdsKey } = useAccountIds();
  return useFinanceQuery(
    ['average', categoryGroup, accountIdsKey],
    () => fetchThreeMonthAverage(categoryGroup, accountIds),
    { enabled: enabled && accountIds.length > 0 }
  );
}

export function useCategoryAveragesQuery(categoryGroup: string, enabled: boolean) {
  const { fetchCategoryAverages } = useAuth();
  const { accountIds, accountIdsKey } = useAccountIds();
  return useFinanceQuery(
    ['averageCategories', categoryGroup, accountIdsKey],
    () => fetchCategoryAverages(categoryGroup, accountIds),
    { enabled: enabled && accountIds.length > 0 }
  );
}

/** `category_name -> average`, for the per-row progress-bar denominators. */
export function useCategoryAverageMap(categoryGroup: string, enabled: boolean) {
  const { data } = useCategoryAveragesQuery(categoryGroup, enabled);
  return useMemo(
    () => new Map<string, number>((data?.categories ?? []).map((c) => [c.category_name, c.average])),
    [data]
  );
}

// --- Per-category drill-downs -----------------------------------------------
//
// Keyed by category, so an expanded row that was already opened re-opens with
// no request — including after switching tabs and back. `category` is null
// when nothing is expanded, which disables the query.

export function useMonthliesTransactionsQuery(category: string | null, enabled: boolean) {
  const { fetchMonthliesTransactions } = useAuth();
  const { accountIds, accountIdsKey } = useAccountIds();
  return useFinanceQuery(
    ['monthliesTransactions', category, accountIdsKey],
    () => fetchMonthliesTransactions(category as string, undefined, accountIds),
    { enabled: enabled && !!category && accountIds.length > 0 }
  );
}

export function useFixedTransactionsQuery(category: string | null, enabled: boolean) {
  const { fetchFixedTransactions } = useAuth();
  const { accountIds, accountIdsKey } = useAccountIds();
  return useFinanceQuery(
    ['fixedTransactions', category, accountIdsKey],
    () => fetchFixedTransactions(category as string, undefined, accountIds),
    { enabled: enabled && !!category && accountIds.length > 0 }
  );
}

export function useIncomeTransactionsQuery(category: string | null, enabled: boolean) {
  const { fetchIncomeTransactions } = useAuth();
  const { accountIds, accountIdsKey } = useAccountIds();
  return useFinanceQuery(
    ['incomeTransactions', category, accountIdsKey],
    () => fetchIncomeTransactions(category as string, accountIds),
    { enabled: enabled && !!category && accountIds.length > 0 }
  );
}

export function useOffBudgetTransactionsQuery(
  category: string | null,
  transactionType: 'INCOME' | 'EXPENSE',
  enabled: boolean
) {
  const { fetchOffBudgetTransactions } = useAuth();
  const { accountIds, accountIdsKey } = useAccountIds();
  return useFinanceQuery(
    ['offBudgetTransactions', transactionType, category, accountIdsKey],
    () => fetchOffBudgetTransactions(category as string, transactionType, accountIds),
    { enabled: enabled && !!category && accountIds.length > 0 }
  );
}
