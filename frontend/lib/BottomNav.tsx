"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "หน้าหลัก" },
  { href: "/income", label: "รับเงิน" },
  { href: "/expense", label: "จ่ายเงิน" },
  { href: "/debts", label: "แปะโป้ง" },
  { href: "/history", label: "ประวัติ" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-line bg-paper">
      <div className="mx-auto flex max-w-md">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 py-3 text-center text-base font-semibold transition-colors ${
                active ? "text-ink border-t-4 border-cash -mt-[4px]" : "text-ink/50"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
