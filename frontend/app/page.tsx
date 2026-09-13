"use client";

import { useEffect, useState } from "react";
import { api, Customer, Transaction } from "../lib/api";

type Step = "amount" | "customer" | "homeuse";

const HOME_USE_TAGS: { value: "FOR_SALE" | "NEAR_EXPIRED" | "GRANDMA"; label: string }[] = [
  { value: "FOR_SALE", label: "ทำขาย" },
  { value: "NEAR_EXPIRED", label: "ใกล้เสีย" },
  { value: "GRANDMA", label: "ของย่า" },
];

export default function RapidEntryPage() {
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<Step>("amount");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [todayList, setTodayList] = useState<Transaction[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getCustomers().then(setCustomers).catch(() => setCustomers([]));
    refreshToday();
  }, []);

  function refreshToday() {
    api.listTodayTransactions().then(setTodayList).catch(() => {});
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1500);
  }

  function pressDigit(d: string) {
    if (d === "." && amount.includes(".")) return;
    if (amount.replace(".", "").length >= 7) return;
    setAmount((prev) => prev + d);
  }

  function backspace() {
    setAmount((prev) => prev.slice(0, -1));
  }

  function clearAll() {
    setAmount("");
    setStep("amount");
  }

  const numericAmount = Number(amount || "0");

  async function saveCash() {
    if (!numericAmount) return;
    setSaving(true);
    try {
      await api.createIncome([{ amount: numericAmount, payment_method: "CASH" }]);
      showToast(`บันทึก ${numericAmount} บาท (เงินสด)`);
      clearAll();
      refreshToday();
    } finally {
      setSaving(false);
    }
  }

  async function saveTransfer() {
    if (!numericAmount) return;
    setSaving(true);
    try {
      await api.createIncome([{ amount: numericAmount, payment_method: "TRANSFER" }]);
      showToast(`บันทึก ${numericAmount} บาท (เงินโอน)`);
      clearAll();
      refreshToday();
    } finally {
      setSaving(false);
    }
  }

  async function saveDebt(customer: Customer) {
    if (!numericAmount) return;
    setSaving(true);
    try {
      await api.createIncome([
        { amount: numericAmount, payment_method: "DEBT", customer_id: customer.customer_id },
      ]);
      showToast(`บันทึก ${numericAmount} บาท (แปะโป้ง: ${customer.nickname || customer.name})`);
      clearAll();
      refreshToday();
    } finally {
      setSaving(false);
    }
  }

  async function saveHomeUse(tag: "FOR_SALE" | "NEAR_EXPIRED" | "GRANDMA") {
    if (!numericAmount) return;
    setSaving(true);
    try {
      await api.createHomeUse([{ amount: numericAmount, home_use_tag: tag }]);
      const label = HOME_USE_TAGS.find((t) => t.value === tag)?.label;
      showToast(`บันทึก ${numericAmount} บาท (ใช้ในบ้าน: ${label})`);
      clearAll();
      refreshToday();
    } finally {
      setSaving(false);
    }
  }

  async function handleVoid(id: number) {
    await api.voidTransaction(id, "ลบโดยผู้ใช้งานหน้าจอรับเงิน");
    refreshToday();
  }

  const labelFor = (t: Transaction) => {
    if (t.entry_type === "INCOME") {
      if (t.payment_method === "CASH") return "เงินสด";
      if (t.payment_method === "TRANSFER") return "เงินโอน";
      if (t.payment_method === "DEBT") {
        const c = customers.find((c) => c.customer_id === t.customer_id);
        return `แปะโป้ง (${c?.nickname || c?.name || "ลูกค้า"})`;
      }
    }
    if (t.entry_type === "HOME_USE") {
      const tag = HOME_USE_TAGS.find((h) => h.value === t.home_use_tag);
      return `ใช้ในบ้าน (${tag?.label || ""})`;
    }
    return t.entry_type;
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold">บันทึกรายรับ</h1>
        <p className="text-ink/60">พิมพ์ยอดเงิน แล้วเลือกหมวด</p>
      </header>

      {/* Amount display */}
      <div className="rounded-2xl bg-white/60 py-6 text-center">
        <span className="tabular-nums text-5xl font-bold">฿{amount || "0"}</span>
      </div>

      {step === "amount" && (
        <>
          {/* Numpad */}
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

          {/* Category buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              disabled={!numericAmount || saving}
              onClick={saveCash}
              className="h-24 rounded-xl bg-cash text-xl font-bold text-white disabled:opacity-40"
            >
              เงินสด
            </button>
            <button
              disabled={!numericAmount || saving}
              onClick={saveTransfer}
              className="h-24 rounded-xl bg-transfer text-xl font-bold text-white disabled:opacity-40"
            >
              เงินโอน
            </button>
            <button
              disabled={!numericAmount || saving}
              onClick={() => setStep("customer")}
              className="h-24 rounded-xl bg-debt text-xl font-bold text-white disabled:opacity-40"
            >
              แปะโป้ง
            </button>
            <button
              disabled={!numericAmount || saving}
              onClick={() => setStep("homeuse")}
              className="h-24 rounded-xl bg-homeuse text-xl font-bold text-white disabled:opacity-40"
            >
              ใช้ในบ้าน
            </button>
          </div>
        </>
      )}

      {step === "customer" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">เลือกลูกค้า</h2>
            <button onClick={() => setStep("amount")} className="text-ink/60 underline">
              ยกเลิก
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {customers
              .filter((c) => true)
              .map((c) => (
                <button
                  key={c.customer_id}
                  onClick={() => saveDebt(c)}
                  disabled={saving}
                  className="h-20 rounded-xl bg-white text-lg font-semibold shadow-sm active:bg-line"
                >
                  {c.nickname || c.name}
                </button>
              ))}
          </div>
          {customers.length === 0 && (
            <p className="text-ink/60">ยังไม่มีรายชื่อลูกค้า เพิ่มได้ที่หน้า &quot;แปะโป้ง&quot;</p>
          )}
        </div>
      )}

      {step === "homeuse" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">ประเภทของที่หยิบใช้</h2>
            <button onClick={() => setStep("amount")} className="text-ink/60 underline">
              ยกเลิก
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {HOME_USE_TAGS.map((tag) => (
              <button
                key={tag.value}
                onClick={() => saveHomeUse(tag.value)}
                disabled={saving}
                className="h-20 rounded-xl bg-homeuse/90 text-xl font-bold text-white active:bg-homeuse"
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Today's entries */}
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">รายการวันนี้</h2>
        {todayList.length === 0 && <p className="text-ink/50">ยังไม่มีรายการ</p>}
        <ul className="flex flex-col gap-2">
          {todayList.map((t) => (
            <li
              key={t.transaction_id}
              className="flex items-center justify-between rounded-xl bg-white/70 px-4 py-3"
            >
              <div>
                <p className="tabular-nums font-semibold">฿{t.amount}</p>
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

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 rounded-full bg-ink px-5 py-2 text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
