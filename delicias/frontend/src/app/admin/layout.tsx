"use client";
import React from "react";
import { AdminShell } from "@/design/admin";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();
  const admin = isAdmin();

  return (
    <AdminShell>
      {!admin ? (
        <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 text-amber-800 px-3 py-2 text-sm">
          No estás autenticado como administrador. <Link className="underline" href="/admin/login">Inicia sesión</Link>.
        </div>
      ) : null}
      {children}
    </AdminShell>
  );
}