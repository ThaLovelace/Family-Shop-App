"use client";

import BackButton from "../../lib/ui/BackButton";

// Placeholder — the Analytics Dashboard (สถานะลิ้นชัก, งบตลาด, กำไรสะสม,
// หนี้ Shopee, ประวัติรายวัน) is built in the next pass. It will likely fold
// in what /history already shows today.
export default function SummaryPage() {
  return (
    <div className="flex flex-col gap-6">
      <BackButton />
      <header>
        <h1 className="text-2xl font-bold">สรุปข้อมูล</h1>
        <p className="text-ink/60">หน้านี้กำลังพัฒนาต่อในเวอร์ชันถัดไป</p>
      </header>
    </div>
  );
}
