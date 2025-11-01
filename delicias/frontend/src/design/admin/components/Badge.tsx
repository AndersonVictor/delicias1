import React from "react";
import clsx from "clsx";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "muted" | "info" | "success" | "warning" | "danger";
  size?: "sm" | "md";
  className?: string;
};

const base = "inline-flex items-center rounded-full font-medium";
const sizeMap = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-0.5",
} as const;

const variantMap = {
  muted: "bg-slate-100 text-slate-700",
  info: "bg-blue-100 text-blue-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
} as const;

export function badgeClasses({ variant = "muted", size = "sm" }: { variant?: BadgeProps["variant"]; size?: BadgeProps["size"]; }) {
  return clsx(base, sizeMap[size ?? "sm"], variantMap[variant ?? "muted"]);
}

export default function Badge({ children, variant = "muted", size = "sm", className = "" }: BadgeProps) {
  return <span className={clsx(badgeClasses({ variant, size }), className)}>{children}</span>;
}