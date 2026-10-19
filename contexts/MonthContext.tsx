import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth, AvailableMonth } from '../AuthContext';
import { FINANCE_KEY } from '../queryClient';

/**
 * The month the whole dashboard is looking at.
 *
 * `null` means "the current month" and is the default: requests then go out
 * without a `month` param, exactly as before this existed. A past month is a
 * `YYYY-MM` string taken from `GET /api/budget/months` — the backend 400s any
 * month not in that list, so a selection is only ever kept if it's listed.
 *
 * The selection lives in sessionStorage, not localStorage: a refresh keeps the
 * user where they were, but a new session always opens on the current month
 * rather than resurfacing a stale one days later.
 */
interface MonthContextType {
  /** `YYYY-MM` of the selected past month, or null for the current month. */
  viewMonth: string | null;
  isCurrentMonth: boolean;
  /** Viewable months, newest first. Empty until the first load. */
  availableMonths: AvailableMonth[];
  /** e.g. "October 2026". */
  selectedLabel: string;
  canPrev: boolean;
  canNext: boolean;
  setMonth: (month: string) => void;
  goPrev: () => void;
  goNext: () => void;
  resetToCurrent: () => void;
}

const MonthContext = createContext<MonthContextType | null>(null);

const STORAGE_KEY_PREFIX = 'viewMonth_';
const MONTHS_STALE_MS = 60 * 60_000;

function readStored(key: string | null): string | null {
  if (!key) return null;
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStored(key: string | null, month: string | null) {
  if (!key) return;
  try {
    if (month) sessionStorage.setItem(key, month);
    else sessionStorage.removeItem(key);
  } catch {
    // Storage blocked (private mode etc.) — the selection just won't survive a refresh.
  }
}

/** "October 2026" from "2026-10", for before the months list has loaded. */
function labelFor(month: string): string {
  const [year, m] = month.split('-').map(Number);
  return new Date(year, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function currentMonthString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export const MonthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isLoggedIn, user, fetchAvailableMonths } = useAuth();
  const storageKey = user?.id ? `${STORAGE_KEY_PREFIX}${user.id}` : null;

  const [selected, setSelected] = useState<string | null>(() => readStored(storageKey));

  // Re-read when the user changes (login after mount), and clear on logout.
  useEffect(() => {
    setSelected(isLoggedIn ? readStored(storageKey) : null);
  }, [isLoggedIn, storageKey]);

  // Under the finance prefix so `useInvalidateFinance()` refreshes it too —
  // a bank sync can extend how far back history goes.
  const { data, isSuccess } = useQuery({
    queryKey: [FINANCE_KEY, 'availableMonths'],
    queryFn: () => fetchAvailableMonths(),
    enabled: !!token && isLoggedIn,
    staleTime: MONTHS_STALE_MS,
  });
  const availableMonths = useMemo(() => data?.months ?? [], [data]);
  const currentMonth = availableMonths.find(m => m.is_current)?.month ?? currentMonthString();

  const select = useCallback((month: string | null) => {
    setSelected(month);
    writeStored(storageKey, month);
  }, [storageKey]);

  // Drop a selection the backend wouldn't accept (it fell out of the window,
  // or a restored session predates a month rollover).
  useEffect(() => {
    if (!isSuccess || !selected) return;
    if (selected === currentMonth || !availableMonths.some(m => m.month === selected)) {
      select(null);
    }
  }, [isSuccess, selected, currentMonth, availableMonths, select]);

  const viewMonth = selected && selected !== currentMonth ? selected : null;
  const activeMonth = viewMonth ?? currentMonth;
  const index = availableMonths.findIndex(m => m.month === activeMonth);

  // Newest first: "previous" is further down the list.
  const canPrev = index >= 0 && index < availableMonths.length - 1;
  const canNext = index > 0;

  const setMonth = useCallback(
    (month: string) => select(month === currentMonth ? null : month),
    [select, currentMonth]
  );
  const goPrev = useCallback(() => {
    if (canPrev) setMonth(availableMonths[index + 1].month);
  }, [canPrev, setMonth, availableMonths, index]);
  const goNext = useCallback(() => {
    if (canNext) setMonth(availableMonths[index - 1].month);
  }, [canNext, setMonth, availableMonths, index]);
  const resetToCurrent = useCallback(() => select(null), [select]);

  const selectedLabel = availableMonths[index]?.label ?? labelFor(activeMonth);

  const value = useMemo<MonthContextType>(() => ({
    viewMonth,
    isCurrentMonth: viewMonth === null,
    availableMonths,
    selectedLabel,
    canPrev,
    canNext,
    setMonth,
    goPrev,
    goNext,
    resetToCurrent,
  }), [viewMonth, availableMonths, selectedLabel, canPrev, canNext, setMonth, goPrev, goNext, resetToCurrent]);

  return <MonthContext.Provider value={value}>{children}</MonthContext.Provider>;
};

export const useViewMonth = (): MonthContextType => {
  const context = useContext(MonthContext);
  if (!context) {
    throw new Error('useViewMonth must be used within a MonthProvider');
  }
  return context;
};

/**
 * "this month" for the current month, "in September" for a past one — for
 * copy like "No transactions {phrase}".
 */
export function monthPhrase(isCurrentMonth: boolean, label: string): string {
  return isCurrentMonth ? 'this month' : `in ${label.split(' ')[0]}`;
}
