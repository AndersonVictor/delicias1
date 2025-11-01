"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, ShoppingBag, Folder, Users, Settings, X, ClipboardList, BarChart3 } from "lucide-react";

type SidebarProps = {
  open?: boolean;
  onClose?: () => void;
};

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/comprobantes", label: "Comprobantes", icon: FileText },
  { href: "/admin/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/admin/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/admin/productos", label: "Productos", icon: ShoppingBag },
  { href: "/admin/categorias", label: "Categorías", icon: Folder },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

/**
 * Sidebar Admin
 * - Estático en escritorio (izquierda)
 * - Cajón (drawer) en móviles con superposición
 * - Resalta el enlace activo con base en la ruta actual
 */
export default function Sidebar({ open = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  const SidebarContent = (
    <div className="flex h-full w-64 flex-col border-r border-black/10 bg-[var(--surface)]">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-slate-900 text-white grid place-items-center text-sm">D</div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-slate-900">Panel Admin</div>
            <div className="text-xs text-slate-500">admin@delicias.com</div>
          </div>
        </div>
        {onClose && (
          <button aria-label="Cerrar" onClick={onClose} className="md:hidden inline-flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 bg-white text-slate-900">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <nav className="mt-2 flex-1 space-y-1 px-2">
        {navLinks.map((link) => {
          const active = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-slate-900"
                  : "flex items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50"
              }
              onClick={onClose}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Escritorio */}
      <aside className="hidden md:block fixed inset-y-0 left-0 z-30">{SidebarContent}</aside>
      {/* Cajón móvil */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <div className="absolute inset-y-0 left-0 max-w-[80%] w-64 shadow-lg">
            {SidebarContent}
          </div>
        </div>
      )}
    </>
  );
}