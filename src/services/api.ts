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

export class ApiError extends Error {
  status: number;
  payload: any;

  constructor(message: string, status: number, payload: any) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

async function request(path: string, init: RequestInit = {}): Promise<any> {
  const url = path.startsWith('http://') || path.startsWith('https://') ? path : `${API}${path}`;
  const headers = new Headers(init.headers ?? {});
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...init, headers });
  const text = response.status === 204 ? '' : await response.text();
  let payload: any = undefined;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const message = typeof payload === 'object' && payload?.error
      ? String(payload.error)
      : `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, payload);
  }

  return payload;
}

async function getJson(paths: string[]): Promise<any> {
  let lastErr: unknown;
  for (const p of paths) {
    try {
      return await request(p);
    } catch (err) {
      lastErr = err;
    }
  }
  if (lastErr) throw lastErr;
  throw new Error('All API endpoints failed');
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
      const data = await request(p);
      return data as CategoryMap;
    } catch {}
  }
  throw new Error("Category map not available");
}

export async function fetchPlaidItem(): Promise<any> {
  return await request('/api/plaid/item');
}

export async function createLinkToken(): Promise<{ link_token: string }> {
  return await request('/api/plaid/link-token', { method: 'POST' });
}

export async function exchangePublicToken(publicToken: string): Promise<void> {
  await request('/api/plaid/exchange-public-token', {
    method: 'POST',
    body: JSON.stringify({ public_token: publicToken })
  });
}

export async function logoutPlaid(): Promise<void> {
  await request('/api/plaid/logout', { method: 'POST' });
}


