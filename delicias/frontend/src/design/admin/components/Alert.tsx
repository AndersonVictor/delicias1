import React from "react";
import clsx from "clsx";

type Variant = "info" | "danger" | "warning" | "success";
type Size = "sm" | "md";

const base = "rounded-lg border p-3 text-sm shadow-sm";
const sizeMap: Record<Size, string> = {
  sm: "p-2 text-sm",
  md: "p-3 text-base",
};
const variantMap: Record<Variant, string> = {
  info: "bg-blue-50 border-blue-200 text-blue-800",
  danger: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  success: "bg-green-50 border-green-200 text-green-800",
};

export function alertClasses({ variant = "info", size = "md" }: { variant?: Variant; size?: Size }) {
  return clsx(base, sizeMap[size], variantMap[variant]);
}

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  size?: Size;
  title?: string;
  children?: React.ReactNode;
}

export default function Alert({ variant = "info", size = "md", title, children, className = "", ...rest }: AlertProps) {
  return (
    <div className={clsx(alertClasses({ variant, size }), className)} role="alert" {...rest}>
      {title ? <div className="font-semibold mb-1">{title}</div> : null}
      {children ? <div className="leading-relaxed">{children}</div> : null}
    </div>
  );
}