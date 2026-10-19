import React from 'react';
import { useViewMonth } from '../contexts/MonthContext';

interface MonthBarProps {
  onOpenPicker: () => void;
}

const Chevron: React.FC<{ direction: 'left' | 'right' | 'down'; className?: string }> = ({ direction, className }) => {
  const d = direction === 'left' ? 'M15.75 19.5L8.25 12l7.5-7.5'
    : direction === 'right' ? 'M8.25 4.5l7.5 7.5-7.5 7.5'
    : 'M19.5 8.25l-7.5 7.5-7.5-7.5';
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
};

/**
 * The always-visible month switcher under the header: arrows step through the
 * available months, the label opens the full picker. Viewing a past month
 * tints the bar blue and offers a one-tap way back, so it's never mistaken
 * for the live month.
 */
const MonthBar: React.FC<MonthBarProps> = ({ onOpenPicker }) => {
  const { isCurrentMonth, selectedLabel, canPrev, canNext, goPrev, goNext, resetToCurrent, availableMonths } = useViewMonth();
  const showArrows = availableMonths.length > 1;

  const arrowClass =
    'w-9 h-9 flex items-center justify-center rounded-full transition-colors ' +
    'text-slate-600 hover:bg-slate-100 disabled:text-slate-300 disabled:hover:bg-transparent disabled:cursor-default ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

  return (
    <div className="px-4 pb-3">
      <div
        className={`flex items-center justify-between rounded-2xl p-1 transition-colors duration-300 ${
          isCurrentMonth ? 'bg-white shadow-sm' : 'bg-blue-50 ring-1 ring-blue-100'
        }`}
      >
        {showArrows ? (
          <button onClick={goPrev} disabled={!canPrev} className={arrowClass} aria-label="Previous month">
            <Chevron direction="left" className="w-5 h-5" />
          </button>
        ) : (
          <span className="w-9" />
        )}

        <button
          onClick={onOpenPicker}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-900/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label={`Viewing ${selectedLabel}. Change month`}
        >
          <svg className={`w-4 h-4 ${isCurrentMonth ? 'text-slate-400' : 'text-blue-500'}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <span className={`text-base font-semibold ${isCurrentMonth ? 'text-slate-800' : 'text-blue-700'}`}>
            {selectedLabel}
          </span>
          <Chevron direction="down" className={`w-4 h-4 ${isCurrentMonth ? 'text-slate-400' : 'text-blue-500'}`} />
        </button>

        {showArrows ? (
          <button onClick={goNext} disabled={!canNext} className={arrowClass} aria-label="Next month">
            <Chevron direction="right" className="w-5 h-5" />
          </button>
        ) : (
          <span className="w-9" />
        )}
      </div>

      {!isCurrentMonth && (
        <div className="flex items-center justify-center gap-2 mt-2 text-xs">
          <span className="text-slate-500">Viewing a past month</span>
          <span className="text-slate-300">·</span>
          <button onClick={resetToCurrent} className="font-semibold text-blue-600 hover:text-blue-800">
            Back to current month
          </button>
        </div>
      )}
    </div>
  );
};

export default MonthBar;
