"use client";

import { useEffect, useState } from "react";
import { api, Customer, CustomerDebt } from "../../lib/api";
import BackButton from "../../lib/ui/BackButton";

export default function DebtsPage() {
  const [debts, setDebts] = useState<CustomerDebt[]>([]);
  const [selected, setSelected] = useState<CustomerDebt | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const customers: Customer[] = await api.getCustomers();
    const withDebt = await Promise.all(customers.map((c) => api.getCustomerDebt(c.customer_id)));
    setDebts(withDebt);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1500);
  }

  async function submitPayment(method: "CASH" | "TRANSFER") {
    if (!selected || !Number(payAmount)) return;
    setSaving(true);
    try {
      await api.addDebtPayment(selected.customer_id, Number(payAmount), method);
      showToast(`รับชำระ ${payAmount} บาท จาก ${selected.nickname || selected.name}`);
      setSelected(null);
      setPayAmount("");
      load();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <BackButton />
      <header>
        <h1 className="text-2xl font-bold">สมุดแปะโป้งออนไลน์</h1>
        <p className="text-ink/60">ยอดค้างของลูกค้าแต่ละคน</p>
      </header>

      <ul className="flex flex-col gap-3">
        {debts.map((c) => (
          <li key={c.customer_id} className="rounded-xl bg-white/70 px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">{c.nickname || c.name}</p>
                <p className="tabular-nums text-ink/70">ค้าง ฿{c.outstanding_debt}</p>
              </div>
              <button
                onClick={() => setSelected(c)}
                className="h-14 rounded-xl bg-debt px-4 font-bold text-white"
              >
                รับชำระเงิน
              </button>
            </div>
          </li>
        ))}
        {debts.length === 0 && <p className="text-ink/50">ยังไม่มีลูกหนี้ในระบบ</p>}
      </ul>

      {selected && (
        <div className="fixed inset-0 flex items-end bg-black/40" onClick={() => setSelected(null)}>
          <div
            className="w-full rounded-t-3xl bg-paper p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-1 text-xl font-bold">{selected.nickname || selected.name}</h2>
            <p className="mb-4 text-ink/60">ค้างอยู่ ฿{selected.outstanding_debt}</p>

            <input
              inputMode="decimal"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="ใส่จำนวนเงินที่จ่าย"
              className="mb-4 h-16 w-full rounded-xl border border-line bg-white px-4 text-2xl tabular-nums"
            />

            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={!Number(payAmount) || saving}
                onClick={() => submitPayment("CASH")}
                className="h-16 rounded-xl bg-cash text-lg font-bold text-white disabled:opacity-40"
              >
                จ่ายเงินสด
              </button>
              <button
                disabled={!Number(payAmount) || saving}
                onClick={() => submitPayment("TRANSFER")}
                className="h-16 rounded-xl bg-transfer text-lg font-bold text-white disabled:opacity-40"
              >
                จ่ายเงินโอน
              </button>
            </div>
            <button onClick={() => setSelected(null)} className="mt-4 w-full text-center text-ink/60 underline">
              ปิด
            </button>
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
