import React from "react";
import clsx from "clsx";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "danger"
  | "success"
  | "warning"
  | "link"
  | "outline-primary"
  | "outline-secondary"
  | "outline-success"
  | "outline-danger";

export type ButtonSize = "sm" | "md";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-slate-900 text-white hover:bg-slate-800",
  secondary: "bg-slate-100 text-slate-900 border border-slate-300 hover:bg-slate-200",
  outline: "border border-slate-300 text-slate-900 hover:bg-slate-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
  success: "bg-green-600 text-white hover:bg-green-700",
  warning: "bg-amber-500 text-white hover:bg-amber-600",
  link: "bg-transparent text-slate-900 hover:underline px-0 py-0 h-auto",
  "outline-primary": "border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white",
  "outline-secondary": "border border-slate-300 text-slate-700 hover:bg-slate-100",
  "outline-success": "border border-green-600 text-green-600 hover:bg-green-50",
  "outline-danger": "border border-red-600 text-red-600 hover:bg-red-50",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return clsx(baseClasses, sizeClasses[size], variantClasses[variant]);
}

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button className={clsx(buttonClasses({ variant, size }), className)} {...props} />
  );
}