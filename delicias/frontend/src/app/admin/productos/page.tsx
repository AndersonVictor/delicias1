"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";

// Deshabilitar generación estática para páginas que usan useSearchParams
export const dynamic = 'force-dynamic';

// Normaliza src para evitar errores en next/image con URLs inválidas
const normalizeProductImageSrc = (src?: string | null): string | null => {
  if (!src || typeof src !== "string") return null;
  const trimmed = src.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("/")) return trimmed; // paths internos como /uploads/...
  if (trimmed.startsWith("uploads/")) return `/${trimmed}`;
  // Como fallback, asumir que es un nombre de archivo dentro de /uploads
  return `/uploads/${trimmed}`;
};
import { formatPEN } from "@/utils/currency";
import { Table, THead, Th, TBody, Tr, Td, buttonClasses, StatusBadge, Alert, Badge } from "@/design/admin";
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

type Producto = {
  id: number;
  nombre: string;
  descripcion?: string;
  precio?: number;
  activo?: boolean;
  categoria?: { id: number; nombre: string };
  categoria_id?: number;
  destacado?: boolean;
  imagen?: string | null;
  stock?: number;
};

export default function AdminProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<any>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [mostrarSoloBajo, setMostrarSoloBajo] = useState(false);
  const LOW_STOCK_THRESHOLD = 5;
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<number | null>(null);
  const [categoriasList, setCategoriasList] = useState<{ id: number; nombre: string }[]>([]);

  useEffect(() => {
    const sp = searchParams?.get('categoria');
    const initial = sp ? parseInt(sp, 10) : NaN;
    setSelectedCategoriaId(!isNaN(initial) ? initial : null);
  }, [searchParams]);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await axios.get('/api/categorias');
        const data = res.data?.data || res.data?.categorias || res.data;
        const list = Array.isArray(data) ? data : (Array.isArray(data?.categorias) ? data.categorias : []);
        setCategoriasList(list.map((c: any) => ({ id: Number(c.id), nombre: String(c.nombre || '') })));
      } catch (e) {
        // no-op
      }
    };
    fetchCategorias();
  }, []);

  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true);
      try {
        const base = '/api/productos?pagina=1&limite=200';
        const url = selectedCategoriaId ? `${base}&categoria=${selectedCategoriaId}` : base;
        const res = await axios.get(url);
        const data = res.data?.data || res.data?.productos || res.data?.items || res.data;
        setProductos(Array.isArray(data) ? data : []);
        setError(null);
      } catch (e: unknown) {
        const msg = axios.isAxiosError(e)
          ? (e.response?.data as { message?: string } | undefined)?.message || e.message
          : 'No se pudieron cargar los productos';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
    // Reiniciar paginación cuando cambia el filtro de categoría
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [selectedCategoriaId]);

  const toggleDestacado = async (p: Producto) => {
    try {
      const res = await axios.put(`/api/productos/${p.id}`, { destacado: !p.destacado });
      const actualizado = res.data?.producto || res.data;
      setProductos((prev) => prev.map(item => item.id === p.id ? { ...item, destacado: actualizado?.destacado ?? !p.destacado } : item));
      toast.success(actualizado?.destacado ? "Producto marcado como destacado" : "Producto ya no es destacado");
    } catch (e: unknown) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data as { message?: string } | undefined)?.message || e.message
        : 'No se pudo actualizar el producto';
      toast.error(msg);
    }
  };

  const eliminar = async (p: Producto) => {
    if (!confirm(`¿Eliminar el producto "${p.nombre}"?`)) return;
    try {
      await axios.delete(`/api/productos/${p.id}`);
      setProductos((prev) => prev.filter(item => item.id !== p.id));
      toast.success("Producto eliminado");
    } catch (e: unknown) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data as { message?: string } | undefined)?.message || e.message
        : 'No se pudo eliminar el producto';
      toast.error(msg);
    }
  };

  const columns = useMemo<ColumnDef<Producto>[]>(() => [
    {
      header: () => "ID",
      accessorKey: "id",
    },
    {
      header: () => "Nombre",
      accessorKey: "nombre",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {(() => {
            const imgSrc = normalizeProductImageSrc(row.original.imagen as any);
            return imgSrc ? (
              <div className="h-14 w-14 overflow-hidden rounded-md border border-slate-200 bg-white flex-shrink-0">
                <Image
                  src={imgSrc}
                  alt={row.original.nombre || "Producto"}
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="h-14 w-14 overflow-hidden rounded-md border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                <span className="text-xs">Sin imagen</span>
              </div>
            );
          })()}
          <span className="font-medium text-slate-900">{row.original.nombre}</span>
        </div>
      ),
      filterFn: (row, _columnId, filterValue) => {
        const name = String(row.original.nombre || "").toLowerCase();
        return name.includes(String(filterValue || "").toLowerCase());
      },
    },
    {
      header: () => "Categoría",
      id: "categoria",
      accessorFn: (row) => row.categoria?.nombre ?? row.categoria_id ?? "-",
      cell: ({ getValue }) => <span className="text-slate-500">{String(getValue() ?? "-")}</span>,
    },
    {
      header: () => "Precio",
      accessorKey: "precio",
      cell: ({ getValue }) => formatPEN(Number(getValue() || 0)),
      sortingFn: "basic",
    },
    {
      header: () => "Stock",
      accessorKey: "stock",
      cell: ({ getValue }) => {
        const s = Number(getValue() || 0);
        const variant = s === 0 ? "danger" : s <= LOW_STOCK_THRESHOLD ? "warning" : "success";
        return (
          <Badge variant={variant as any} size="md" className="min-w-[100px] justify-center">
            {s === 0 ? "Agotado" : `${s} en stock`}
          </Badge>
        );
      },
      sortingFn: "basic",
    },
    {
      header: () => "Estado",
      accessorKey: "activo",
      cell: ({ getValue }) => <StatusBadge active={Boolean(getValue())} />,
    },
    {
      header: () => "Acciones",
      id: "acciones",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/productos/${row.original.id}`}
            className={buttonClasses({ variant: "outline-primary", size: "sm" })}
          >
            Editar
          </Link>
          <button
            className={buttonClasses({ variant: row.original.destacado ? "warning" : "outline-secondary", size: "sm" })}
            onClick={() => toggleDestacado(row.original)}
          >
            {row.original.destacado ? "Quitar destacado" : "Destacar"}
          </button>
          <button
            className={buttonClasses({ variant: "outline-danger", size: "sm" })}
            onClick={() => eliminar(row.original)}
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ], []);

  // Memorizar datos filtrados para evitar recalcular y recrear arrays en cada render
  const filteredProductos = useMemo(() => {
    return mostrarSoloBajo
      ? productos.filter((p) => Number(p.stock || 0) <= LOW_STOCK_THRESHOLD)
      : productos;
  }, [productos, mostrarSoloBajo]);

  const table = useReactTable({
    data: filteredProductos,
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
        <h2 className="text-base font-semibold text-slate-900">Productos</h2>
        <Link href="/admin/productos/nuevo" className={buttonClasses({ variant: "primary", size: "sm" })}>
          Nuevo producto
        </Link>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <input
          placeholder="Buscar por nombre…"
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-full md:w-64 rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-300"
        />
        <button
          className={buttonClasses({ variant: mostrarSoloBajo ? "outline-primary" : "outline-secondary", size: "sm" })}
          onClick={() => {
            setMostrarSoloBajo((v) => !v);
            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
          }}
        >
          {mostrarSoloBajo ? "Ver todos" : "Ver stock bajo"}
        </button>
        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm text-slate-600">Categoría:</label>
          <select
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
            value={selectedCategoriaId ?? ''}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : null;
              setSelectedCategoriaId(val);
              const params = new URLSearchParams(window.location.search);
              if (val) params.set('categoria', String(val)); else params.delete('categoria');
              router.replace(`/admin/productos?${params.toString()}`);
            }}
          >
            <option value="">Todas</option>
            {categoriasList.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Alerta de stock bajo */}
      {!loading && (() => {
        const agotados = productos.filter((p) => Number(p.stock || 0) === 0);
        const bajoStock = productos.filter((p) => Number(p.stock || 0) > 0 && Number(p.stock || 0) <= LOW_STOCK_THRESHOLD);
        const hayAlertas = agotados.length > 0 || bajoStock.length > 0;
        if (!hayAlertas) return null;
        return (
          <Alert
            variant={agotados.length > 0 ? "danger" : "warning"}
            title={agotados.length > 0 ? "Productos agotados o con stock bajo" : "Productos con stock bajo"}
            className="mb-3"
          >
            <div className="flex flex-col gap-2">
              {agotados.length > 0 && (
                <div>
                  Agotados: <span className="font-semibold">{agotados.length}</span>
                </div>
              )}
              {bajoStock.length > 0 && (
                <div>
                  Bajo stock (≤ {LOW_STOCK_THRESHOLD}): <span className="font-semibold">{bajoStock.length}</span>
                </div>
              )}
              <div className="mt-1 flex flex-wrap gap-2">
                {[...agotados.slice(0, 5), ...bajoStock.slice(0, 5)].map((p) => (
                  <Badge key={p.id} variant={Number(p.stock || 0) === 0 ? "danger" : "warning"}>
                    {p.nombre} — {Number(p.stock || 0)}
                  </Badge>
                ))}
              </div>
            </div>
          </Alert>
        );
      })()}

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
              <Skeleton className="h-5 w-40 col-span-2" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
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
              <Td className="text-center text-slate-500 px-3 py-6" colSpan={columns.length}>No hay productos</Td>
            </Tr>
          )}
        </TBody>
      </Table>

      {/* Paginación */}
      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm text-slate-600">
          Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()} — {filteredProductos.length} productos
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