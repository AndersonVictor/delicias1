"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { buttonClasses } from "@/design/admin";

export default function NuevaCategoriaPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nombre: "", descripcion: "", imagen: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      type NuevaCategoriaPayload = { nombre: string; descripcion?: string; imagen?: string };
      const payload: NuevaCategoriaPayload = {
        nombre: form.nombre,
        descripcion: form.descripcion || undefined,
        imagen: form.imagen || undefined,
      };
      const res = await axios.post('/api/categorias/admin', payload);
      const cat = res.data?.categoria || res.data;
      if (cat?.id) router.push(`/admin/categorias/${cat.id}`);
      else router.push('/admin/categorias');
    } catch (e: unknown) {
      const errMsg = axios.isAxiosError(e)
        ? ((e.response?.data as { message?: string })?.message || e.message)
        : e instanceof Error
        ? e.message
        : 'No se pudo crear la categoría';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-base font-semibold text-slate-900 mb-3">Nueva categoría</h2>
      {error && (
        <div className="mb-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}
      <form onSubmit={onSubmit} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium text-slate-700">Nombre</label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={onChange}
            required
            minLength={2}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Descripción</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={onChange}
            rows={3}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Imagen (URL opcional)</label>
          <input
            type="url"
            name="imagen"
            value={form.imagen}
            onChange={onChange}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-300"
          />
        </div>
        <div className="flex items-center gap-2">
          <button disabled={loading} type="submit" className={buttonClasses({ variant: "primary", size: "md" })}>
            {loading ? 'Creando…' : 'Crear'}
          </button>
          <button type="button" className={buttonClasses({ variant: "outline-secondary", size: "md" })} onClick={() => router.push('/admin/categorias')}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}