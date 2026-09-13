const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

export type Customer = {
  customer_id: number;
  name: string;
  nickname: string | null;
  phone: string | null;
  is_family: boolean;
  is_active: boolean;
};

export type CustomerDebt = Customer & { outstanding_debt: string };

export type IncomeCategory = "ALCOHOL" | "MARKET" | "GROCERY";

export const INCOME_CATEGORIES: { value: IncomeCategory; label: string; color: string }[] = [
  { value: "ALCOHOL", label: "เหล้า", color: "bg-alcohol" },
  { value: "MARKET", label: "ตลาด", color: "bg-market" },
  { value: "GROCERY", label: "ของชำ", color: "bg-grocery" },
];

export type Transaction = {
  transaction_id: number;
  transaction_date: string;
  entry_type: "INCOME" | "EXPENSE" | "HOME_USE";
  item_description: string | null;
  amount: string;
  payment_method: string | null;
  customer_id: number | null;
  income_category: IncomeCategory | null;
  home_use_tag: string | null;
  expense_category: string | null;
  payment_source: string | null;
  is_voided: boolean;
  created_at: string;
};

export type DailySummary = {
  date: string;
  total_cash_income: string;
  total_transfer_income: string;
  total_debt_income: string;
  total_expense: string;
  total_home_use_value: string;
  net_cash_in_drawer_change: string;
};

export type DrawerStatus = "MATCH" | "MISMATCH" | "NOT_COUNTED_YET";
export type BudgetStatus = "OK" | "OVER" | "NO_BUDGET_SET";

export type HomeSummary = {
  date: string;
  cash_income_today: string;
  expected_drawer_cash: string;
  actual_drawer_count: string | null;
  drawer_status: DrawerStatus;
  market_expense_today: string;
  market_daily_budget: string | null;
  market_status: BudgetStatus;
  month_profit_so_far: string;
};

export type Settings = {
  drawer_float_amount: string;
  market_daily_budget: string | null;
};

const today = () => new Date().toISOString().slice(0, 10);

export const api = {
  today,

  getCustomers: () => request<Customer[]>("/api/customers"),

  createIncome: (
    entries: {
      amount: number;
      payment_method: "CASH" | "TRANSFER" | "DEBT";
      customer_id?: number;
      income_category?: IncomeCategory;
      item_description?: string;
    }[]
  ) =>
    request<Transaction[]>("/api/transactions/income", {
      method: "POST",
      body: JSON.stringify({
        entries: entries.map((e) => ({ transaction_date: today(), ...e })),
      }),
    }),

  createExpense: (entries: {
    amount: number;
    expense_category: "FRESH_MARKET" | "BEVERAGE" | "GROCERY_OTHER";
    payment_source: "DRAWER_CASH" | "CREDIT_CARD" | "FAMILY_SHOPEE";
    item_description?: string;
  }[]) =>
    request<Transaction[]>("/api/transactions/expense", {
      method: "POST",
      body: JSON.stringify({
        entries: entries.map((e) => ({ transaction_date: today(), ...e })),
      }),
    }),

  createHomeUse: (entries: {
    amount: number;
    home_use_tag: "FOR_SALE" | "NEAR_EXPIRED" | "GRANDMA";
    item_description?: string;
  }[]) =>
    request<Transaction[]>("/api/transactions/home-use", {
      method: "POST",
      body: JSON.stringify({
        entries: entries.map((e) => ({ transaction_date: today(), ...e })),
      }),
    }),

  listTodayTransactions: () => request<Transaction[]>(`/api/transactions?date=${today()}`),

  listTransactionsByDate: (date: string) => request<Transaction[]>(`/api/transactions?date=${date}`),

  voidTransaction: (id: number, reason: string) =>
    request<Transaction>(`/api/transactions/${id}/void`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }),

  getCustomerDebt: (id: number) => request<CustomerDebt>(`/api/customers/${id}/debt`),

  addDebtPayment: (id: number, amount: number, payment_method: "CASH" | "TRANSFER") =>
    request(`/api/customers/${id}/payments`, {
      method: "POST",
      body: JSON.stringify({ payment_date: today(), amount, payment_method }),
    }),

  getDailySummary: (date: string) => request<DailySummary>(`/api/dashboard/daily-summary?date=${date}`),

  getHomeSummary: (date: string) => request<HomeSummary>(`/api/dashboard/home-summary?date=${date}`),

  recordDrawerCount: (date: string, counted_amount: number) =>
    request<HomeSummary>("/api/dashboard/drawer-count", {
      method: "POST",
      body: JSON.stringify({ count_date: date, counted_amount }),
    }),

  getSettings: () => request<Settings>("/api/settings"),

  updateSettings: (body: { drawer_float_amount?: number; market_daily_budget?: number }) =>
    request<Settings>("/api/settings", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
};
