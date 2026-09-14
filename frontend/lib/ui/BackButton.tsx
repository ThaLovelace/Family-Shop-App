"use client";

import Link from "next/link";

/**
 * Every non-home screen must show this in the top-left corner — the app has
 * no bottom nav, so this is the only way back. Big touch target on purpose.
 */
export default function BackButton() {
  return (
    <Link
      href="/"
      className="inline-flex h-14 items-center gap-2 rounded-xl bg-white/80 px-4 text-lg font-bold text-ink shadow-sm active:bg-line"
      aria-label="กลับหน้าแรก"
    >
      <span className="text-2xl leading-none">←</span>
      กลับหน้าแรก
    </Link>
  );
}
