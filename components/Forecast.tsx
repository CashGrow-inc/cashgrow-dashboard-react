import React from 'react';
import { CategoryForecast } from '../AuthContext';
import { GroupForecast } from '../hooks/financeQueries';

// Forecasts are estimates, so they are shown as whole dollars and phrased as
// "about" / "on track for". Actual spend keeps cents via formatCurrency.
export const formatRounded = (amount: number): string =>
  `$${Math.round(amount).toLocaleString('en-US')}`;

/** Within this share of the usual amount reads as "about usual". */
const NEUTRAL_BAND = 0.05;
/** Beyond this share over the usual amount the label turns red rather than amber. */
const OVER_RED_BAND = 0.2;

type Tone = 'good' | 'neutral' | 'warn' | 'bad';

const toneClasses: Record<Tone, string> = {
  good: 'bg-green-100 text-green-700',
  neutral: 'bg-slate-100 text-slate-600',
  warn: 'bg-amber-100 text-amber-700',
  bad: 'bg-red-100 text-red-700',
};

/**
 * `difference` is history_average - forecast (positive = spending less than
 * usual). `isFinal` drops the "~" for a past month, where the amount is real.
 * Returns null for a new category (no history), which gets no comparison.
 */
function forecastStatus(difference: number, average: number, isFinal: boolean) {
  if (average <= 0) return null;
  if (Math.abs(difference) <= NEUTRAL_BAND * average) {
    return { tone: 'neutral' as Tone, text: 'about usual' };
  }
  const amount = `${isFinal ? '' : '~'}${formatRounded(Math.abs(difference))}`;
  if (difference > 0) return { tone: 'good' as Tone, text: `${amount} under your usual` };
  const tone: Tone = -difference > OVER_RED_BAND * average ? 'bad' : 'warn';
  return { tone, text: `${amount} over your usual` };
}

export const ForecastStatus: React.FC<{ difference: number; average: number; isFinal: boolean }> = ({
  difference,
  average,
  isFinal,
}) => {
  const status = forecastStatus(difference, average, isFinal);
  if (!status) return null;
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${toneClasses[status.tone]}`}>
      {status.text}
    </span>
  );
};

/**
 * Filled to `spent`, a lighter extension up to the forecast with a ring marker
 * on it, and a thin tick at the usual amount. All three share one scale, so
 * the bar is never clipped and an over-usual month visibly passes the tick.
 */
export const ForecastBar: React.FC<{
  spent: number;
  forecast: number;
  average: number;
  showForecast: boolean;
  color?: string;
}> = ({ spent, forecast, average, showForecast, color = 'bg-blue-600' }) => {
  const scale = Math.max(spent, showForecast ? forecast : 0, average) || 1;
  const pct = (value: number) => `${Math.min(100, (value / scale) * 100)}%`;
  const label = showForecast
    ? `Spent ${formatRounded(spent)}, on track for about ${formatRounded(forecast)}, usual ${formatRounded(average)}`
    : `Spent ${formatRounded(spent)}, usual ${formatRounded(average)}`;
  return (
    <div className="relative w-full h-2 bg-slate-200 rounded-full" role="img" aria-label={label}>
      {showForecast && forecast > spent && (
        <div className={`absolute inset-y-0 left-0 rounded-full ${color} opacity-30`} style={{ width: pct(forecast) }} />
      )}
      <div className={`absolute inset-y-0 left-0 rounded-full ${color}`} style={{ width: pct(spent) }} />
      {average > 0 && (
        <div
          className="absolute -top-1 -bottom-1 w-0.5 bg-slate-600 -translate-x-1/2"
          style={{ left: pct(average) }}
          title={`Usual ${formatRounded(average)}`}
        />
      )}
      {showForecast && (
        <div
          className="absolute top-1/2 w-3 h-3 rounded-full bg-white border-2 border-slate-700 -translate-x-1/2 -translate-y-1/2"
          style={{ left: pct(forecast) }}
          title={`On track for about ${formatRounded(forecast)}`}
        />
      )}
    </div>
  );
};

/**
 * The bar and the wording under it for one category row.
 * - current month: "On track for ~$963 (usual $1,725)" + status label
 * - past month: the final amount against the usual, no "on track"
 * - new category (no history): "spent so far" only, no comparison
 */
export const ForecastDetail: React.FC<{
  forecast: CategoryForecast;
  isCurrentMonth: boolean;
  color?: string;
}> = ({ forecast, isCurrentMonth, color }) => {
  const { spent, history_average: average, difference_from_average: difference } = forecast;

  if (average <= 0) {
    return (
      <p className="text-xs text-slate-500 mt-2">
        {isCurrentMonth ? `${formatRounded(spent)} spent so far` : `${formatRounded(spent)} spent`} · new category
      </p>
    );
  }

  return (
    <>
      <div className="mt-3">
        <ForecastBar
          spent={spent}
          forecast={forecast.forecast}
          average={average}
          showForecast={isCurrentMonth}
          color={color}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 mt-2">
        <span className="text-xs text-slate-500">
          {isCurrentMonth
            ? <>On track for ~{formatRounded(forecast.forecast)} <span className="text-slate-400">(usual {formatRounded(average)})</span></>
            : <>Usual {formatRounded(average)}</>}
        </span>
        <ForecastStatus difference={difference} average={average} isFinal={!isCurrentMonth} />
      </div>
    </>
  );
};

/** The summary line for a screen's total card, from the group's totals. */
export const ForecastSummary: React.FC<{ forecast: GroupForecast; isCurrentMonth: boolean }> = ({
  forecast,
  isCurrentMonth,
}) => {
  const { totalForecast, totalHistoryAverage, daysElapsed, daysInMonth } = forecast;
  const difference = totalHistoryAverage - totalForecast;
  return (
    <div className="mt-3 pt-3 border-t border-slate-200 space-y-1">
      {isCurrentMonth && (
        <div className="flex justify-between items-baseline gap-2 text-sm">
          <span className="text-slate-500">On track for</span>
          <span className="font-semibold text-slate-700">about {formatRounded(totalForecast)}</span>
        </div>
      )}
      {totalHistoryAverage > 0 && (
        <div className="flex justify-between items-baseline gap-2 text-sm">
          <span className="text-slate-500">Usual</span>
          <span className="font-semibold text-slate-700">{formatRounded(totalHistoryAverage)}</span>
        </div>
      )}
      <div className="flex flex-wrap justify-between items-center gap-2 pt-1">
        <span className="text-xs text-slate-400">
          {isCurrentMonth && daysInMonth > 0 ? `Day ${daysElapsed} of ${daysInMonth}` : ''}
        </span>
        <ForecastStatus difference={difference} average={totalHistoryAverage} isFinal={!isCurrentMonth} />
      </div>
    </div>
  );
};
