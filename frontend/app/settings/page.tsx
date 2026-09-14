"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import BackButton from "../../lib/ui/BackButton";

export default function SettingsPage() {
  const [drawerFloat, setDrawerFloat] = useState("");
  const [marketBudget, setMarketBudget] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    api.getSettings().then((s) => {
      setDrawerFloat(s.drawer_float_amount ?? "");
      setMarketBudget(s.market_daily_budget ?? "");
    });
  }, []);

  async function save() {
    setSaving(true);
    try {
      await api.updateSettings({
        drawer_float_amount: drawerFloat ? Number(drawerFloat) : undefined,
        market_daily_budget: marketBudget ? Number(marketBudget) : undefined,
      });
      setToast("บันทึกแล้ว");
      setTimeout(() => setToast(null), 1500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <BackButton />
      <header>
        <h1 className="text-2xl font-bold">ตั้งค่าร้าน</h1>
        <p className="text-ink/60">ตั้งครั้งเดียว ไม่ต้องแก้บ่อย</p>
      </header>

      <div className="flex flex-col gap-2">
        <label className="text-lg font-semibold">เงินทอนตั้งต้นในเก๊ะ</label>
        <input
          inputMode="decimal"
          value={drawerFloat}
          onChange={(e) => setDrawerFloat(e.target.value)}
          className="h-14 rounded-xl border border-line bg-white px-4 text-xl tabular-nums"
          placeholder="เช่น 500"
        />
        <p className="text-sm text-ink/60">
          เงินสำหรับทอนลูกค้าอย่างเดียว ปิดร้านแล้วต้องนับได้เท่าเดิมบวกเงินสดที่ขายได้วันนั้น
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-lg font-semibold">งบซื้อของตลาดต่อวัน</label>
        <input
          inputMode="decimal"
          value={marketBudget}
          onChange={(e) => setMarketBudget(e.target.value)}
          className="h-14 rounded-xl border border-line bg-white px-4 text-xl tabular-nums"
          placeholder="เช่น 300"
        />
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="h-16 rounded-xl bg-cash text-xl font-bold text-white disabled:opacity-40"
      >
        บันทึก
      </button>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 rounded-full bg-ink px-5 py-2 text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
