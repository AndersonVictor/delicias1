"use client";
import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useAuth } from "@/context/AuthContext";

type ShellProps = {
  children: React.ReactNode;
  headerTitle?: string;
};

/**
 * Contenedor principal del Panel Admin.
 * Orquesta Header y Sidebar y define el área principal.
 */
export default function Shell({ children, headerTitle }: ShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login";
    }
  };

  return (
    <div className="min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="md:pl-64">
        <Header title={headerTitle || "Panel de Administración"} onToggleSidebar={() => setSidebarOpen(true)} onLogout={handleLogout} user={user} />
        <main className="container py-6">
          <div className="min-h-[calc(100vh-5rem)]">{children}</div>
        </main>
      </div>
    </div>
  );
}