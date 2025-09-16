const API = (globalThis as any).CASHGROW_API ?? "http://localhost:4000";

export interface Account { id: string; name: string; currency: string; }
export interface Transaction {
  id?: string;
  account_id: string;
  name: string;
  amount: number;
  iso_currency_code: string;
  date: string;
  personal_finance_category: { primary: string; detailed: string };
  categoryDisplay?: string;
}

export interface CategoryMap {
  version: number;
  generatedAt: string;
  mainCategories: string[];
  primary: Record<string, { label: string; mainCategory: string; details: string[] }>;
  detailed: Record<string, { label: string; primary: string; description?: string }>;
}

async function getJson(paths: string[]): Promise<any> {
  let lastErr: any;
  for (const p of paths) {
    try {
      const r = await fetch(`${API}${p}`);
      if (!r.ok) { lastErr = new Error(`HTTP ${r.status}`); continue; }
      return await r.json();
    } catch (e) { lastErr = e; }
  }
  throw lastErr ?? new Error("All API endpoints failed");
}

export async function fetchAccounts(): Promise<Account[]> {
  const rows = await getJson(["/api/accounts", "/accounts"]);
  return (rows as any[]).map((x: any) => ({
    id: x.id ?? x.account_id ?? x.accountId ?? "",
    name: x.name ?? x.official_name ?? "",
    currency: x.currency ?? x.iso_currency_code ?? x.balances?.iso_currency_code ?? ""
  }));
}

export async function fetchTransactions(p: { accountId?: string; from?: string; to?: string; limit?: number; offset?: number } = {}): Promise<Transaction[]> {
  const rows = await getJson(["/api/transactions", "/transactions"]);
  let mapped: Transaction[] = (rows as any[]).map((x: any) => ({
    id: x.id ?? x.transaction_id ?? undefined,
    account_id: x.account_id,
    name: x.merchant_name ?? x.name,
    amount: Number(x.amount),
    iso_currency_code: x.iso_currency_code ?? "",
    date: x.date,
    personal_finance_category: {
      primary: x.personal_finance_category?.primary ?? x.category_primary ?? "",
      detailed: x.personal_finance_category?.detailed ?? x.category_detailed ?? ""
    },
    categoryDisplay: x.category_display ?? undefined
  }));
  if (p.accountId) mapped = mapped.filter(t => t.account_id === p.accountId);
  if (p.from) mapped = mapped.filter(t => t.date >= p.from!);
  if (p.to) mapped = mapped.filter(t => t.date <= p.to!);
  if (p.offset) mapped = mapped.slice(p.offset);
  if (p.limit) mapped = mapped.slice(0, p.limit);
  return mapped;
}

export async function fetchCategoryMap(): Promise<CategoryMap> {
  const tryPaths = ["/api/category-map", "/category-map", "/data/category-map.json"];
  for (const p of tryPaths) {
    try {
      const r = await fetch(`${API}${p}`);
      if (!r.ok) continue;
      return (await r.json()) as CategoryMap;
    } catch {}
  }
  throw new Error("Category map not available");
}

