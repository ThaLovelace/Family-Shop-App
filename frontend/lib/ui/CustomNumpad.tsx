"use client";

const KEYS = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", ".", "⌫"];

type CustomNumpadProps = {
  /** current amount as a plain string, e.g. "120.5" */
  value: string;
  onChange: (next: string) => void;
  /** max count of digits (not counting the decimal point), default 7 */
  maxDigits?: number;
  disabled?: boolean;
};

/**
 * On-screen numpad so the app never has to open the device's native
 * keyboard for numbers ("Touch, Don't Type" rule).
 */
export default function CustomNumpad({ value, onChange, maxDigits = 7, disabled = false }: CustomNumpadProps) {
  function pressDigit(d: string) {
    if (disabled) return;
    if (d === "." && value.includes(".")) return;
    if (value.replace(".", "").length >= maxDigits) return;
    onChange(value + d);
  }

  function backspace() {
    if (disabled) return;
    onChange(value.slice(0, -1));
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {KEYS.map((key) => (
        <button
          key={key}
          type="button"
          disabled={disabled}
          onClick={() => (key === "⌫" ? backspace() : pressDigit(key))}
          className="h-16 rounded-xl bg-white text-2xl font-semibold text-ink shadow-sm active:bg-line disabled:opacity-40"
          aria-label={key === "⌫" ? "ลบตัวเลขล่าสุด" : `ตัวเลข ${key}`}
        >
          {key}
        </button>
      ))}
    </div>
  );
}

/** Big read-only ฿ display that sits above a CustomNumpad. */
export function AmountDisplay({ value, label }: { value: string; label?: string }) {
  return (
    <div className="rounded-2xl bg-white/60 py-6 text-center">
      {label && <p className="text-ink/60">{label}</p>}
      <span className="tabular-nums text-5xl font-bold">฿{value || "0"}</span>
    </div>
  );
}
