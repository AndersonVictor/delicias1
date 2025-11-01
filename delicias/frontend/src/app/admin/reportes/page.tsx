"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Badge } from "@/design/admin";
import Skeleton from "@/components/ui/Skeleton";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { buttonClasses } from "@/design/admin";
import { useAuth } from "@/context/AuthContext";

const formatPEN = (n: number = 0) => new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(n);

type ChartPoint = { label: string; total: number };
type TopProducto = { producto_id: number; nombre: string; imagen?: string | null; cantidad: number; subtotal: number };
type TopCategoria = { categoria_id: number; nombre: string; cantidad: number; subtotal: number };

export default function AdminReportesPage() {
  const { isAdmin } = useAuth();
  const admin = isAdmin();

  const [modo, setModo] = useState<"diario" | "semanal" | "mensual">("diario");
  const [desde, setDesde] = useState<string>("");
  const [hasta, setHasta] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [ventas, setVentas] = useState<ChartPoint[]>([]);
  const [topProductos, setTopProductos] = useState<TopProducto[]>([]);
  const [topCategorias, setTopCategorias] = useState<TopCategoria[]>([]);

  const cargar = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (desde) params.desde = desde;
      if (hasta) params.hasta = hasta;
      const ventasReq = modo === "semanal"
        ? axios.get("/api/reportes/admin/ventas-semanales", { params })
        : modo === "mensual"
        ? axios.get("/api/reportes/admin/ventas-mensuales", { params })
        : axios.get("/api/reportes/admin/ventas-diarias", { params });
      const [vRes, pRes, cRes] = await Promise.all([
        ventasReq,
        axios.get("/api/reportes/admin/top-productos", { params: { ...params, limite: 8 } }),
        axios.get("/api/reportes/admin/top-categorias", { params: { ...params, limite: 8 } }),
      ]);
      const vData = Array.isArray(vRes.data?.data) ? vRes.data.data : [];
      const chartData: ChartPoint[] = vData.map((item: any) => {
        if (modo === "semanal") return { label: String(item.semana), total: Number(item.total || 0) };
        if (modo === "mensual") return { label: String(item.mes), total: Number(item.total || 0) };
        return { label: String(item.fecha), total: Number(item.total || 0) };
      });
      setVentas(chartData);
      setTopProductos(Array.isArray(pRes.data?.data) ? (pRes.data.data as TopProducto[]) : []);
      setTopCategorias(Array.isArray(cRes.data?.data) ? (cRes.data.data as TopCategoria[]) : []);
    } catch (e: unknown) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data as { message?: string } | undefined)?.message || e.message
        : "No se pudieron cargar los reportes";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!admin) {
      setLoading(false);
      setError("No estás autenticado como administrador");
      return;
    }
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin, modo]);

  const productosBarData = useMemo(() => topProductos.map(p => ({ name: p.nombre, cantidad: p.cantidad })), [topProductos]);
  const categoriasPieData = useMemo(() => topCategorias.map(c => ({ name: c.nombre, value: c.cantidad })), [topCategorias]);

  const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#6366f1", "#22c55e", "#a855f7", "#f97316", "#14b8a6", "#eab308"]; // paleta

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Reportes</h1>
        <div className="flex items-center gap-2">
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm" />
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm" />
          <div className="inline-flex rounded-md border border-slate-300 bg-white text-sm">
            <button
              className={buttonClasses({ variant: modo === "diario" ? "primary" : "ghost", size: "sm" })}
              onClick={() => setModo("diario")}
            >Diario</button>
            <button
              className={buttonClasses({ variant: modo === "semanal" ? "primary" : "ghost", size: "sm" })}
              onClick={() => setModo("semanal")}
            >Semanal</button>
            <button
              className={buttonClasses({ variant: modo === "mensual" ? "primary" : "ghost", size: "sm" })}
              onClick={() => setModo("mensual")}
            >Mensual</button>
          </div>
          <button className={buttonClasses({ variant: "outline-secondary", size: "sm" })} onClick={cargar}>Actualizar</button>
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      {loading && (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <Skeleton className="h-6 w-64 mb-4" />
            <Skeleton className="h-40 w-full" rounded="xl" />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <Skeleton className="h-6 w-64 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-40 w-full" rounded="xl" />
              <Skeleton className="h-40 w-full" rounded="xl" />
            </div>
          </div>
        </div>
      )}

      {/* Ventas diarias/semanales */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <strong className="text-slate-900">{modo === "semanal" ? "Ventas semanales" : modo === "mensual" ? "Ventas mensuales" : "Ventas diarias"}</strong>
            <Badge variant="muted" size="sm">{modo === "semanal" ? "Total por semana" : modo === "mensual" ? "Total por mes" : "Total por día"}</Badge>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ventas} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(v) => formatPEN(Number(v))} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                <Tooltip formatter={(value) => formatPEN(Number(value))} wrapperStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }} />
                <Line type="monotone" dataKey="total" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top productos y categorías */}
      <div className="mt-3 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <strong className="text-slate-900">Top productos y categorías</strong>
            <Badge variant="muted" size="sm">Cantidad (top 8)</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productosBarData}>
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoriasPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {categoriasPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}