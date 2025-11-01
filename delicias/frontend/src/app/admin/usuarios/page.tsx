"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
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

type Usuario = {
  id: number;
  nombre: string;
  apellido?: string;
  email: string;
  telefono?: string | null;
  activo?: boolean;
  created_at?: string;
};

const formatDate = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" });
};

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("");
  const [sorting, setSorting] = useState<any>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('/api/usuarios/admin/todos?pagina=1&limite=200');
        const list = Array.isArray(res.data?.usuarios) ? res.data.usuarios : [];
        setUsuarios(list);
      } catch (e: unknown) {
        const msg = axios.isAxiosError(e)
          ? ((e.response?.data as { message?: string })?.message || e.message)
          : 'No se pudieron cargar los usuarios';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleEstado = async (u: Usuario) => {
    try {
      const res = await axios.patch(`/api/usuarios/admin/${u.id}/estado`, { activo: !u.activo });
      const message = res.data?.message || 'Estado actualizado';
      setUsuarios(prev => prev.map(x => x.id === u.id ? { ...x, activo: !u.activo } : x));
      toast.success(message);
    } catch (e: unknown) {
      const msg = axios.isAxiosError(e)
        ? ((e.response?.data as { message?: string })?.message || e.message)
        : 'No se pudo actualizar el estado';
      toast.error(msg);
    }
  };

  const filteredData = useMemo(() => {
    return usuarios.filter(u => {
      const glob = (globalFilter || '').toLowerCase();
      const nombreCompleto = `${u.nombre ?? ''} ${u.apellido ?? ''}`.trim().toLowerCase();
      const email = (u.email || '').toLowerCase();
      const telefono = (u.telefono || '').toLowerCase();
      const globOk = glob ? nombreCompleto.includes(glob) || email.includes(glob) || telefono.includes(glob) : true;
      const estadoOk = estadoFilter ? ((estadoFilter === 'activos' && u.activo) || (estadoFilter === 'inactivos' && !u.activo)) : true;
      return globOk && estadoOk;
    });
  }, [usuarios, globalFilter, estadoFilter]);

  const columns = useMemo<ColumnDef<Usuario>[]>(() => [
    { header: () => 'ID', accessorKey: 'id' },
    {
      header: () => 'Nombre',
      id: 'nombre_completo',
      accessorFn: (row) => `${row.nombre ?? ''} ${row.apellido ?? ''}`.trim(),
      cell: ({ getValue }) => <span className="font-medium text-slate-900">{String(getValue() || '')}</span>,
    },
    { header: () => 'Email', accessorKey: 'email' },
    {
      header: () => 'Teléfono',
      accessorKey: 'telefono',
      cell: ({ getValue }) => <span className="text-slate-600">{String(getValue() || '-')}</span>,
    },
    {
      header: () => 'Estado',
      accessorKey: 'activo',
      cell: ({ getValue }) => <StatusBadge active={Boolean(getValue())} />,
    },
    {
      header: () => 'Creado',
      accessorKey: 'created_at',
      cell: ({ getValue }) => <span className="text-slate-600">{formatDate(String(getValue()))}</span>,
    },
    {
      header: () => 'Acciones',
      id: 'acciones',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/usuarios/${row.original.id}`}
            className={buttonClasses({ variant: 'outline-primary', size: 'sm' })}
          >
            Ver/Editar
          </Link>
          <button
            className={buttonClasses({ variant: row.original.activo ? 'outline-secondary' : 'outline-success', size: 'sm' })}
            onClick={() => toggleEstado(row.original)}
          >
            {row.original.activo ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      ),
    },
  ], []);

  const table = useReactTable({
    data: filteredData,
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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-slate-900">Usuarios</h2>
        <div className="flex items-center gap-2">
          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
          >
            <option value="">Todos</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>
          <input
            placeholder="Buscar por nombre, email o teléfono…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-64 rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-300"
          />
          <button
            className={buttonClasses({ variant: 'outline-secondary', size: 'sm' })}
            onClick={() => { setGlobalFilter(''); setEstadoFilter(''); }}
          >
            Limpiar
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {loading && (
        <div className="mb-3 rounded-xl border border-slate-200 bg-white p-4">
          <Skeleton className="h-6 w-32 mb-4" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-3 py-2">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-48 col-span-2" />
              <Skeleton className="h-5 w-48 col-span-2" />
              <Skeleton className="h-8 w-32 justify-self-end" />
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
              <Td className="text-center text-slate-500 px-3 py-6" colSpan={columns.length}>No hay usuarios</Td>
            </Tr>
          )}
        </TBody>
      </Table>

      {/* Paginación */}
      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm text-slate-600">
          Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()} — {filteredData.length} usuarios
        </div>
        <div className="flex items-center gap-2">
          <button
            className={buttonClasses({ variant: 'outline-secondary', size: 'sm' })}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </button>
          <button
            className={buttonClasses({ variant: 'outline-primary', size: 'sm' })}
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