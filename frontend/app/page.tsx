"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, HomeSummary } from "../lib/api";

export default function HomePage() {
  const [summary, setSummary] = useState<HomeSummary | null>(null);
  const [countInput, setCountInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  function load() {
    api.getHomeSummary(api.today()).then(setSummary).catch(() => setSummary(null));
  }

  async function submitCount() {
    const value = Number(countInput);
    if (!value) return;
    setSaving(true);
    try {
      const updated = await api.recordDrawerCount(api.today(), value);
      setSummary(updated);
      setCountInput("");
    } finally {
      setSaving(false);
    }
  }

  const drawerIcon =
    summary?.drawer_status === "MATCH" ? "✅" : summary?.drawer_status === "MISMATCH" ? "⚠️" : "🕘";
  const drawerText =
    summary?.drawer_status === "MATCH"
      ? "เงินทอนตรง"
      : summary?.drawer_status === "MISMATCH"
      ? "เงินทอนไม่ตรง ลองนับใหม่อีกที"
      : "ยังไม่ได้นับเงินทอนวันนี้";

  const budgetBarColor =
    summary?.market_status === "OVER"
      ? "bg-red-500"
      : summary?.market_status === "OK"
      ? "bg-market"
      : "bg-line";

  const budgetPercent =
    summary?.market_daily_budget && Number(summary.market_daily_budget) > 0
      ? Math.min(100, (Number(summary.market_expense_today) / Number(summary.market_daily_budget)) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ภาพรวมวันนี้</h1>
          <p className="text-ink/60">{summary?.date}</p>
        </div>
        <Link href="/settings" className="text-2xl" aria-label="ตั้งค่า">
          ⚙️
        </Link>
      </header>

      {/* Drawer check */}
      <div className="rounded-2xl bg-white/70 p-5">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{drawerIcon}</span>
          <div>
            <p className="text-lg font-bold">{drawerText}</p>
            {summary && (
              <p className="text-sm text-ink/60">
                ควรมี ฿{summary.expected_drawer_cash}
                {summary.actual_drawer_count ? ` · นับได้ ฿${summary.actual_drawer_count}` : ""}
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <input
            inputMode="decimal"
            value={countInput}
            onChange={(e) => setCountInput(e.target.value)}
            placeholder="นับเงินทอนได้เท่าไหร่"
            className="h-14 flex-1 rounded-xl border border-line bg-white px-4 text-xl tabular-nums"
          />
          <button
            onClick={submitCount}
            disabled={!countInput || saving}
            className="h-14 rounded-xl bg-cash px-5 text-lg font-bold text-white disabled:opacity-40"
          >
            บันทึก
          </button>
        </div>
      </div>

      {/* Market budget */}
      <div className="rounded-2xl bg-white/70 p-5">
        <p className="text-lg font-bold">งบซื้อของตลาดวันนี้</p>
        {summary?.market_status === "NO_BUDGET_SET" ? (
          <p className="mt-2 text-ink/60">
            ยังไม่ได้ตั้งงบ —{" "}
            <Link href="/settings" className="underline">
              ตั้งค่าที่นี่
            </Link>
          </p>
        ) : (
          <>
            <div className="mt-3 h-4 w-full overflow-hidden rounded-full bg-line">
              <div className={`h-full ${budgetBarColor}`} style={{ width: `${budgetPercent}%` }} />
            </div>
            <p className="mt-2 text-sm text-ink/60">
              ใช้ไป ฿{summary?.market_expense_today} จากงบ ฿{summary?.market_daily_budget}
            </p>
          </>
        )}
      </div>

      {/* Month profit */}
      <div className="rounded-2xl bg-white/70 p-5 text-center">
        <p className="text-lg font-bold">กำไรเดือนนี้ (ถึงวันนี้)</p>
        <p className="tabular-nums text-4xl font-bold text-cash">฿{summary?.month_profit_so_far ?? "-"}</p>
      </div>

      {/* Shortcuts */}
      <div className="grid grid-cols-3 gap-3">
        <Link
          href="/income"
          className="flex h-20 items-center justify-center rounded-xl bg-cash text-lg font-bold text-white"
        >
          รับเงิน
        </Link>
        <Link
          href="/expense"
          className="flex h-20 items-center justify-center rounded-xl bg-transfer text-lg font-bold text-white"
        >
          จ่ายเงิน
        </Link>
        <Link
          href="/debts"
          className="flex h-20 items-center justify-center rounded-xl bg-debt text-lg font-bold text-white"
        >
          แปะโป้ง
        </Link>
      </div>

      <Link href="/history" className="text-center text-ink/70 underline">
        ดูรายละเอียด / ประวัติย้อนหลัง
      </Link>
    </div>
  );
}
