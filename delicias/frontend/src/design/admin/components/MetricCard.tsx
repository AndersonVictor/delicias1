import React from "react";
import clsx from "clsx";

type MetricCardProps = {
  label: React.ReactNode;
  value: React.ReactNode;
  className?: string;
};

export default function MetricCard({ label, value, className = "" }: MetricCardProps) {
  return (
    <div className={clsx("rounded-xl border border-slate-200 bg-white shadow-sm p-4", className)}>
      <div className="flex flex-col gap-1">
        <div className="text-xs text-slate-600">{label}</div>
        <div className="text-2xl font-semibold text-slate-900">{value}</div>
      </div>
    </div>
  );
}

export function StatsGrid({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>{children}</div>;
}