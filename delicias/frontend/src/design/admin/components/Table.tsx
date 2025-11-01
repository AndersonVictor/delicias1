import React from "react";
import clsx from "clsx";

export function Table({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm", className)}>
      <table className="min-w-full divide-y divide-slate-200">
        {children}
      </table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-slate-50">{children}</thead>;
}

export function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">{children}</th>;
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-slate-200 bg-white">{children}</tbody>;
}

export function Tr({ children }: { children: React.ReactNode }) {
  return <tr className="hover:bg-slate-50/50">{children}</tr>;
}

export function Td({ children, className = "", colSpan }: { children: React.ReactNode; className?: string; colSpan?: number }) {
  return (
    <td className={clsx("px-4 py-2 text-sm text-slate-800", className)} colSpan={colSpan}>
      {children}
    </td>
  );
}