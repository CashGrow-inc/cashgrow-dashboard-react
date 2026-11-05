import React, { useState } from 'react';
import { formatCurrency } from './shared';
import { useCategoryTransactionsForMonthQuery } from '../hooks/financeQueries';

const shortMonth = (month: string) =>
  new Date(`${month}-01T00:00:00`).toLocaleDateString('en-US', { month: 'short' });

interface AverageBreakdownProps {
  group: 'monthlies' | 'fixed';
  category: string;
  months?: { month: string; total: number }[];
  expected: number;
  enabled: boolean;
}

// How a row's expected amount was built: the 3 prior months it averages (tap
// one to see its transactions), or a note that it falls back to this month's
// spend when there's no history.
const AverageBreakdown: React.FC<AverageBreakdownProps> = ({ group, category, months, expected, enabled }) => {
  const [openMonth, setOpenMonth] = useState<string | null>(null);
  const { data, isLoading, isError } = useCategoryTransactionsForMonthQuery(group, category, openMonth, enabled);
  const transactions = data?.transactions ?? [];

  const hasHistory = !!months && months.some(m => m.total > 0);
  // API lists the most recent month first; show oldest -> newest.
  const ordered = hasHistory ? [...months!].reverse() : [];
  return (
    <div className="px-4 pt-3 pb-1 text-xs text-slate-600">
      <div className="flex justify-between font-medium text-slate-700">
        <span>Expected</span>
        <span>${formatCurrency(expected)}</span>
      </div>
      {hasHistory ? (
        <>
          <p className="text-slate-500 mt-0.5">Average of the last 3 months. Tap a month for details.</p>
          <div className="flex gap-2 mt-2">
            {ordered.map(m => (
              <button
                key={m.month}
                type="button"
                disabled={m.total === 0}
                onClick={() => setOpenMonth(prev => (prev === m.month ? null : m.month))}
                className={`flex-1 rounded-lg px-2 py-1.5 text-center transition-colors disabled:cursor-default ${
                  openMonth === m.month ? 'bg-blue-50 ring-1 ring-blue-400' : 'bg-white hover:bg-slate-100'
                }`}
              >
                <div className="text-slate-500">{shortMonth(m.month)}</div>
                <div className="font-semibold text-slate-800">${formatCurrency(m.total)}</div>
              </button>
            ))}
          </div>
          {openMonth && (
            <div className="mt-2 bg-white rounded-lg p-2">
              {isLoading ? (
                <p className="text-center text-slate-500 py-1">Loading {shortMonth(openMonth)}...</p>
              ) : isError ? (
                // The transactions endpoints only accept months with full bank coverage
                <p className="text-center text-slate-500 py-1">Details aren't available for {shortMonth(openMonth)}.</p>
              ) : transactions.length > 0 ? (
                <div className="space-y-1">
                  {transactions.map((txn: any) => (
                    <div key={txn.id} className="flex justify-between gap-2">
                      <span className="truncate">
                        <span className="text-slate-400 mr-1.5">{txn.date?.slice(8, 10)}/{txn.date?.slice(5, 7)}</span>
                        {txn.description}
                      </span>
                      <span className="font-semibold text-slate-800 flex-shrink-0">${formatCurrency(txn.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 py-1">No transactions in {shortMonth(openMonth)}.</p>
              )}
            </div>
          )}
        </>
      ) : (
        <p className="text-slate-500 mt-0.5">No history yet, so this month's spend is used</p>
      )}
    </div>
  );
};

export default AverageBreakdown;
