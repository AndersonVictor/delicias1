"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Table, THead, Th, TBody, Tr, Td, buttonClasses, Badge } from "@/design/admin";
import Skeleton from "@/components/ui/Skeleton";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  useReactTable,
} from "@tanstack/react-table";

export type Comprobante = {
  id?: string | number;
  tipo?: "boleta" | "factura";
  serie?: string;
  numero?: string;
  estado?: string;
  total?: number;
  created_at?: string;
  archivos?: { pdf?: string; xml?: string; img?: string };
  cliente?: { nombre?: string; razon_social?: string; ruc?: string; dni?: string } | any;
};

const formatPEN = (n: number = 0) => new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(n);
const formatDate = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" });
};

export default function AdminComprobantesPage() {
  const { isAdmin } = useAuth();
  const admin = isAdmin();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([]);

  // Filtros
  const [globalFilter, setGlobalFilter] = useState("");
  const [tipoFilter, setTipoFilter] = useState<string>("");
  const [estadoFilter, setEstadoFilter] = useState<string>("");
  const [sorting, setSorting] = useState<any>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  useEffect(() => {
    if (!admin) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get("/api/facturacion/admin/comprobantes?pagina=1&limite=500");
        const list = Array.isArray(res.data?.comprobantes) ? res.data.comprobantes : [];
        setComprobantes(list);
      } catch (e: unknown) {
        const msg = axios.isAxiosError(e)
          ? ((e.response?.data as { message?: string })?.message || e.message)
          : "No se pudieron cargar los comprobantes";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [admin]);

  const columns = useMemo<ColumnDef<Comprobante>[]>(() => [
    {
      header: () => "Tipo",
      accessorKey: "tipo",
      cell: ({ getValue }) => {
        const tipo = String(getValue() || "");
        const variant = tipo === "factura" ? "secondary" : "primary";
        return <Badge variant={variant} size="sm">{tipo || "-"}</Badge>;
      },
      filterFn: (row, _columnId, filterValue) => {
        const fv = String(filterValue || "").toLowerCase();
        if (!fv) return true;
        return String(row.original.tipo || "").toLowerCase() === fv;
      },
    },
    {
      header: () => "Serie-Número",
      id: "serie_numero",
      accessorFn: (row) => `${row.serie ?? ""}-${row.numero ?? ""}`.replace(/^-/,'') || "",
      cell: ({ getValue }) => <span className="font-medium text-slate-900">{String(getValue() || "-")}</span>,
    },
    {
      header: () => "Cliente",
      id: "cliente",
      accessorFn: (row) => row.cliente?.nombre || row.cliente?.razon_social || "",
      cell: ({ row }) => {
        const c = row.original.cliente || {};
        const nombre = c.nombre || c.razon_social || "-";
        return <span className="text-slate-700">{nombre}</span>;
      },
    },
    {
      header: () => "Estado",
      accessorKey: "estado",
      cell: ({ getValue }) => {
        const estado = String(getValue() || "-").toLowerCase();
        const variant = estado.includes("acept") || estado.includes("emit") ? "success" : estado.includes("rechaz") ? "danger" : estado.includes("pend") ? "warning" : "muted";
        return <Badge variant={variant} size="sm">{estado || "-"}</Badge>;
      },
      filterFn: (row, _col, filterValue) => {
        const fv = String(filterValue || "").toLowerCase();
        if (!fv) return true;
        return String(row.original.estado || "").toLowerCase().includes(fv);
      },
    },
    {
      header: () => "Emitido",
      accessorKey: "created_at",
      cell: ({ getValue }) => <span className="text-slate-600">{formatDate(String(getValue()))}</span>,
    },
    {
      header: () => "Total",
      accessorKey: "total",
      cell: ({ getValue }) => <span className="text-slate-900">{formatPEN(Number(getValue() || 0))}</span>,
    },
    {
      header: () => "Archivos",
      id: "archivos",
      cell: ({ row }) => {
        const a = row.original.archivos || {};
        return (
          <div className="flex items-center justify-end gap-2">
            {a.pdf ? (
              <a className={buttonClasses({ variant: "outline-primary", size: "sm" })} href={a.pdf} target="_blank" rel="noreferrer">PDF</a>
            ) : null}
            {a.xml ? (
              <a className={buttonClasses({ variant: "outline-secondary", size: "sm" })} href={a.xml} target="_blank" rel="noreferrer">XML</a>
            ) : null}
            {a.img ? (
              <a className={buttonClasses({ variant: "outline-secondary", size: "sm" })} href={a.img} target="_blank" rel="noreferrer">IMG</a>
            ) : null}
          </div>
        );
      },
    },
  ], []);

  const table = useReactTable({
    data: comprobantes,
    columns,
    state: { globalFilter, sorting, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Filtro manual por tipo y estado (aplicar antes de pasar a la tabla)
  const filteredData = useMemo(() => {
    return comprobantes.filter((c) => {
      const tipoOk = tipoFilter ? (String(c.tipo || "").toLowerCase() === tipoFilter) : true;
      const estadoOk = estadoFilter ? (String(c.estado || "").toLowerCase().includes(estadoFilter)) : true;
      const glob = (globalFilter || "").toLowerCase();
      const serieNumero = `${c.serie ?? ""}-${c.numero ?? ""}`.toLowerCase();
      const clienteNombre = String(c.cliente?.nombre || c.cliente?.razon_social || "").toLowerCase();
      const globOk = glob
        ? serieNumero.includes(glob) || clienteNombre.includes(glob)
        : true;
      return tipoOk && estadoOk && globOk;
    });
  }, [comprobantes, tipoFilter, estadoFilter, globalFilter]);

  // Actualizar data en la tabla cuando haya filtros manuales
  useEffect(() => {
    table.setOptions((prev) => ({ ...prev, data: filteredData }));
  }, [filteredData]);

  if (!admin) {
    return (
      <div className="p-6">
        <div className="mb-3">No estás autenticado como administrador.</div>
        <Link className={buttonClasses({ variant: "primary", size: "sm" })} href="/admin/login">Ir al login admin</Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Comprobantes emitidos</h1>
        <div className="flex items-center gap-2">
          <select
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value.toLowerCase())}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
          >
            <option value="">Todos los tipos</option>
            <option value="boleta">Boleta</option>
            <option value="factura">Factura</option>
          </select>
          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value.toLowerCase())}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="emit">Emitido/Aceptado</option>
            <option value="pend">Pendiente</option>
            <option value="rech">Rechazado</option>
            <option value="anul">Anulado</option>
          </select>
          <input
            placeholder="Buscar cliente o serie/número…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-56 rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-300"
          />
          <button
            className={buttonClasses({ variant: "outline-secondary", size: "sm" })}
            onClick={() => { setGlobalFilter(""); setTipoFilter(""); setEstadoFilter(""); }}
          >
            Limpiar
          </button>
        </div>
      </div>

      {loading && (
        <div>Cargando...</div>
      )}
      {!loading && error && (
        <div className="mb-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {loading && (
        <div className="mb-3 rounded-xl border border-slate-200 bg-white p-4">
          <Skeleton className="h-6 w-40 mb-4" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="grid grid-cols-8 gap-3 py-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-56 col-span-2" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-8 w-40 justify-self-end col-span-2" />
            </div>
          ))}
        </div>
      )}

      <Table>
        <THead>
          {table.getHeaderGroups().map((hg) => (
            <Tr key={hg.id}>
              {hg.headers.map((h) => (
                <Th key={h.id}>
                  {h.isPlaceholder ? null : (
                    <button
                      className="flex items-center gap-1"
                      onClick={h.column.getToggleSortingHandler()}
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {{ asc: "↑", desc: "↓" }[h.column.getIsSorted() as string] ?? null}
                    </button>
                  )}
                </Th>
              ))}
            </Tr>
          ))}
        </THead>
        <TBody>
          {table.getRowModel().rows.map((row) => (
            <Tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <Td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Td>
              ))}
            </Tr>
          ))}
          {!loading && table.getRowModel().rows.length === 0 && (
            <Tr>
              <Td className="text-center text-slate-500 px-3 py-6" colSpan={columns.length}>No hay comprobantes</Td>
            </Tr>
          )}
        </TBody>
      </Table>
      {/* Paginación */}
      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm text-slate-600">
          Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()} — {filteredData.length} comprobantes
        </div>
        <div className="flex items-center gap-2">
          <button
            className={buttonClasses({ variant: "outline-secondary", size: "sm" })}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </button>
          <button
            className={buttonClasses({ variant: "outline-primary", size: "sm" })}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </button>
          <select
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>{size} por página</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}