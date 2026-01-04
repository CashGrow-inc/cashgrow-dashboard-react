import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { formatCurrency } from './shared';

interface UnplannedScreenProps {
  onConnectBank: () => void;
}

const UnplannedScreen: React.FC<UnplannedScreenProps> = ({ onConnectBank }) => {
  const { fetchUnplanned } = useAuth();
  const [weeks, setWeeks] = useState<any[]>([]);
  const [totalUnplanned, setTotalUnplanned] = useState<number>(0);
  const [periodLabel, setPeriodLabel] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);

  React.useEffect(() => {
    const loadUnplanned = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching unplanned expenses...');
        const data = await fetchUnplanned();
        console.log('Unplanned data received:', data);

        setWeeks(data.weeks);
        setTotalUnplanned(data.total_unplanned);
        setPeriodLabel(data.period.label);
      } catch (error) {
        console.error('Failed to load unplanned expenses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUnplanned();
  }, []);

  const handleToggleWeek = (weekStart: string) => {
    setExpandedWeek(expandedWeek === weekStart ? null : weekStart);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 text-slate-500">Loading unplanned expenses...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="px-1">
        <div className="flex justify-between items-center">
          <h2 className="text-slate-800 font-bold text-xl">Unplanned</h2>
          <span className="flex items-center bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full">
            Monthly
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="text-slate-600 font-medium mb-2">Total Unplanned</h3>
        <div className="text-4xl font-bold text-orange-600">${formatCurrency(totalUnplanned)}</div>
        <p className="text-sm text-slate-500 mt-1">{periodLabel}</p>
      </div>

      {weeks.length > 0 ? (
        weeks.map((week) => {
          const isExpanded = expandedWeek === week.week_start;

          return (
            <div key={week.week_start} className="bg-white rounded-2xl shadow-sm p-4">
              <button
                onClick={() => handleToggleWeek(week.week_start)}
                className="w-full"
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="font-semibold text-slate-800">{week.week_label}</div>
                    <div className="text-xs text-slate-500">{week.week_range}</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="font-bold text-orange-600 text-xl">
                        ${formatCurrency(week.total)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {week.transactions.length} transaction{week.transactions.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  {week.transactions.length > 0 ? (
                    <div className="space-y-2">
                      {week.transactions.map((txn: any) => (
                        <div key={txn.id} className="flex justify-between items-center py-2">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-slate-700">{txn.description}</div>
                            <div className="text-xs text-slate-500">{txn.date}</div>
                          </div>
                          <div className="text-sm font-semibold text-orange-600">
                            ${formatCurrency(txn.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-slate-500 text-sm">No transactions this week</div>
                  )}
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <p className="text-slate-500">No unplanned expenses this month</p>
          <p className="text-sm text-slate-400 mt-2">Connect your bank to track unplanned spending.</p>
          <button
            onClick={onConnectBank}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-full transition duration-300"
          >
            Connect Bank
          </button>
        </div>
      )}
    </div>
  );
};

export default UnplannedScreen;
