"use client";

import { useState } from "react";
import { api } from "../../lib/api";
import BackButton from "../../lib/ui/BackButton";

type Category = "FRESH_MARKET" | "BEVERAGE" | "GROCERY_OTHER";
type Source = "DRAWER_CASH" | "CREDIT_CARD" | "FAMILY_SHOPEE";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "FRESH_MARKET", label: "ของสดตลาด" },
  { value: "BEVERAGE", label: "สุรา/เครื่องดื่ม" },
  { value: "GROCERY_OTHER", label: "ของชำ/อื่นๆ" },
];

const SOURCES: { value: Source; label: string }[] = [
  { value: "DRAWER_CASH", label: "เงินในลิ้นชัก" },
  { value: "CREDIT_CARD", label: "บัตรเครดิต" },
  { value: "FAMILY_SHOPEE", label: "ระบบเครือญาติ/Shopee" },
];

export default function ExpensePage() {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const numericAmount = Number(amount || "0");

  function pressDigit(d: string) {
    if (d === "." && amount.includes(".")) return;
    if (amount.replace(".", "").length >= 7) return;
    setAmount((prev) => prev + d);
  }

  function backspace() {
    setAmount((prev) => prev.slice(0, -1));
  }

  function reset() {
    setAmount("");
    setCategory(null);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1500);
  }

  async function saveExpense(source: Source) {
    if (!numericAmount || !category) return;
    setSaving(true);
    try {
      await api.createExpense([{ amount: numericAmount, expense_category: category, payment_source: source }]);
      showToast(`บันทึกรายจ่าย ${numericAmount} บาท`);
      reset();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <BackButton />
      <header>
        <h1 className="text-2xl font-bold">บันทึกรายจ่าย</h1>
        <p className="text-ink/60">พิมพ์ยอดบิล เลือกหมวด แล้วเลือกแหล่งเงิน</p>
      </header>

      <div className="rounded-2xl bg-white/60 py-6 text-center">
        <span className="tabular-nums text-5xl font-bold">฿{amount || "0"}</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", ".", "⌫"].map((key) => (
          <button
            key={key}
            onClick={() => (key === "⌫" ? backspace() : pressDigit(key))}
            className="h-16 rounded-xl bg-white text-2xl font-semibold text-ink shadow-sm active:bg-line"
          >
            {key}
          </button>
        ))}
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold">หมวดสินค้า</h2>
        <div className="grid grid-cols-1 gap-3">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`h-16 rounded-xl text-lg font-semibold shadow-sm ${
                category === c.value ? "bg-homeuse text-white" : "bg-white text-ink"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {category && (
        <div>
          <h2 className="mb-2 text-lg font-semibold">จ่ายด้วยเงินอะไร</h2>
          <div className="grid grid-cols-1 gap-3">
            {SOURCES.map((s) => (
              <button
                key={s.value}
                disabled={!numericAmount || saving}
                onClick={() => saveExpense(s.value)}
                className="h-16 rounded-xl bg-transfer text-lg font-semibold text-white disabled:opacity-40"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 rounded-full bg-ink px-5 py-2 text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
