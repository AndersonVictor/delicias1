import { redirect } from "next/navigation";

export default function HistorialPage() {
  // Alias de ruta para acceder al historial de compras
  // Redirige a la página existente de órdenes/historial
  redirect("/orders");
}