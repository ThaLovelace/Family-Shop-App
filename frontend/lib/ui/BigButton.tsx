"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Color variants used across the app. Keep this list in sync with the
 * tokens in tailwind.config.ts.
 *  - revenue / expense / debtAction / checkout: the 4 home-screen action buttons
 *  - alcohol / market / grocery / shopee: item-category colors (เหล้า/ตลาด/ของชำ/Shopee)
 *  - neutral: plain white card-style button (customer names, numpad-adjacent choices, ฯลฯ)
 *  - danger: destructive actions
 */
export type ButtonVariant =
  | "revenue"
  | "expense"
  | "debtAction"
  | "checkout"
  | "alcohol"
  | "market"
  | "grocery"
  | "shopee"
  | "neutral"
  | "danger";

/** primary = tall hero buttons on Home. secondary = normal-size action buttons on sub-pages. */
export type ButtonSize = "primary" | "secondary";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  revenue: "bg-revenue text-white active:opacity-90",
  expense: "bg-expense text-white active:opacity-90",
  debtAction: "bg-debtAction text-white active:opacity-90",
  checkout: "bg-checkout text-white active:opacity-90",
  alcohol: "bg-alcohol text-white active:opacity-90",
  market: "bg-market text-white active:opacity-90",
  grocery: "bg-grocery text-white active:opacity-90",
  shopee: "bg-shopee text-white active:opacity-90",
  neutral: "bg-white text-ink shadow-sm active:bg-line",
  danger: "bg-red-600 text-white active:bg-red-700",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  primary: "h-20 rounded-2xl text-2xl font-bold w-full",
  secondary: "h-16 rounded-xl text-xl font-bold w-full",
};

type SharedProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
};

type AsButton = SharedProps & {
  href?: undefined;
  onClick?: () => void;
  type?: "button" | "submit";
};

type AsLink = SharedProps & {
  href: string;
  onClick?: undefined;
};

export default function BigButton(props: AsButton | AsLink) {
  const {
    children,
    variant = "neutral",
    size = "primary",
    disabled = false,
    className = "",
    ariaLabel,
  } = props;

  const classes = `${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} disabled:opacity-40 transition-opacity ${className}`;

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={`flex items-center justify-center ${classes}`} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  const buttonProps = props as AsButton;
  return (
    <button
      type={buttonProps.type ?? "button"}
      onClick={buttonProps.onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={classes}
    >
      {children}
    </button>
  );
}
