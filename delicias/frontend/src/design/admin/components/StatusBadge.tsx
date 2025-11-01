import React from "react";
import clsx from "clsx";

export default function StatusBadge({ active }: { active?: boolean }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        active
          ? "bg-green-100 text-green-700"
          : "bg-slate-100 text-slate-700"
      )}
    >
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}