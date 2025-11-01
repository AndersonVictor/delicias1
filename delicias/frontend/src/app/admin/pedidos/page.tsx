"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { formatPEN } from "@/utils/currency";
import { Table, THead, Th, TBody, Tr, Td, buttonClasses, StatusBadge } from "@/design/admin";
import Skeleton from "@/components/ui/Skeleton";
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
import { useAuth } from "@/context/AuthContext";

type Usuario = { id: number; nombre?: string; apellido?: string; email?: string };

type Pedido = {
  id: number;
  usuario?: Usuario | null;
  total?: number;
  estado?: "pendiente" | "listo" | "entregado" | "cancelado" | string;
  created_at?: string;
  fecha_entrega?: string | null;
  notas?: string | null;
  direccion_entrega?: string | null;
  telefono_contacto?: string | null;
  total_productos?: number;
};

export default function AdminPedidosPage() {
  const { isAdmin } = useAuth();
  const admin = isAdmin();

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("");
  const [desde, setDesde] = useState<string>("");
  const [hasta, setHasta] = useState<string>("");
  const [sorting, setSorting] = useState<any>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const params: any = { pagina: 1, limite: 300 };
      if (estadoFilter) params.estado = estadoFilter;
      if (desde) params.desde = desde;
      if (hasta) params.hasta = hasta;
      if (globalFilter) params.buscar = globalFilter;
      const res = await axios.get('/api/pedidos/admin/todos', { params });
      const data = res.data?.pedidos || res.data?.data || res.data;
      setPedidos(Array.isArray(data) ? data : []);
      setError(null);
    } catch (e: unknown) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data as { message?: string } | undefined)?.message || e.message
        : 'No se pudieron cargar los pedidos';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!admin) {
      setLoading(false);
      setError('No estás autenticado como administrador');
      return;
    }
    fetchPedidos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estadoFilter, desde, hasta]);

  const marcarEstado = async (id: number, estado: Pedido["estado"]) => {
    try {
      const res = await axios.patch(`/api/pedidos/admin/${id}/estado`, { estado });
      toast.success(`Pedido ${id} actualizado a '${estado}'`);
      // Refrescar lista
      await fetchPedidos();
    } catch (e: unknown) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data as { message?: string } | undefined)?.message || e.message
        : 'No se pudo actualizar el estado del pedido';
      toast.error(msg);
    }
  };

  const columns = useMemo<ColumnDef<Pedido>[]>(() => [
    {
      header: "ID",
      accessorKey: "id",
      cell: ({ row }) => <span className="font-medium">#{row.original.id}</span>,
    },
    {
      header: "Cliente",
      accessorKey: "usuario",
      cell: ({ row }) => {
        const u = row.original.usuario;
        if (!u) return <span className="text-slate-500">—</span>;
        return (
          <div className="flex flex-col">
            <Link href={`/admin/usuarios/${u.id}`} className="text-slate-900 hover:underline">
              {u.nombre ? `${u.nombre} ${u.apellido ?? ''}`.trim() : u.email}
            </Link>
            <span className="text-xs text-slate-500">{u.email}</span>
          </div>
        );
      },
    },
    {
      header: "Estado",
      accessorKey: "estado",
      cell: ({ row }) => {
        const est = String(row.original.estado || '').toLowerCase();
        const map: Record<string, string> = {
          pendiente: "bg-amber-100 text-amber-700",
          listo: "bg-blue-100 text-blue-700",
          entregado: "bg-green-100 text-green-700",
          cancelado: "bg-red-100 text-red-700",
        };
        return (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${map[est] || 'bg-slate-100 text-slate-700'}`}>{est || '—'}</span>
        );
      },
    },
    {
      header: "Total",
      accessorKey: "total",
      cell: ({ row }) => <span>{formatPEN(row.original.total || 0)}</span>,
    },
    {
      header: "Fecha",
      accessorKey: "created_at",
      cell: ({ row }) => new Date(row.original.created_at || '').toLocaleString(),
    },
    {
      header: "Entrega",
      accessorKey: "fecha_entrega",
      cell: ({ row }) => row.original.fecha_entrega ? new Date(row.original.fecha_entrega).toLocaleDateString() : <span className="text-slate-500">—</span>,
    },
    {
      header: "Productos",
      accessorKey: "total_productos",
      cell: ({ row }) => row.original.total_productos ?? 0,
    },
    {
      header: "Acciones",
      id: "acciones",
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex items-center gap-2">
            <button
              className={buttonClasses({ variant: "outline-secondary", size: "sm" })}
              onClick={() => marcarEstado(p.id, "listo")}
              disabled={p.estado === 'listo' || p.estado === 'entregado' || p.estado === 'cancelado'}
            >Marcar listo</button>
            <button
              className={buttonClasses({ variant: "success", size: "sm" })}
              onClick={() => marcarEstado(p.id, "entregado")}
              disabled={p.estado === 'entregado' || p.estado === 'cancelado'}
            >Entregar</button>
            <button
              className={buttonClasses({ variant: "outline-danger", size: "sm" })}
              onClick={() => marcarEstado(p.id, "cancelado")}
              disabled={p.estado === 'entregado' || p.estado === 'cancelado'}
            >Cancelar</button>
          </div>
        );
      },
    },
  ], []);

  const table = useReactTable({
    data: pedidos,
    columns,
    state: {
      globalFilter,
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const v = filterValue?.toLowerCase?.() || '';
      const p = row.original as Pedido;
      const texto = `${p.id} ${p.usuario?.nombre || ''} ${p.usuario?.apellido || ''} ${p.usuario?.email || ''} ${p.notas || ''} ${p.direccion_entrega || ''}`.toLowerCase();
      return texto.includes(v);
    }
  });

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
        <h1 className="text-xl font-semibold">Pedidos</h1>
        <div className="flex items-center gap-2">
          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value.toLowerCase())}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="listo">Listo</option>
            <option value="entregado">Entregado</option>
            <option value="cancelado">Cancelado</option>
          </select>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
          />
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
          />
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <input
          placeholder="Buscar por cliente, id o notas…"
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-full md:w-64 rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-300"
        />
        <button className={buttonClasses({ variant: "outline-secondary", size: "sm" })} onClick={fetchPedidos}>Actualizar</button>
      </div>

      {error && (
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
              <Skeleton className="h-5 w-56 col-span-2" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
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
              <Td className="text-center text-slate-500 px-3 py-6" colSpan={columns.length}>No hay pedidos</Td>
            </Tr>
          )}
        </TBody>
      </Table>

      {/* Paginación */}
      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm text-slate-600">
          Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()} — {pedidos.length} pedidos
        </div>
        <div className="flex items-center gap-2">
          <button
            className={buttonClasses({ variant: "outline-secondary", size: "sm" })}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >Anterior</button>
          <button
            className={buttonClasses({ variant: "outline-secondary", size: "sm" })}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >Siguiente</button>
        </div>
      </div>
    </div>
  );
}