import React, { useEffect, useMemo } from 'react';
import { useViewMonth } from '../contexts/MonthContext';

interface MonthPickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Month picker as a bottom sheet (centered dialog from `sm` up), built on the
 * same shell as TransactionEditModal.
 *
 * Months are laid out as a calendar grid per year rather than a bare list:
 * months outside the backend's available window stay visible but disabled,
 * which explains the limit without words.
 */
const MonthPickerSheet: React.FC<MonthPickerSheetProps> = ({ isOpen, onClose }) => {
  const { viewMonth, isCurrentMonth, availableMonths, setMonth, resetToCurrent } = useViewMonth();

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const currentMonth = availableMonths.find(m => m.is_current)?.month;
  const activeMonth = viewMonth ?? currentMonth;
  const available = useMemo(() => new Set(availableMonths.map(m => m.month)), [availableMonths]);
  const oldest = availableMonths[availableMonths.length - 1];

  // Newest year first, matching the list order from the backend.
  const years = useMemo(() => {
    if (availableMonths.length === 0) return [];
    const newest = Number(availableMonths[0].month.slice(0, 4));
    const oldestYear = Number(availableMonths[availableMonths.length - 1].month.slice(0, 4));
    const result: number[] = [];
    for (let y = newest; y >= oldestYear; y--) result.push(y);
    return result;
  }, [availableMonths]);

  if (!isOpen) return null;

  const pick = (month: string) => {
    setMonth(month);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
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
          .month-sheet { animation: scaleIn 0.2s ease-out; }
        }
        @media (max-width: 639px) {
          .month-sheet { animation: slideUp 0.3s ease-out; }
        }
      `}</style>

      <div className="absolute inset-0" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="month-sheet-title"
        className="month-sheet relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md max-h-[90vh] flex flex-col"
      >
        {/* Grab handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-2">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        <div className="px-4 pt-3 pb-3 sm:pt-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 id="month-sheet-title" className="text-lg font-bold text-slate-900">Select month</h2>
            <p className="text-sm text-slate-500">Every screen will show this month</p>
          </div>
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

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {years.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">Loading months…</div>
          ) : (
            years.map(year => (
              <section key={year}>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 px-1">{year}</h3>
                <div className="grid grid-cols-3 gap-2">
                  {MONTH_ABBR.map((abbr, i) => {
                    const month = `${year}-${String(i + 1).padStart(2, '0')}`;
                    const isAvailable = available.has(month);
                    const isSelected = month === activeMonth;
                    const isNow = month === currentMonth;

                    let tone: string;
                    if (isSelected) tone = 'bg-blue-600 text-white shadow-sm';
                    else if (!isAvailable) tone = 'bg-transparent text-slate-300 cursor-not-allowed';
                    else if (isNow) tone = 'bg-white ring-1 ring-blue-300 text-blue-700 hover:bg-blue-50';
                    else tone = 'bg-slate-50 text-slate-800 hover:bg-slate-100';

                    return (
                      <button
                        key={month}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => pick(month)}
                        aria-pressed={isSelected}
                        className={`relative rounded-xl py-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${tone}`}
                      >
                        {abbr}
                        {isNow && (
                          <span className={`block text-[10px] leading-none mt-0.5 font-semibold ${isSelected ? 'text-blue-100' : 'text-blue-500'}`}>
                            Now
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))
          )}

          {oldest && (
            <p className="text-xs text-slate-500 px-1">
              {availableMonths.length === 1
                ? 'Past months appear here once your bank has a full month of history.'
                : `History goes back to ${oldest.label}, based on when your bank data begins.`}
            </p>
          )}
        </div>

        {!isCurrentMonth && (
          <div className="p-4 border-t border-slate-200">
            <button
              onClick={() => { resetToCurrent(); onClose(); }}
              className="w-full px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
            >
              Jump to current month
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthPickerSheet;
