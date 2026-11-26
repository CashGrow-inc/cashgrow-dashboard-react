import { useCallback, useMemo } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { CategoryForecast, ForecastGroup, useAuth } from '../AuthContext';
import { useAccountFilter } from '../contexts/AccountFilterContext';
import { useViewMonth } from '../contexts/MonthContext';
import { FINANCE_KEY, PAST_MONTH_STALE_MS, POLL_MS } from '../queryClient';

export { FINANCE_KEY };

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

/**
 * The selected month, in the shapes callers need: `month` for the API layer
 * (undefined = current month, so no param is sent) and `monthKey` for query
 * keys. Keys use 'current' rather than the literal month so the current
 * month's cache entries don't depend on the months list having loaded.
 */
export function useMonthScope() {
  const { viewMonth } = useViewMonth();
  return {
    month: viewMonth ?? undefined,
    monthKey: viewMonth ?? 'current',
    isPastMonth: viewMonth !== null,
  };
}

interface FinanceQueryOptions {
  /** Caller-side gate — usually `hasBankAccount`. */
  enabled: boolean;
  /** Refetch in the background every 30s while mounted. */
  poll?: boolean;
  /** Report `isLoading` even though the query is still gated off. */
  pendingAccounts?: boolean;
  /** A finished month: no polling, longer staleTime. */
  pastMonth?: boolean;
  /** Keep showing the previous key's data (flagged `isPlaceholderData`) while the new one loads. */
  keepPrevious?: boolean;
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
  { enabled, poll, pendingAccounts, pastMonth, keepPrevious }: FinanceQueryOptions
) {
  const { token } = useAuth();
  const query = useQuery({
    queryKey: [FINANCE_KEY, ...key],
    queryFn,
    enabled: !!token && enabled,
    refetchInterval: poll && !pastMonth ? POLL_MS : false,
    staleTime: pastMonth ? PAST_MONTH_STALE_MS : undefined,
    // Only while enabled: a gated-off query (e.g. zero accounts checked) must
    // fall through to its empty state, not keep the last figures on screen.
    placeholderData: keepPrevious && enabled ? keepPreviousData : undefined,
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
  const { month, monthKey, isPastMonth } = useMonthScope();
  return useFinanceQuery(
    ['grow', monthKey, accountIdsKey],
    () => fetchGrow(accountIds, month),
    { enabled: enabled && accountIds.length > 0, poll: true, pendingAccounts: enabled && isPending,
      pastMonth: isPastMonth, keepPrevious: true }
  );
}

export function useMonthlyGoalQuery(enabled = true) {
  const { fetchMonthlyGoal } = useAuth();
  return useFinanceQuery(['monthlyGoal'], () => fetchMonthlyGoal(), { enabled });
}

export function useUnplannedQuery(enabled: boolean) {
  const { fetchUnplanned } = useAuth();
  const { accountIds, accountIdsKey, isPending } = useAccountIds();
  const { month, monthKey, isPastMonth } = useMonthScope();
  return useFinanceQuery(
    ['unplanned', monthKey, accountIdsKey],
    () => fetchUnplanned(accountIds, month),
    { enabled: enabled && accountIds.length > 0, poll: true, pendingAccounts: enabled && isPending,
      pastMonth: isPastMonth, keepPrevious: true }
  );
}

export function useMonthliesQuery(enabled: boolean) {
  const { fetchMonthlies } = useAuth();
  const { accountIds, accountIdsKey, isPending } = useAccountIds();
  const { month, monthKey, isPastMonth } = useMonthScope();
  return useFinanceQuery(
    ['monthlies', monthKey, accountIdsKey],
    () => fetchMonthlies(undefined, accountIds, month),
    { enabled: enabled && accountIds.length > 0, poll: true, pendingAccounts: enabled && isPending,
      pastMonth: isPastMonth, keepPrevious: true }
  );
}

export function useFixedQuery(enabled: boolean) {
  const { fetchFixed } = useAuth();
  const { accountIds, accountIdsKey, isPending } = useAccountIds();
  const { month, monthKey, isPastMonth } = useMonthScope();
  return useFinanceQuery(
    ['fixed', monthKey, accountIdsKey],
    () => fetchFixed(undefined, accountIds, month),
    { enabled: enabled && accountIds.length > 0, poll: true, pendingAccounts: enabled && isPending,
      pastMonth: isPastMonth, keepPrevious: true }
  );
}

export function useIncomeQuery(enabled: boolean) {
  const { fetchIncome } = useAuth();
  const { accountIds, accountIdsKey, isPending } = useAccountIds();
  const { month, monthKey, isPastMonth } = useMonthScope();
  return useFinanceQuery(
    ['income', monthKey, accountIdsKey],
    () => fetchIncome(accountIds, month),
    { enabled: enabled && accountIds.length > 0, poll: true, pendingAccounts: enabled && isPending,
      pastMonth: isPastMonth, keepPrevious: true }
  );
}

export function useOffBudgetQuery(enabled: boolean) {
  const { fetchOffBudget } = useAuth();
  const { accountIds, accountIdsKey, isPending } = useAccountIds();
  const { month, monthKey, isPastMonth } = useMonthScope();
  return useFinanceQuery(
    ['offBudget', monthKey, accountIdsKey],
    () => fetchOffBudget(accountIds, month),
    { enabled: enabled && accountIds.length > 0, poll: true, pendingAccounts: enabled && isPending,
      pastMonth: isPastMonth, keepPrevious: true }
  );
}

// --- 3-month averages -------------------------------------------------------

export function useThreeMonthAverageQuery(categoryGroup: string, enabled: boolean) {
  const { fetchThreeMonthAverage } = useAuth();
  const { accountIds, accountIdsKey } = useAccountIds();
  const { month, monthKey, isPastMonth } = useMonthScope();
  return useFinanceQuery(
    ['average', categoryGroup, monthKey, accountIdsKey],
    () => fetchThreeMonthAverage(categoryGroup, accountIds, month),
    { enabled: enabled && accountIds.length > 0, pastMonth: isPastMonth, keepPrevious: true }
  );
}

export function useCategoryAveragesQuery(categoryGroup: string, enabled: boolean) {
  const { fetchCategoryAverages } = useAuth();
  const { accountIds, accountIdsKey } = useAccountIds();
  const { month, monthKey, isPastMonth } = useMonthScope();
  return useFinanceQuery(
    ['averageCategories', categoryGroup, monthKey, accountIdsKey],
    () => fetchCategoryAverages(categoryGroup, accountIds, month),
    { enabled: enabled && accountIds.length > 0, pastMonth: isPastMonth, keepPrevious: true }
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

// --- Month-end forecast ------------------------------------------------------

/**
 * One request for all three groups. Each screen takes its own slice through
 * `useCategoryForecast`, so switching between Monthlies, Fixed and Unplanned
 * reuses the same cache entry. No polling: the backend caches the result and
 * drops it when transactions change, and `useInvalidateFinance` covers writes.
 */
export function useCategoryForecastQuery(enabled: boolean) {
  const { fetchCategoryForecast } = useAuth();
  const { accountIds, accountIdsKey } = useAccountIds();
  const { month, monthKey, isPastMonth } = useMonthScope();
  return useFinanceQuery(
    ['forecast', monthKey, accountIdsKey],
    () => fetchCategoryForecast(undefined, accountIds, month),
    { enabled: enabled && accountIds.length > 0, pastMonth: isPastMonth, keepPrevious: true }
  );
}

export interface GroupForecast {
  /** category name -> forecast row */
  byCategory: Map<string, CategoryForecast>;
  categories: CategoryForecast[];
  totalSpent: number;
  totalForecast: number;
  totalHistoryAverage: number;
  daysElapsed: number;
  daysInMonth: number;
}

/**
 * One group's forecast rows and totals. The response's totals cover every
 * group, so the per-screen totals are summed here. `undefined` until loaded,
 * or if the request failed — screens then fall back to their old layout.
 */
export function useCategoryForecast(group: ForecastGroup, enabled: boolean): GroupForecast | undefined {
  const { data } = useCategoryForecastQuery(enabled);
  return useMemo(() => {
    if (!data) return undefined;
    const categories = data.categories.filter((c) => c.category_group === group);
    const sum = (pick: (c: CategoryForecast) => number) => categories.reduce((acc, c) => acc + pick(c), 0);
    return {
      byCategory: new Map(categories.map((c) => [c.category, c])),
      categories,
      totalSpent: sum((c) => c.spent),
      totalForecast: sum((c) => c.forecast),
      totalHistoryAverage: sum((c) => c.history_average),
      daysElapsed: data.days_elapsed,
      daysInMonth: data.days_in_month,
    };
  }, [data, group]);
}

// --- Per-category drill-downs -----------------------------------------------
//
// Keyed by category, so an expanded row that was already opened re-opens with
// no request — including after switching tabs and back. `category` is null
// when nothing is expanded, which disables the query.

export function useMonthliesTransactionsQuery(category: string | null, enabled: boolean) {
  const { fetchMonthliesTransactions } = useAuth();
  const { accountIds, accountIdsKey } = useAccountIds();
  const { month, monthKey, isPastMonth } = useMonthScope();
  return useFinanceQuery(
    ['monthliesTransactions', category, monthKey, accountIdsKey],
    () => fetchMonthliesTransactions(category as string, undefined, accountIds, month),
    { enabled: enabled && !!category && accountIds.length > 0, pastMonth: isPastMonth }
  );
}

/**
 * One expense category's transactions for an explicit past month (YYYY-MM),
 * whatever month the picker shows — the drill-down behind an average's monthly
 * totals. Same key shape as the per-screen queries, so it shares cache with
 * viewing that month directly.
 */
export function useCategoryTransactionsForMonthQuery(
  group: 'monthlies' | 'fixed',
  category: string,
  month: string | null,
  enabled: boolean
) {
  const { fetchMonthliesTransactions, fetchFixedTransactions } = useAuth();
  const { accountIds, accountIdsKey } = useAccountIds();
  const fetcher = group === 'monthlies' ? fetchMonthliesTransactions : fetchFixedTransactions;
  return useFinanceQuery(
    [`${group}Transactions`, category, month, accountIdsKey],
    () => fetcher(category, undefined, accountIds, month as string),
    { enabled: enabled && !!month && accountIds.length > 0, pastMonth: true }
  );
}

export function useFixedTransactionsQuery(category: string | null, enabled: boolean) {
  const { fetchFixedTransactions } = useAuth();
  const { accountIds, accountIdsKey } = useAccountIds();
  const { month, monthKey, isPastMonth } = useMonthScope();
  return useFinanceQuery(
    ['fixedTransactions', category, monthKey, accountIdsKey],
    () => fetchFixedTransactions(category as string, undefined, accountIds, month),
    { enabled: enabled && !!category && accountIds.length > 0, pastMonth: isPastMonth }
  );
}

export function useIncomeTransactionsQuery(category: string | null, enabled: boolean) {
  const { fetchIncomeTransactions } = useAuth();
  const { accountIds, accountIdsKey } = useAccountIds();
  const { month, monthKey, isPastMonth } = useMonthScope();
  return useFinanceQuery(
    ['incomeTransactions', category, monthKey, accountIdsKey],
    () => fetchIncomeTransactions(category as string, accountIds, month),
    { enabled: enabled && !!category && accountIds.length > 0, pastMonth: isPastMonth }
  );
}

export function useOffBudgetTransactionsQuery(
  category: string | null,
  transactionType: 'INCOME' | 'EXPENSE',
  enabled: boolean
) {
  const { fetchOffBudgetTransactions } = useAuth();
  const { accountIds, accountIdsKey } = useAccountIds();
  const { month, monthKey, isPastMonth } = useMonthScope();
  return useFinanceQuery(
    ['offBudgetTransactions', transactionType, category, monthKey, accountIdsKey],
    () => fetchOffBudgetTransactions(category as string, transactionType, accountIds, month),
    { enabled: enabled && !!category && accountIds.length > 0, pastMonth: isPastMonth }
  );
}
