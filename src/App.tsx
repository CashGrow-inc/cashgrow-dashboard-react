import React, { useCallback, useEffect, useMemo, useState, useId } from 'react';
import './styles/dashboard.css';
import { ApiError, createLinkToken, exchangePublicToken, fetchAccounts, fetchCategoryMap, fetchPlaidItem, fetchTransactions, logoutPlaid } from './services/api';
import sampleAccountsJson from './sample-data/accounts.json';
import sampleTransactionsJson from './sample-data/transactions.json';
import sampleCategoryMapJson from './sample-data/category-map.json';
import cashgrowWordmark from './assets/cashgrow-wordmark.png';
type Txn = Awaited<ReturnType<typeof fetchTransactions>>[number];
type CatMap = Awaited<ReturnType<typeof fetchCategoryMap>>;
type PlaidLinkHandler = {
  open: () => void;
  exit: () => void;
  destroy: () => void;
};
type PlaidCreateOptions = {
  token: string;
  onSuccess: (publicToken: string, metadata: any) => void | Promise<void>;
  onExit?: (err: any, metadata?: any) => void;
};
declare global {
  interface Window {
    Plaid?: {
      create: (config: PlaidCreateOptions) => PlaidLinkHandler;
    };
  }
}
const ymKey = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
let plaidScriptPromise: Promise<void> | null = null;
function loadPlaidLinkScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Plaid Link requires a browser environment.'));
  }
  if (window.Plaid) {
    return Promise.resolve();
  }
  if (!plaidScriptPromise) {
    plaidScriptPromise = new Promise<void>((resolve, reject) => {
      let existing = document.querySelector('script[data-plaid-link-script="true"]') as HTMLScriptElement | null;
      if (!existing) {
        existing = document.querySelector('script[src*="link-initialize.js"]') as HTMLScriptElement | null;
      }
      if (existing) {
        existing.setAttribute('data-plaid-link-script', 'true');
        const markLoaded = () => {
          existing?.setAttribute('data-loaded', 'true');
          resolve();
        };
        if (existing.getAttribute('data-loaded') === 'true' || window.Plaid) {
          markLoaded();
          return;
        }
        existing.addEventListener('load', markLoaded, { once: true });
        existing.addEventListener('error', () => reject(new Error('Failed to load Plaid Link script')), { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
      script.async = true;
      script.setAttribute('data-plaid-link-script', 'true');
      script.onload = () => {
        script.setAttribute('data-loaded', 'true');
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Plaid Link script'));
      document.head.appendChild(script);
    }).finally(() => {
      plaidScriptPromise = null;
    });
  }
  return plaidScriptPromise ?? Promise.resolve();
}
const fmtMoney = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 2 });
const toUtcDate = (iso: string) => {
  const [yearStr, monthStr, dayStr] = iso.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return new Date(NaN);
  }
  return new Date(Date.UTC(year, month - 1, day));
};
const startOfMonthUtc = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
const endOfMonthUtc = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
const weeksInMonthMondayStart = (d: Date) => {
  const start = startOfMonthUtc(d);
  const end = endOfMonthUtc(d);
  const totalDays = end.getUTCDate();
  const offset = ((start.getUTCDay() + 6) % 7) + 1;
  return Math.floor((totalDays + offset - 2) / 7) + 1;
};
const weekOfMonthMondayStart = (d: Date) => {
  const start = startOfMonthUtc(d);
  const offset = ((start.getUTCDay() + 6) % 7) + 1;
  return Math.floor((d.getUTCDate() + offset - 2) / 7) + 1;
};
const getPacificTodayUtc = () => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(new Date());
  const lookup = new Map(parts.map(p => [p.type, p.value]));
  const year = Number(lookup.get('year'));
  const month = Number(lookup.get('month'));
  const day = Number(lookup.get('day'));
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return new Date();
  }
  return new Date(Date.UTC(year, month - 1, day));
};
const getTimezoneOffsetMinutes = (timeZone: string, date: Date) => {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = dtf.formatToParts(date);
  const filled: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      filled[part.type] = part.value;
    }
  }
  const asUtc = Date.UTC(
    Number(filled.year),
    Number(filled.month) - 1,
    Number(filled.day),
    Number(filled.hour),
    Number(filled.minute),
    Number(filled.second),
  );
  const diff = date.getTime() - asUtc;
  return diff / 60000;
};
const normalizeMainCategory = (name?: string | null) => {
  if (!name) return undefined;
  const normalized = name.trim().toLowerCase();
  switch (normalized) {
    case 'income':
      return 'Income';
    case 'fixed costs':
      return 'Fixed Costs';
    case 'variable expenses':
      return 'Variable Expenses';
    case 'unplanned expenses':
      return 'Unplanned Expenses';
    case 'non-cash':
    case 'non-cash transactions':
      return 'Non-Cash transactions';
    default:
      return name;
  }
};
const catPrimary = (t: Txn) => t.personal_finance_category?.primary || 'UNCATEGORIZED';
const catDetailed = (t: Txn) => t.personal_finance_category?.detailed || 'UNKNOWN';
const categoryEmojiMatchers = [
  { keywords: ['flight', 'airfare', 'airline'], emoji: '\u2708\uFE0F' },
  { keywords: ['hotel', 'lodging', 'stay'], emoji: '\uD83C\uDFE8' },
  { keywords: ['travel', 'vacation', 'trip'], emoji: '\uD83C\uDF0D' },
  { keywords: ['rent', 'mortgage', 'housing'], emoji: '\uD83C\uDFE0' },
  { keywords: ['utility', 'electric', 'water', 'power'], emoji: '\uD83D\uDD0C' },
  { keywords: ['internet', 'wifi', 'cable'], emoji: '\uD83D\uDCF6' },
  { keywords: ['phone', 'cell'], emoji: '\uD83D\uDCF1' },
  { keywords: ['insurance'], emoji: '\uD83D\uDEE1\uFE0F' },
  { keywords: ['medical', 'health', 'doctor', 'clinic'], emoji: '\uD83C\uDFE5' },
  { keywords: ['pharmacy', 'drug', 'medication'], emoji: '\uD83D\uDC8A' },
  { keywords: ['grocery', 'market', 'supermarket'], emoji: '\uD83D\uDED2' },
  { keywords: ['dining', 'restaurant', 'food', 'meal'], emoji: '\uD83C\uDF7D\uFE0F' },
  { keywords: ['coffee', 'cafe'], emoji: '\u2615' },
  { keywords: ['fuel', 'gas'], emoji: '\u26FD' },
  { keywords: ['parking', 'toll'], emoji: '\uD83C\uDD7F\uFE0F' },
  { keywords: ['rideshare', 'uber', 'lyft', 'taxi'], emoji: '\uD83D\uDE95' },
  { keywords: ['subscription', 'stream', 'membership'], emoji: '\uD83D\uDD04' },
  { keywords: ['entertainment', 'movie', 'music'], emoji: '\uD83C\uDFAC' },
  { keywords: ['shopping', 'retail', 'store'], emoji: '\uD83D\uDCB0' },
  { keywords: ['salary', 'payroll', 'paycheck', 'income'], emoji: '\uD83D\uDCBC' },
  { keywords: ['bonus'], emoji: '\uD83C\uDF89' },
  { keywords: ['investment', 'brokerage'], emoji: '\uD83D\uDCC8' },
  { keywords: ['education', 'school', 'tuition'], emoji: '\uD83C\uDF93' },
  { keywords: ['charity', 'donation'], emoji: '\uD83C\uDF81' },
];
const getCategoryEmoji = (label?: string | null) => {
  if (!label) return '';
  const normalized = label.toLowerCase();
  for (const { keywords, emoji } of categoryEmojiMatchers) {
    if (keywords.some(keyword => normalized.includes(keyword))) {
      return emoji;
    }
  }
  return '';
};
export function App() {
  const [catMap, setCatMap] = useState<CatMap | null>(null);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkChecked, setLinkChecked] = useState(false);
  const [isLinked, setIsLinked] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkBusy, setLinkBusy] = useState(false);
  const [logoutBusy, setLogoutBusy] = useState(false);
  const [useDemoData, setUseDemoData] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const mapPrimaryGroup = (code: string) => {
    const mc = catMap?.primary?.[code]?.mainCategory;
    const normalized = normalizeMainCategory(mc);
    if (!normalized || normalized === 'Unassigned') {
      return 'Unplanned Expenses';
    }
    return normalized;
  };
  const mapDetailedLabel = (code: string) => catMap?.detailed?.[code]?.label || code.replace(/_/g, ' ');
  const groupOrder = (g: string) => {
    const arr = catMap?.mainCategories ?? [];
    const i = arr.indexOf(g);
    return i === -1 ? Number.POSITIVE_INFINITY : i;
  };


  const TileTitle: React.FC<{ label: string; description: string; className?: string }> = ({ label, description, className }) => {
    const tooltipId = useId();
    const classes = ["tile-title", className].filter(Boolean).join(" ");
    return (
      <div className={classes}>
        <span className="tile-title__text">{label}</span>
        <button
          type="button"
          className="tile-title__trigger"
          aria-label={`Learn more about ${label}`}
          aria-describedby={tooltipId}
        >
          <span className="tile-title__trigger-icon">i</span>
        </button>
        <span id={tooltipId} className="tile-title__bubble" role="tooltip">
          <span className="tile-title__bubble-header">{label}</span>
          <span className="tile-title__bubble-desc">{description}</span>
          <a className="tile-title__bubble-link" href="#knowledge-center">Go to Knowledge center</a>
        </span>
      </div>
    );
  };
  const categoryDescriptions: Record<string, string> = {
    'Unplanned Expenses': 'Keep tabs on unexpected purchases so you can adjust quickly.',
    'Variable Expenses': 'Spot patterns in flexible spending and stay on target.',
    'Fixed Costs': 'Review recurring obligations and confirm nothing changed.',
    'Income': 'Track where your cash inflows originate this period.',
    'Non-Cash transactions': 'Understand adjustments that impact totals without moving cash.',
  };
  const getCategoryDescription = (label: string) =>
    categoryDescriptions[label] ?? 'Explore more detail about this topic in the Knowledge center.';

  const hero = (
    <header className="app-hero" aria-label="CashGrow welcome banner">
      <div className="app-hero__panel">
        <img src={cashgrowWordmark} alt="CashGrow logo" className="app-hero__logo" />
      </div>
      <p className="app-hero__tagline">No ads, just your financials</p>
    </header>
  );
  const handleMenuToggle = useCallback(() => {
    setMenuOpen(prev => !prev);
  }, []);
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);
  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (useDemoData) {
        const mappedTransactions: Txn[] = (sampleTransactionsJson as any[]).map((x: any) => ({
          id: x.id ?? x.transaction_id ?? undefined,
          account_id: x.account_id,
          name: x.merchant_name ?? x.name,
          amount: Number(x.amount),
          iso_currency_code: x.iso_currency_code ?? '',
          date: x.date,
          personal_finance_category: {
            primary: x.personal_finance_category?.primary ?? x.category_primary ?? '',
            detailed: x.personal_finance_category?.detailed ?? x.category_detailed ?? '',
          },
          categoryDisplay: x.category_display ?? undefined,
        }));
        setCatMap(sampleCategoryMapJson as CatMap);
        setTxns(mappedTransactions);
        setLinkError(null);
        return;
      }
      const [cm, accounts] = await Promise.all([
        fetchCategoryMap().catch(() => null),
        fetchAccounts(),
      ]);
      setCatMap(cm);
      let selected: Txn[] | null = null;
      for (const account of accounts) {
        const preview = await fetchTransactions({ accountId: account.id, limit: 1 });
        if (preview.length) {
          selected = await fetchTransactions({ accountId: account.id });
          break;
        }
      }
      if (!selected && accounts[0]) {
        selected = await fetchTransactions({ accountId: accounts[0].id });
      }
      setTxns(selected ?? []);
      setLinkError(null);
    } catch (error) {
      console.error('Unable to load data from the CashGrow API', error);
      setTxns([]);
      setLinkError(prev => prev ?? 'Unable to load data from the CashGrow API.');
    } finally {
      setLoading(false);
    }
  }, [useDemoData]);
  useEffect(() => {
    if (useDemoData) {
      setLinkChecked(true);
      return;
    }
    (async () => {
      try {
        await fetchPlaidItem();
        setIsLinked(true);
      } catch (error) {
        if (error instanceof ApiError && error.status === 409) {
          setIsLinked(false);
        } else {
          console.error('Unable to verify Plaid link status', error);
          setLinkError(error instanceof Error ? error.message : 'Unable to verify Plaid link status.');
        }
      } finally {
        setLinkChecked(true);
      }
    })();
  }, [useDemoData]);
  const readyForData = isLinked || useDemoData;
  useEffect(() => {
    if (!readyForData) {
      if (linkChecked) {
        setLoading(false);
      }
      return;
    }
    void loadData();
  }, [readyForData, linkChecked, loadData]);
  const useSampleData = useCallback(() => {
    setLinkError(null);
    setUseDemoData(true);
    setIsLinked(false);
    if (!linkChecked) {
      setLinkChecked(true);
    }
    void loadData();
  }, [linkChecked, loadData]);
  const openPlaidLink = useCallback(async () => {
    setLinkError(null);
    setLinkBusy(true);
    try {
      const { link_token } = await createLinkToken();
      await loadPlaidLinkScript();
      if (!window.Plaid) {
        throw new Error("Plaid Link script did not load.");
      }
      const handler = window.Plaid.create({
        token: link_token,
        onSuccess: async (publicToken: string) => {
          try {
            await exchangePublicToken(publicToken);
            setUseDemoData(false);
            setIsLinked(true);
            setLinkError(null);
          } catch (error) {
            console.error('Unable to exchange Plaid public token', error);
            setLinkError(error instanceof Error ? error.message : 'Unable to link your account. Please try again.');
          } finally {
            setLinkBusy(false);
          }
        },
        onExit: (err: any) => {
          if (err) {
            const message = err.display_message ?? err.error_message ?? err.error_code ?? 'Link flow exited.';
            setLinkError(String(message));
          }
          setLinkBusy(false);
        },
      });
      handler.open();
    } catch (error) {
      console.error('Unable to open Plaid Link', error);
      setLinkBusy(false);
      setLinkError(error instanceof Error ? error.message : 'Unable to open Plaid Link.');
    }
  }, [createLinkToken, exchangePublicToken, loadPlaidLinkScript]);
  const handleLogout = useCallback(async () => {
    setLinkError(null);
    setLogoutBusy(true);
    try {
      await logoutPlaid();
      setIsLinked(false);
      setUseDemoData(false);
      setTxns([]);
      setCatMap(null);
      setLoading(false);
      setLinkChecked(true);
    } catch (error) {
      console.error('Unable to log out from Plaid', error);
      setLinkError(error instanceof Error ? error.message : 'Unable to log out. Please try again.');
    } finally {
      setLogoutBusy(false);
    }
  }, [logoutPlaid]);
  const view = useMemo(() => {
    const referenceDate = getPacificTodayUtc();
    const curKey = ymKey(referenceDate);
    const prevRef = new Date(Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth() - 1, 1));
    const prevKey = ymKey(prevRef);
    const currentPeriodStart = startOfMonthUtc(referenceDate);
    const timezoneOffsetMinutes = getTimezoneOffsetMinutes('America/Los_Angeles', referenceDate);
    const currentPeriodEnd = new Date(
      Date.UTC(
        referenceDate.getUTCFullYear(),
        referenceDate.getUTCMonth(),
        referenceDate.getUTCDate(),
        6,
        0,
        0,
      ) + timezoneOffsetMinutes * 60 * 1000,
    );
    const priorMonthStart = startOfMonthUtc(prevRef);
    const priorMonthEnd = endOfMonthUtc(prevRef);
    const isWithinCurrentPeriod = (date: Date) => date >= currentPeriodStart && date <= currentPeriodEnd;
    const isWithinPriorMonth = (date: Date) => date >= priorMonthStart && date <= priorMonthEnd;

    const weeksInMonthCurrent = Math.max(weeksInMonthMondayStart(referenceDate), 1);
    const rawWeekOfMonth = weekOfMonthMondayStart(referenceDate);
    const weekOfMonthCurrent = Math.min(Math.max(rawWeekOfMonth, 1), weeksInMonthCurrent);

    if (!txns.length) {
      return {
        curKey,
        prevKey,
        minDate: currentPeriodStart,
        maxDate: currentPeriodEnd,
        txnsCur: [] as Txn[],
        groups: [] as {
          name: string;
          total: number;
          prevTotal: number;
          details: {
            code: string;
            label: string;
            rowsCur: Txn[];
            sumCur: number;
            prevSum: number;
          }[];
        }[],
        totalsByGroup: new Map<string, number>(),
        prevTotalsByGroup: new Map<string, number>(),
        leftForUnplanned: 0,
        budget: {
          totalBudgeted: 0,
          leftTillEom: 0,
          unplannedPerWeek: 0,
          weekOfMonth: weekOfMonthCurrent,
          weeksInMonth: weeksInMonthCurrent,
          weekOpening: 0,
          referenceDate,
        },
      };
    }

    const byPrimary = new Map<string, { details: Map<string, Txn[]>; currentTotal: number; priorTotal: number }>();
    for (const txn of txns) {
      const primary = catPrimary(txn);
      const detailed = catDetailed(txn);
      const date = toUtcDate(txn.date);
      const validDate = !Number.isNaN(date.getTime());
      let entry = byPrimary.get(primary);
      if (!entry) {
        entry = { details: new Map(), currentTotal: 0, priorTotal: 0 };
        byPrimary.set(primary, entry);
      }
      const detailRows = entry.details.get(detailed) ?? [];
      detailRows.push(txn);
      entry.details.set(detailed, detailRows);
      if (validDate) {
        if (isWithinCurrentPeriod(date)) {
          entry.currentTotal += txn.amount;
        }
        if (isWithinPriorMonth(date)) {
          entry.priorTotal += txn.amount;
        }
      }
    }

    const totalsByGroup = new Map<string, number>();
    const prevTotalsByGroup = new Map<string, number>();
    type DetailAccumulator = {
      code: string;
      label: string;
      rowsCur: Txn[];
      sumCur: number;
      prevSum: number;
    };
    type GroupAccumulator = {
      name: string;
      total: number;
      prevTotal: number;
      details: Map<string, DetailAccumulator>;
    };
    const groupedByMain = new Map<string, GroupAccumulator>();

    for (const [primary, entry] of byPrimary.entries()) {
      const groupName = mapPrimaryGroup(primary);
      const curTotal = entry.currentTotal;
      const prevTotal = entry.priorTotal;
      totalsByGroup.set(groupName, (totalsByGroup.get(groupName) ?? 0) + curTotal);
      prevTotalsByGroup.set(groupName, (prevTotalsByGroup.get(groupName) ?? 0) + prevTotal);
      let grouped = groupedByMain.get(groupName);
      if (!grouped) {
        grouped = {
          name: groupName,
          total: 0,
          prevTotal: 0,
          details: new Map<string, DetailAccumulator>(),
        };
        groupedByMain.set(groupName, grouped);
      }
      grouped.total += curTotal;
      grouped.prevTotal += prevTotal;
      for (const [code, rows] of entry.details.entries()) {
        const rowsCur = rows.filter(txn => {
          const date = toUtcDate(txn.date);
          return !Number.isNaN(date.getTime()) && isWithinCurrentPeriod(date);
        });
        const rowsPrev = rows.filter(txn => {
          const date = toUtcDate(txn.date);
          return !Number.isNaN(date.getTime()) && isWithinPriorMonth(date);
        });
        const sumCur = rowsCur.reduce((acc, txn) => acc + txn.amount, 0);
        const prevSum = rowsPrev.reduce((acc, txn) => acc + txn.amount, 0);
        let detail = grouped.details.get(code);
        if (!detail) {
          detail = {
            code,
            label: mapDetailedLabel(code),
            rowsCur: [],
            sumCur: 0,
            prevSum: 0,
          };
          grouped.details.set(code, detail);
        }
        detail.rowsCur.push(...rowsCur);
        detail.sumCur += sumCur;
        detail.prevSum += prevSum;
      }
    }

    const groups = Array.from(groupedByMain.values())
      .map(group => ({
        name: group.name,
        total: group.total,
        prevTotal: group.prevTotal,
        details: Array.from(group.details.values())
          .map(detail => ({
            code: detail.code,
            label: detail.label,
            rowsCur: detail.rowsCur.slice(),
            sumCur: detail.sumCur,
            prevSum: detail.prevSum,
          }))
          .sort((a, b) => Math.abs(b.sumCur) - Math.abs(a.sumCur)),
      }))
      .sort((a, b) => groupOrder(a.name) - groupOrder(b.name));

    const txnsCur = txns.filter(txn => {
      const date = toUtcDate(txn.date);
      return !Number.isNaN(date.getTime()) && isWithinCurrentPeriod(date);
    });

    const prevIncome = prevTotalsByGroup.get('Income') ?? 0;
    const prevFixed = prevTotalsByGroup.get('Fixed Costs') ?? 0;
    const prevVariable = prevTotalsByGroup.get('Variable Expenses') ?? 0;
    const prevUnplanned = prevTotalsByGroup.get('Unplanned Expenses') ?? 0;
    const priorMonthNet = prevIncome + prevFixed + prevVariable + prevUnplanned;
    const totalBudgeted = priorMonthNet >= 0 ? 0 : priorMonthNet * -1;
    const currentUnplanned = totalsByGroup.get('Unplanned Expenses') ?? 0;
    const leftTillEom = totalBudgeted + currentUnplanned;
    const unplannedPerWeek = weeksInMonthCurrent ? totalBudgeted / weeksInMonthCurrent : 0;
    const spentSoFar = totalBudgeted - leftTillEom;
    const allocatedBeforeThisWeek = unplannedPerWeek * (weekOfMonthCurrent - 1);
    let weekOpening = 0;
    if (totalBudgeted !== 0) {
      if (allocatedBeforeThisWeek >= spentSoFar) {
        const excess = allocatedBeforeThisWeek - spentSoFar;
        weekOpening = unplannedPerWeek + excess / weeksInMonthCurrent;
      } else {
        const deficit = spentSoFar - allocatedBeforeThisWeek;
        weekOpening = deficit;
      }
    }

    return {
      curKey,
      prevKey,
      minDate: currentPeriodStart,
      maxDate: currentPeriodEnd,
      txnsCur,
      groups,
      totalsByGroup,
      prevTotalsByGroup,
      leftForUnplanned: leftTillEom,
      budget: {
        totalBudgeted,
        leftTillEom,
        unplannedPerWeek,
        weekOfMonth: weekOfMonthCurrent,
        weeksInMonth: weeksInMonthCurrent,
        weekOpening,
        referenceDate,
      },
    };
  }, [txns, useDemoData, catMap]);
  if (!linkChecked) {
    return (
      <div className="app-shell">
        {hero}
        <div className="wrap" style={{ padding: 16 }}>Checking Plaid status...</div>
      </div>
    );
  }
  
  
  if (!readyForData) {
    return (
      <div className="app-shell">
        {hero}
        <div className="wrap" style={{ padding: 24, maxWidth: 560 }}>
          <h1>CashGrow Dashboard</h1>
          <p style={{ marginTop: 16 }}>Connect your bank with Plaid to see your live transactions.</p>
          {linkError && (
            <div style={{ marginTop: 12, color: '#b00020' }}>{linkError}</div>
          )}
          <button
            onClick={openPlaidLink}
            disabled={linkBusy}
            style={{ marginTop: 24, padding: '12px 20px', fontSize: '1rem' }}
          >
            {linkBusy ? 'Opening Plaid...' : 'Log in with you Bank'}
          </button>
          <button
            onClick={useSampleData}
            disabled={linkBusy}
            style={{ marginTop: 12, padding: '10px 18px', fontSize: '0.95rem' }}
          >
            Explore in demo data
          </button>
          <p className="muted" style={{ marginTop: 12 }}>
            Sandbox tip: use Plaid test credentials like <code>user_good</code> / <code>pass_good</code>,
            or continue with the built-in demo dataset.
          </p>
        </div>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="app-shell">
        {hero}
        <div className="wrap" style={{ padding: 16 }}>Loading...</div>
      </div>
    );
  }
  const minStr = view.minDate ? view.minDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'America/Los_Angeles' }) : 'N/A';
  const maxStr = view.maxDate ? view.maxDate.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/Los_Angeles' }) : 'N/A';
  const topSum = (view.prevTotalsByGroup.get('Income') || 0)
    + (view.prevTotalsByGroup.get('Fixed Costs') || 0)
    + (view.prevTotalsByGroup.get('Variable Expenses') || 0)
    + (view.totalsByGroup.get('Unplanned Expenses') || 0);
  const budgetReferenceLabel = new Intl.DateTimeFormat(undefined, { timeZone: 'America/Los_Angeles', year: 'numeric', month: 'short', day: 'numeric' }).format(view.budget.referenceDate);

  return (
    <div className="app-shell">
      {hero}
      <nav id="appMenu" className={`app-menu ${isMenuOpen ? 'app-menu--open' : ''}`} aria-hidden={!isMenuOpen}>
        <div className="app-menu__header">
          <span className="app-menu__title">Dashboard Menu</span>
          <button type="button" className="app-menu__close" onClick={closeMenu} aria-label="Close menu">Close</button>
        </div>
        <ul className="app-menu__list">
          <li><a href="#summary" onClick={closeMenu}>Summary</a></li>
          <li><a href="#categories" onClick={closeMenu}>Spending Categories</a></li>
          <li><a href="#knowledge-center" onClick={closeMenu}>Knowledge center</a></li>
        </ul>
      </nav>
      {isMenuOpen && (
        <button type="button" className="app-menu__overlay" onClick={closeMenu} aria-label="Close menu" />
      )}
      <main>
        <div className="wrap">
          <section id="summary" className="dashboard-top">
            <div className="dashboard-top__bar">
              <button type="button" className="app-menu__toggle" onClick={handleMenuToggle} aria-expanded={isMenuOpen} aria-controls="appMenu">Menu</button>
              <h1>CashGrow Dashboard</h1>
              {isLinked && (
                <button
                  onClick={handleLogout}
                  disabled={logoutBusy || linkBusy}
                  style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                >
                  {logoutBusy ? 'Logging out...' : 'Log out'}
                </button>
              )}
            </div>
            <div className="net-card net-card--primary">
              <div className="net-card__header">
                <div className="net-card__greeting">Hi users :)</div>
                <TileTitle className="net-title" label="Here's what's left to spend till the end of the week" description="See how last month's results and this month's surprises impact what you can still spend." />
                <div id="netValue" className="net-value">{fmtMoney(topSum)}</div>
                <div className="net-week-opening">Week opening: {fmtMoney(view.budget.weekOpening)}</div>
              </div>
              <div className="net-card__footer muted">Budget reference (PT): {budgetReferenceLabel}</div>
            </div>
            <div className="net-card net-card--timing">
              <div className="net-card__stats net-card__stats--two">
                <div className="net-stat">
                  <span className="net-stat__label">Period</span>
                  <span className="net-stat__value">{minStr} - {maxStr}</span>
                </div>
                <div className="net-stat">
                  <span className="net-stat__label">Week progress</span>
                  <span className="net-stat__value">Week {view.budget.weekOfMonth} of {view.budget.weeksInMonth}</span>
                </div>
              </div>
            </div>
            <div className="net-card net-card--insights">
              <div id="knowledge-center" className="net-card__insights">
                <TileTitle className="net-card__insights-title" label="Insights & notifications" description="Stay on top of alerts, trends, and helpful guidance curated for you." />
                <p className="net-card__insights-placeholder">We'll surface new insights here as they become available.</p>
              </div>
            </div>
            <div className="net-card net-card--budget">
              <TileTitle className="net-card__budget-title" label="Budget snapshot" description="Compare what you planned to spend with what remains available for surprises." />
              <div className="net-card__stats net-card__stats--two">
                <div className="net-stat">
                  <span className="net-stat__label">Amount left for unplanned</span>
                  <span className="net-stat__value">{fmtMoney(view.budget.leftTillEom)}</span>
                </div>
                <div className="net-stat">
                  <span className="net-stat__label">Planned budget</span>
                  <span className="net-stat__value">{fmtMoney(view.budget.totalBudgeted)}</span>
                </div>
              </div>
            </div>
          </section>
          {linkError && (<div style={{ marginTop: 16, color: '#b00020' }}>{linkError}</div>)}
          <section id="categories" className="category-sections">
            {view.groups.map(g => {
              const currentTotal = g.total;
              const priorTotal = g.prevTotal;
              const currentMagnitude = Math.abs(currentTotal);
              const priorMagnitude = Math.abs(priorTotal);
              const maxMagnitude = Math.max(currentMagnitude, priorMagnitude, 1);
              const currentPercent = Math.round((currentMagnitude / maxMagnitude) * 100);
              const priorPercent = Math.round((priorMagnitude / maxMagnitude) * 100);
              return (
                <section key={g.name} className="category-section">
                  <details className="category-tile">
                    <summary className="category-tile__summary">
                      <div className="category-title-wrap">
                        <TileTitle className="category-title-label" label={g.name} description={getCategoryDescription(g.name)} />
                        <span className="category-tile__chevron" aria-hidden="true" />
                      </div>
                      <div className="category-tile__chart">
                        <div className="category-bar">
                          <div className="category-bar__main">
                            <div className="category-bar__track">
                              <div className="category-bar__expected" style={{ width: `${priorPercent}%` }} />
                              <div className="category-bar__fill" style={{ width: `${currentPercent}%` }} />
                            </div>
                            <div className="category-bar__expensed" style={currentPercent ? { width: `${currentPercent}%` } : undefined}>
                              <span className="category-bar__label-title">Expensed</span>
                              <span className="category-bar__label-value">{fmtMoney(currentTotal)}</span>
                            </div>
                          </div>
                          <div className="category-bar__expected-label">
                            <span className="category-bar__label-title">Expected</span>
                            <span className="category-bar__label-value">{fmtMoney(priorTotal)}</span>
                          </div>
                        </div>
                        </div>
                    </summary>
                    <div className="category-tile__content">
                      <div className="cat-card">
                        {g.details.map(det => {
                          const ratio = det.prevSum ? Math.min(100, Math.abs(det.sumCur) / Math.abs(det.prevSum) * 100) : (det.sumCur ? 100 : 0);
                          const label = det.label || det.code;
                          const emoji = getCategoryEmoji(label);
                          return (
                            <details key={det.code} className="sub-card">
                              <summary>
                                <span>{label}</span>
                                {emoji && (
                                  <span className="category-emoji" aria-hidden="true">{emoji}</span>
                                )}
                                <span className="muted"></span>
                                <span style={{ marginLeft: 'auto', fontWeight: 700 }}>{fmtMoney(det.sumCur)}</span>
                              </summary>
                              <div className="muted" style={{ marginTop: 8 }}>Prior month: {fmtMoney(det.prevSum)}</div>
                              <div className="compare-line" style={{ marginTop: 4 }}>
                                <div className="progress progress--compare">
                                  <div className="bar bar--current" style={{ width: `${ratio}%` }} />
                                </div>
                                <span className="badge badge--current">{fmtMoney(det.sumCur)}</span>
                              </div>
                              <table className="tx-table">
                                <thead>
                                  <tr><th>Date</th><th>Merchant</th><th>Amount</th></tr>
                                </thead>
                                <tbody>
                                  {det.rowsCur.map((t, i) => (
                                    <tr key={t.id || i}>
                                      <td>{new Date(t.date).toLocaleDateString()}</td>
                                      <td>{(t as any).merchant_name || t.name || 'Unknown'}</td>
                                      <td style={{ textAlign: 'right' }}>{fmtMoney(Number(t.amount) || 0)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </details>
                          );
                        })}
                      </div>
                    </div>
                  </details>
                </section>
              );
            })}
          </section>
        </div>
      </main>
    </div>
  );
}























