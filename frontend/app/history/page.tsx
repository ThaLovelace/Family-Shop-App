"use client";

import { useEffect, useState } from "react";
import { api, Customer, DailySummary, INCOME_CATEGORIES, Transaction } from "../../lib/api";
import BackButton from "../../lib/ui/BackButton";

const HOME_USE_LABELS: Record<string, string> = {
  FOR_SALE: "ทำขาย",
  NEAR_EXPIRED: "ใกล้เสีย",
  GRANDMA: "ของย่า",
};

const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  FRESH_MARKET: "ของสดตลาด",
  BEVERAGE: "เครื่องดื่ม",
  GROCERY_OTHER: "ของชำอื่นๆ",
};

function addDays(dateStr: string, delta: number) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + delta);
  return d.toISOString().slice(0, 10);
}

function formatThaiDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("th-TH-u-ca-buddhist", { day: "numeric", month: "long", year: "numeric" });
}

export default function HistoryPage() {
  const [date, setDate] = useState(api.today());
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [list, setList] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    api.getCustomers().then(setCustomers).catch(() => setCustomers([]));
  }, []);

  useEffect(() => {
    load(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  function load(d: string) {
    api.getDailySummary(d).then(setSummary).catch(() => setSummary(null));
    api.listTransactionsByDate(d).then(setList).catch(() => setList([]));
  }

  async function handleVoid(id: number) {
    await api.voidTransaction(id, "ลบโดยผู้ใช้งานหน้าประวัติ");
    load(date);
  }

  const isToday = date === api.today();

  function labelFor(t: Transaction) {
    if (t.entry_type === "INCOME") {
      const categoryLabel = INCOME_CATEGORIES.find((c) => c.value === t.income_category)?.label;
      const suffix = categoryLabel ? ` · ${categoryLabel}` : "";
      if (t.payment_method === "CASH") return `รับเงินสด${suffix}`;
      if (t.payment_method === "TRANSFER") return `รับเงินโอน${suffix}`;
      if (t.payment_method === "DEBT") {
        const c = customers.find((c) => c.customer_id === t.customer_id);
        return `แปะโป้ง (${c?.nickname || c?.name || "ลูกค้า"})${suffix}`;
      }
    }
    if (t.entry_type === "EXPENSE") {
      return `จ่าย: ${EXPENSE_CATEGORY_LABELS[t.expense_category || ""] || t.expense_category}`;
    }
    if (t.entry_type === "HOME_USE") {
      return `ใช้ในบ้าน (${HOME_USE_LABELS[t.home_use_tag || ""] || ""})`;
    }
    return t.entry_type;
  }

  const sign = (t: Transaction) => (t.entry_type === "INCOME" ? "+" : "-");

  return (
    <div className="flex flex-col gap-6">
      <BackButton />
      <header>
        <h1 className="text-2xl font-bold">ประวัติ</h1>
      </header>

      {/* Day navigator */}
      <div className="flex items-center justify-between rounded-2xl bg-white/70 p-3">
        <button
          onClick={() => setDate((d) => addDays(d, -1))}
          className="h-14 w-14 rounded-xl bg-white text-2xl font-bold shadow-sm active:bg-line"
          aria-label="วันก่อนหน้า"
        >
          ‹
        </button>
        <div className="text-center">
          <p className="text-lg font-semibold">{formatThaiDate(date)}</p>
          {isToday && <p className="text-sm text-ink/50">วันนี้</p>}
        </div>
        <button
          onClick={() => setDate((d) => addDays(d, 1))}
          disabled={isToday}
          className="h-14 w-14 rounded-xl bg-white text-2xl font-bold shadow-sm active:bg-line disabled:opacity-30"
          aria-label="วันถัดไป"
        >
          ›
        </button>
      </div>

      {/* Daily summary */}
      {summary && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-cash/10 p-4">
            <p className="text-sm text-ink/60">รับสด</p>
            <p className="tabular-nums text-xl font-bold">฿{summary.total_cash_income}</p>
          </div>
          <div className="rounded-xl bg-transfer/10 p-4">
            <p className="text-sm text-ink/60">รับโอน</p>
            <p className="tabular-nums text-xl font-bold">฿{summary.total_transfer_income}</p>
          </div>
          <div className="rounded-xl bg-debt/10 p-4">
            <p className="text-sm text-ink/60">แปะโป้ง</p>
            <p className="tabular-nums text-xl font-bold">฿{summary.total_debt_income}</p>
          </div>
          <div className="rounded-xl bg-red-500/10 p-4">
            <p className="text-sm text-ink/60">จ่ายทั้งหมด</p>
            <p className="tabular-nums text-xl font-bold">฿{summary.total_expense}</p>
          </div>
        </div>
      )}

      {/* Transaction list */}
      <section className="flex flex-col gap-2">
        {list.length === 0 && <p className="text-ink/50">ไม่มีรายการวันนี้</p>}
        <ul className="flex flex-col gap-2">
          {list.map((t) => (
            <li
              key={t.transaction_id}
              className="flex items-center justify-between rounded-xl bg-white/70 px-4 py-3"
            >
              <div>
                <p className="tabular-nums font-semibold">
                  {sign(t)}฿{t.amount}
                </p>
                <p className="text-sm text-ink/60">{labelFor(t)}</p>
              </div>
              <button
                onClick={() => handleVoid(t.transaction_id)}
                className="h-11 w-11 rounded-full bg-red-100 text-lg text-red-700"
                aria-label="ลบรายการนี้"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
