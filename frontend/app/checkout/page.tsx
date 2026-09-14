"use client";

import BackButton from "../../lib/ui/BackButton";

// Placeholder — the Daily Checkout flow (numpad "นับเงินในลิ้นชัก" -> ตรวจสอบ
// ยอดที่ควรมี vs นับได้ -> badge ตรงเป๊ะ/ขาด/เกิน) is built in the next pass.
export default function CheckoutPage() {
  return (
    <div className="flex flex-col gap-6">
      <BackButton />
      <header>
        <h1 className="text-2xl font-bold">ปิดยอดวันนี้</h1>
        <p className="text-ink/60">หน้านี้กำลังพัฒนาต่อในเวอร์ชันถัดไป</p>
      </header>
    </div>
  );
}
