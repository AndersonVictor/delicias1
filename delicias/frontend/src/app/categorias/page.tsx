"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import CategoryCard, { type Category } from "@/components/Category/CategoryCard";
import Skeleton from "@/components/ui/Skeleton";

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await axios.get("/api/categorias");
        const data = Array.isArray(res.data?.categorias) ? res.data.categorias : res.data;
        setCategorias(Array.isArray(data) ? data : []);
        setError(null);
      } catch (e: unknown) {
        setError("No se pudieron cargar las categorías");
      } finally {
        setLoading(false);
      }
    };
    fetchCategorias();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-semibold text-gray-900">Categorías</h1>
      <p className="mb-6 text-gray-600">Explora nuestras categorías.</p>

      {error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      {loading && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-2">
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="mt-2 h-5 w-24" />
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {categorias.map((c) => (
            <CategoryCard key={c.id} categoria={c} href={null} />
          ))}
          {categorias.length === 0 && (
            <div className="col-span-full rounded-xl border border-gray-200 bg-white px-4 py-8 text-center text-gray-600">
              No hay categorías disponibles.
            </div>
          )}
        </div>
      )}
    </div>
  );
}