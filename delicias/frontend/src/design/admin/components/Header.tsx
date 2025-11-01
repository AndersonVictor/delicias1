"use client";
import React, { useState } from "react";
import { Menu, Search, Bell, Sun, Moon, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";

type HeaderProps = {
  onToggleSidebar?: () => void;
  title?: string;
  onLogout?: () => void;
  user?: { nombre?: string; email?: string; rol?: string } | null;
};

/**
 * Admin Header (Topbar)
 * - Botón de menú (móvil) para abrir el sidebar
 * - Título de sección
 * - Buscador global
 * - Acciones: cambiar tema, notificaciones, menú de usuario con logout
 */
export default function Header({ onToggleSidebar, title = "Dashboard", onLogout, user }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--surface)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--surface)]/75 border-b border-black/10">
      <div className="container flex h-14 items-center justify-between gap-3">
        {/* Izquierda: botón menú y título */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Abrir menú"
            onClick={onToggleSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 bg-white text-slate-900 hover:bg-slate-50"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-sm sm:text-base font-semibold text-slate-900">{title}</h1>
        </div>

        {/* Centro: buscador */}
        <div className="hidden md:flex md:flex-1 md:max-w-xl">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar en el panel…"
              className="w-full rounded-lg border border-black/10 bg-white pl-9 pr-3 py-2 text-sm shadow-sm placeholder:text-slate-500 focus:ring-2 focus:ring-slate-300"
            />
          </div>
        </div>

        {/* Derecha: acciones */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 bg-white text-slate-900 hover:bg-slate-50"
            aria-label="Cambiar tema"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 bg-white text-slate-900 hover:bg-slate-50"
            aria-label="Notificaciones"
          >
            <Bell className="h-5 w-5" />
          </button>

          {/* Menú usuario */}
          <div className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-2.5 py-2 text-sm shadow-sm hover:bg-slate-50"
            >
              <div className="h-6 w-6 rounded-full bg-slate-900 text-white grid place-items-center text-xs">
                {(user?.nombre || user?.email || "Admin").charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline text-slate-900">{user?.nombre || user?.email || "Administrador"}</span>
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 rounded-lg border border-black/10 bg-white shadow-lg"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <div className="py-1">
                  <a className="block px-3 py-2 text-sm text-slate-800 hover:bg-slate-50" href="/profile" role="menuitem">
                    Perfil
                  </a>
                  <a className="block px-3 py-2 text-sm text-slate-800 hover:bg-slate-50" href="/admin/configuracion" role="menuitem">
                    Configuración
                  </a>
                  <button
                    className="block w-full px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
                    role="menuitem"
                    onClick={onLogout}
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}