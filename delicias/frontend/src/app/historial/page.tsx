"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HistorialPage() {
  const router = useRouter();

  useEffect(() => {
    // Alias de ruta para acceder al historial de compras
    // Redirige a la página existente de órdenes/historial
    router.replace("/orders");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-slate-600">Redirigiendo...</div>
    </div>
  );
}
