import React from "react";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  rounded?: "sm" | "md" | "lg" | "xl";
};

const roundedMap: Record<NonNullable<SkeletonProps["rounded"]>, string> = {
  sm: "rounded",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
};

export default function Skeleton({ className = "", rounded = "md", style, ...props }: SkeletonProps) {
  const radius = roundedMap[rounded] || "rounded-md";
  const base = `skeleton ${radius} ${className}`.trim();
  return <div {...props} className={base} style={style} />;
}