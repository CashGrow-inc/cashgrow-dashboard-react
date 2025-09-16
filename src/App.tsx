import React, { useEffect, useMemo, useState } from 'react';
import './styles/dashboard.css';
import { fetchAccounts, fetchTransactions, fetchCategoryMap } from './services/api';

type Txn = Awaited<ReturnType<typeof fetchTransactions>>[number];
type CatMap = Awaited<ReturnType<typeof fetchCategoryMap>>;

const ymKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const fmtMoney = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 2 });

const catPrimary = (t: Txn) => t.personal_finance_category?.primary || 'UNCATEGORIZED';
const catDetailed = (t: Txn) => t.personal_finance_category?.detailed || 'UNKNOWN';

export function App() {
  const [catMap, setCatMap] = useState<CatMap | null>(null);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [loading, setLoading] = useState(true);

  const mapPrimaryGroup = (code: string) => {
    const mc = catMap?.primary?.[code]?.mainCategory;
    return !mc || mc === 'Unassigned' ? 'Unplanned Expenses' : mc;
  };
  const mapDetailedLabel = (code: string) => catMap?.detailed?.[code]?.label || code.replace(/_/g, ' ');
  const groupOrder = (g: string) => {
    const arr = catMap?.mainCategories ?? [];
    const i = arr.indexOf(g);
    return i === -1 ? Number.POSITIVE_INFINITY : i;
  };

  useEffect(() => {
    (async () => {
      try {
        const [cm, accounts] = await Promise.all([fetchCategoryMap().catch(() => null), fetchAccounts()]);
        setCatMap(cm);
        // Pick first account with txns
        for (const a of accounts) {
          const t = await fetchTransactions({ accountId: a.id, limit: 1 });
          if (t.length) {
            const all = await fetchTransactions({ accountId: a.id });
            setTxns(all);
            setLoading(false);
            return;
          }
        }
        if (accounts[0]) {
          const all = await fetchTransactions({ accountId: accounts[0].id });
          setTxns(all);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const view = useMemo(() => {
    if (!txns.length) {
      return { curKey: '', prevKey: '', minDate: null as Date | null, maxDate: null as Date | null, txnsCur: [] as Txn[], groups: [] as { name: string; total: number; details: { code: string; label: string; rowsCur: Txn[]; sumCur: number; prevSum: number }[] }[], totalsByGroup: new Map<string, number>(), prevTotalsByGroup: new Map<string, number>(), leftForUnplanned: 0 };
    }
    let minDate: Date | null = null, maxDate: Date | null = null;
    for (const t of txns) {
      const d = new Date(t.date);
      if (!isNaN(d.getTime())) { if (!minDate || d < minDate) minDate = d; if (!maxDate || d > maxDate) maxDate = d; }
    }
    const curRef = maxDate || new Date();
    const prevRef = new Date(curRef.getFullYear(), curRef.getMonth() - 1, 1);
    const curKey = ymKey(curRef), prevKey = ymKey(prevRef);

    // Aggregate by primary + detailed with per-month sums
    const byPrimary = new Map<string, { byDetailed: Map<string, { rows: Txn[] }>; byMonth: Map<string, number> }>();
    for (const t of txns) {
      const p = catPrimary(t); const dcode = catDetailed(t); const d = new Date(t.date); const amt = Number(t.amount) || 0;
      if (!byPrimary.has(p)) byPrimary.set(p, { byDetailed: new Map(), byMonth: new Map() });
      const P = byPrimary.get(p)!;
      if (!P.byDetailed.has(dcode)) P.byDetailed.set(dcode, { rows: [] });
      P.byDetailed.get(dcode)!.rows.push(t);
      if (!isNaN(d.getTime())) { const k = ymKey(d); P.byMonth.set(k, (P.byMonth.get(k) || 0) + amt); }
    }

    // Build group totals and detailed aggregation per group
    const totalsByGroup = new Map<string, number>();
    const prevTotalsByGroup = new Map<string, number>();
    const detailAggByGroup = new Map<string, Map<string, { rowsCur: Txn[]; sumCur: number; prevSum: number }>>();

    for (const [pcode, P] of byPrimary) {
      const group = mapPrimaryGroup(pcode);
      const curSum = P.byMonth.get(curKey) || 0;
      const prevSum = P.byMonth.get(prevKey) || 0;
      if (curSum) totalsByGroup.set(group, (totalsByGroup.get(group) || 0) + curSum);
      if (prevSum) prevTotalsByGroup.set(group, (prevTotalsByGroup.get(group) || 0) + prevSum);

      // Aggregate detailed for current month only
      for (const [dcode, D] of P.byDetailed) {
        const rowsCur = D.rows.filter(r => ymKey(new Date(r.date)) === curKey);
        if (!rowsCur.length) continue;
        const sumCur = rowsCur.reduce((s, t) => s + (Number(t.amount) || 0), 0);
        const prevSumDet = D.rows.filter(r => ymKey(new Date(r.date)) === prevKey).reduce((s, t) => s + (Number(t.amount) || 0), 0);
        if (!detailAggByGroup.has(group)) detailAggByGroup.set(group, new Map());
        const grp = detailAggByGroup.get(group)!;
        const cur = grp.get(dcode) || { rowsCur: [] as Txn[], sumCur: 0, prevSum: 0 };
        cur.rowsCur.push(...rowsCur); cur.sumCur += sumCur; cur.prevSum += prevSumDet;
        grp.set(dcode, cur);
      }
    }

    const groups = Array.from(detailAggByGroup.entries())
      .map(([name, mp]) => ({ name, total: totalsByGroup.get(name) || 0, details: Array.from(mp.entries()).map(([code, v]) => ({ code, label: mapDetailedLabel(code), ...v })) }))
      .filter(g => g.total !== 0)
      .sort((a, b) => {
        const ga = groupOrder(a.name), gb = groupOrder(b.name);
        return ga - gb;
      });

    const leftForUnplanned = (prevTotalsByGroup.get('Income') || 0)
      + (prevTotalsByGroup.get('Fixed Costs') || 0)
      + (prevTotalsByGroup.get('Variable Expenses') || 0)
      - (totalsByGroup.get('Unplanned Expenses') || 0);

    const txnsCur = txns.filter(t => ymKey(new Date(t.date)) === curKey);
    return { curKey, prevKey, minDate, maxDate, txnsCur, groups, totalsByGroup, prevTotalsByGroup, leftForUnplanned };
  }, [txns, catMap]);

  if (loading) return <div className="wrap" style={{ padding: 16 }}>Loading…</div>;

  const minStr = view.minDate ? view.minDate.toLocaleDateString() : '—';
  const maxStr = view.maxDate ? view.maxDate.toLocaleDateString() : '—';
  const topSum = (view.totalsByGroup.get('Income') || 0) + (view.totalsByGroup.get('Fixed Costs') || 0) + (view.totalsByGroup.get('Variable Expenses') || 0) + (view.totalsByGroup.get('Unplanned Expenses') || 0);

  return (
    <div>
      <header className="sticky">
        <div className="wrap">
          <h1>CashGrow React Dashboard</h1>
          <div className="net-card">
            <div>
              <div className="net-title">Your month ended with your cash going</div>
              <div id="netValue" className="net-value">{fmtMoney(topSum)}</div>
            </div>
            <div className="kpi">
              <div className="chip">{view.txnsCur.length} txns</div>
              <div className="chip">{minStr} - {maxStr}</div>
              <div className="chip">Amount left for unplanned: {fmtMoney(view.leftForUnplanned)}</div>
            </div>
          </div>
        </div>
      </header>
      <main className="wrap">
        <section className="grid">
          {view.groups.map(g => (
            <div key={g.name}>
              <div className="group-title">{g.name} • {fmtMoney(g.total)}</div>
              <section className="main-outline">
                <div className="cat-card">
                  {g.details.map(det => {
                    const ratio = det.prevSum ? Math.min(100, Math.abs(det.sumCur) / Math.abs(det.prevSum) * 100) : (det.sumCur ? 100 : 0);
                    return (
                      <details key={det.code} className="sub-card">
                        <summary>
                          <span>{det.label}</span>
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
              </section>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

