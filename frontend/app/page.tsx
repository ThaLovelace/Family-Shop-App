"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, HomeSummary } from "../lib/api";
import BigButton from "../lib/ui/BigButton";

const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

function formatThaiDate(d: Date) {
  const day = d.getDate();
  const month = THAI_MONTHS[d.getMonth()];
  const buddhistYear = d.getFullYear() + 543;
  return `วันที่ ${day} ${month} ${buddhistYear}`;
}

function greeting(d: Date) {
  const hour = d.getHours();
  if (hour < 11) return "สวัสดีตอนเช้าค่ะ";
  if (hour < 16) return "สวัสดีตอนบ่ายค่ะ";
  return "สวัสดีตอนเย็นค่ะ";
}

type LoadState = "loading" | "ready" | "error";

export default function HomePage() {
  const [summary, setSummary] = useState<HomeSummary | null>(null);
  const [state, setState] = useState<LoadState>("loading");

  useEffect(() => {
    load();
  }, []);

  function load() {
    setState("loading");
    api
      .getHomeSummary(api.today())
      .then((s) => {
        setSummary(s);
        setState("ready");
      })
      .catch(() => setState("error"));
  }

  if (state === "loading") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
        <span className="text-6xl">📒</span>
        <p className="text-xl font-bold text-ink">กำลังกางสมุดบัญชี...</p>
        <p className="text-lg text-ink/70">ป้ารอสัก 1 นาทีนะจ๊ะ</p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 rounded-2xl bg-red-50 p-6 text-center">
        <span className="text-6xl">📡</span>
        <p className="text-xl font-bold text-ink">เน็ตหลุดจ้า ยังไม่ได้จดรายการเมื่อกี้</p>
        <BigButton variant="checkout" size="secondary" onClick={load} className="mt-2">
          ลองบันทึกอีกครั้ง
        </BigButton>
      </div>
    );
  }

  const now = new Date();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold">{greeting(now)}</h1>
        <p className="text-ink/60">{formatThaiDate(now)}</p>
      </header>

      {/* Read-only sales card */}
      <div className="rounded-2xl bg-white/70 p-6 text-center">
        <p className="text-lg font-semibold text-ink/70">ยอดขายวันนี้</p>
        <p className="tabular-nums text-5xl font-extrabold text-revenue">
          ฿{summary?.cash_income_today ?? "0"}
        </p>
        <p className="mt-1 text-sm text-ink/50">นับเฉพาะเงินสด — ยอดรวมทั้งหมดดูได้ที่หน้าสรุป</p>
      </div>

      {/* 3 primary actions, stacked full-width */}
      <div className="flex flex-col gap-3">
        <BigButton href="/income" variant="revenue">
          + รับเงิน
        </BigButton>
        <BigButton href="/expense" variant="expense">
          - จ่ายเงิน
        </BigButton>
        <BigButton href="/debts" variant="debtAction">
          ลูกค้าแปะโป้ง
        </BigButton>
      </div>

      {/* Secondary action */}
      <BigButton href="/checkout" variant="checkout" size="secondary">
        ปิดยอดวันนี้
      </BigButton>

      {/* Small corner text links */}
      <div className="flex justify-center gap-4 text-ink/60">
        <Link href="/summary" className="underline">
          ดูสรุป
        </Link>
        <span>|</span>
        <Link href="/settings" className="underline">
          ตั้งค่า
        </Link>
      </div>
    </div>
  );
}
