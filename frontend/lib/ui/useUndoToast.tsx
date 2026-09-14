"use client";

import { useCallback, useRef, useState } from "react";

type PendingUndo = { message: string; onUndo: () => void } | null;

/**
 * Replaces "are you sure?" confirmation popups. Call showUndo() right after
 * doing the (already-completed) destructive action, and the caller's
 * onUndo() reverses it if the person taps "เลิกทำ" within 5 seconds.
 */
export function useUndoToast(durationMs = 5000) {
  const [pending, setPending] = useState<PendingUndo>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPending(null);
  }, []);

  const showUndo = useCallback(
    (message: string, onUndo: () => void) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setPending({ message, onUndo });
      timerRef.current = setTimeout(() => setPending(null), durationMs);
    },
    [durationMs]
  );

  const toastElement = pending ? (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-full bg-ink px-5 py-3 text-white shadow-lg"
    >
      <span className="text-base">{pending.message}</span>
      <button
        type="button"
        onClick={() => {
          pending.onUndo();
          dismiss();
        }}
        className="text-base font-bold underline underline-offset-2"
      >
        เลิกทำ
      </button>
    </div>
  ) : null;

  return { toastElement, showUndo, dismiss };
}
