"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Footer from "@/components/Layout/Footer";
import CartSidebar from "@/components/Cart/CartSidebar";
import Navbar from "@/components/Layout/Navbar";
import { AnimatePresence, motion } from "framer-motion";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  // Eliminamos la Navbar pública por requerimiento.
  // En rutas admin, ocultamos también Footer y Cart.
  if (isAdminRoute) {
    return (
      <div>
        {children}
      </div>
    );
  }

  return (
    <div>
      {/* Navegación pública y carrito */}
      <Navbar />
      <CartSidebar />
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}