"use client";
import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <CartProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "var(--surface)",
                color: "var(--color-text)",
                border: "1px solid rgba(0,0,0,0.12)",
                boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
              },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}