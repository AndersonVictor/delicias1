import React from "react";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "success" | "warning" | "danger" | "accent" | "muted";
  size?: "sm" | "md";
};

const base = "inline-flex items-center rounded-full font-medium";
const sizeMap: Record<NonNullable<BadgeProps["size"]>, string> = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-0.5",
};

const variantMap: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-black/5 text-black/70",
  muted: "bg-slate-100 text-slate-700",
  accent: "bg-[var(--color-primary)]/20 text-[var(--color-secondary)]",
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
};

export default function Badge({ variant = "default", size = "sm", className = "", children, ...props }: BadgeProps) {
  const classes = `${base} ${sizeMap[size]} ${variantMap[variant]} ${className}`.trim();
  return (
    <span {...props} className={classes}>{children}</span>
  );
}