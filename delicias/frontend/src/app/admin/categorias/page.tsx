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
import CategoryCard from "@/components/Category/CategoryCard";

type Categoria = {
  id: number;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  imagen?: string | null;
};

export default function AdminCategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<any>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [vista, setVista] = useState<"album" | "tabla">("album");

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await axios.get('/api/categorias/admin/todos?pagina=1&limite=200');
        const data = res.data?.categorias || res.data?.data || res.data;
        setCategorias(Array.isArray(data) ? data : []);
        setError(null);
      } catch (e: unknown) {
        const errMsg = axios.isAxiosError(e)
          ? ((e.response?.data as { message?: string })?.message || e.message)
          : 'No se pudieron cargar las categorías';
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchCategorias();
  }, []);

  const toggleActivo = async (c: Categoria) => {
    try {
      const res = await axios.patch(`/api/categorias/admin/${c.id}/estado`, { activo: !c.activo });
      const actualizado = res.data?.categoria || res.data;
      setCategorias(prev => prev.map(x => x.id === c.id ? { ...x, activo: actualizado?.activo ?? !c.activo } : x));
      toast.success(actualizado?.activo ? 'Categoría activada' : 'Categoría desactivada');
    } catch (e: unknown) {
      const errMsg = axios.isAxiosError(e)
        ? ((e.response?.data as { message?: string })?.message || e.message)
        : 'No se pudo actualizar el estado';
      toast.error(errMsg);
    }
  };

  const eliminar = async (c: Categoria) => {
    const ok = confirm(`¿Eliminar la categoría "${c.nombre}"?`);
    if (!ok) return;
    try {
      await axios.delete(`/api/categorias/admin/${c.id}`);
      setCategorias(prev => prev.filter(x => x.id !== c.id));
      toast.success('Categoría eliminada');
    } catch (e: unknown) {
      const errMsg = axios.isAxiosError(e)
        ? ((e.response?.data as { message?: string })?.message || e.message)
        : 'No se pudo eliminar la categoría';
      toast.error(errMsg);
    }
  };

  const columns = useMemo<ColumnDef<Categoria>[]>(() => [
    { header: () => 'ID', accessorKey: 'id' },
    {
      header: () => 'Nombre',
      accessorKey: 'nombre',
      cell: ({ getValue }) => <span className="font-medium text-slate-900">{String(getValue() || '')}</span>,
      filterFn: (row, _columnId, filterValue) => String(row.original.nombre || '').toLowerCase().includes(String(filterValue || '').toLowerCase()),
    },
    {
      header: () => 'Descripción',
      accessorKey: 'descripcion',
      cell: ({ getValue }) => <span className="text-slate-500">{String(getValue() || '-')}</span>,
    },
    {
      header: () => 'Estado',
      accessorKey: 'activo',
      cell: ({ getValue }) => <StatusBadge active={Boolean(getValue())} />,
    },
    {
      header: () => 'Acciones',
      id: 'acciones',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link href={`/admin/categorias/${row.original.id}`} className={buttonClasses({ variant: 'outline-primary', size: 'sm' })}>
            Editar
          </Link>
          <button
            className={buttonClasses({ variant: row.original.activo ? 'outline-secondary' : 'outline-success', size: 'sm' })}
            onClick={() => toggleActivo(row.original)}
          >
            {row.original.activo ? 'Desactivar' : 'Activar'}
          </button>
          <button
            className={buttonClasses({ variant: 'outline-danger', size: 'sm' })}
            onClick={() => eliminar(row.original)}
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ], []);

  const table = useReactTable({
    data: categorias,
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

  const filteredCategorias = useMemo(() => {
    const q = String(globalFilter || '').toLowerCase();
    return categorias.filter((c) => String(c.nombre || '').toLowerCase().includes(q));
  }, [categorias, globalFilter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-slate-900">Categorías</h2>
        <Link href="/admin/categorias/nueva" className={buttonClasses({ variant: "primary", size: "sm" })}>
          Nueva categoría
        </Link>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <input
          placeholder="Buscar por nombre…"
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-full md:w-64 rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-300"
        />
        <div className="ml-auto flex items-center gap-1">
          <button
            className={buttonClasses({ variant: vista === "album" ? "primary" : "outline-secondary", size: "sm" })}
            onClick={() => setVista("album")}
            title="Vista en álbum"
          >
            Álbum
          </button>
          <button
            className={buttonClasses({ variant: vista === "tabla" ? "primary" : "outline-secondary", size: "sm" })}
            onClick={() => setVista("tabla")}
            title="Vista en tabla"
          >
            Tabla
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
            <div key={i} className="grid grid-cols-5 gap-3 py-2">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-40 col-span-2" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-8 w-32 justify-self-end" />
            </div>
          ))}
        </div>
      )}

      {vista === "album" ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filteredCategorias.map((c) => (
            <CategoryCard key={c.id} categoria={c} href={`/admin/productos?categoria=${c.id}`} />
          ))}
          {!loading && filteredCategorias.length === 0 && (
            <div className="col-span-full rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-slate-600">
              No hay categorías para mostrar.
            </div>
          )}
        </div>
      ) : (
        <>
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
                  <Td className="text-center text-slate-500 px-3 py-6" colSpan={columns.length}>No hay categorías</Td>
                </Tr>
              )}
            </TBody>
          </Table>

          {/* Paginación */}
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()} — {categorias.length} categorías
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
        </>
      )}
    </div>
  );
}