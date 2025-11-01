"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { buttonClasses, Alert } from "@/design/admin";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";

type Categoria = { id: number; nombre: string };

const schema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  descripcion: z.string().max(1000, "Máximo 1000 caracteres").optional().or(z.literal("")),
  precio: z.coerce.number().min(0, "El precio debe ser mayor o igual a 0"),
  categoria_id: z.coerce.number().int().positive("Selecciona una categoría"),
  stock: z.coerce.number().int().min(0, "Stock debe ser 0 o más").default(0),
  destacado: z.boolean().optional().default(false),
  imagen_url: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || v.length === 0 || /^https?:\/\//.test(v), "URL inválida")
    .or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export default function NuevoProductoPage() {
  const router = useRouter();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      precio: 0,
      categoria_id: 0,
      stock: 0,
      destacado: false,
      imagen_url: "",
    },
  });

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await axios.get('/api/categorias');
        const data = res.data?.data || res.data?.categorias || res.data;
        const list = Array.isArray(data) ? data : (Array.isArray(data?.categorias) ? data.categorias : []);
        setCategorias(list);
      } catch (e: unknown) {
        console.error(e);
      }
    };
    fetchCategorias();
  }, []);

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    setError(null);
    try {
      if (file) {
        const fd = new FormData();
        fd.append('nombre', values.nombre);
        if (values.descripcion) fd.append('descripcion', values.descripcion);
        fd.append('precio', String(values.precio));
        fd.append('categoria_id', String(values.categoria_id));
        fd.append('stock', String(values.stock || 0));
        fd.append('destacado', String(values.destacado || false));
        if (values.imagen_url) fd.append('imagen_url', values.imagen_url);
        fd.append('imagen', file as Blob);
        await axios.post('/api/productos', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        const payload = {
          nombre: values.nombre,
          descripcion: values.descripcion || undefined,
          precio: values.precio,
          categoria_id: values.categoria_id,
          stock: values.stock || 0,
          destacado: values.destacado || false,
          imagen_url: values.imagen_url || undefined,
        };
        await axios.post('/api/productos', payload);
      }
      toast.success('Producto creado');
      router.push('/admin/productos');
    } catch (e: unknown) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data as { message?: string; error?: string } | undefined)?.message ||
          (e.response?.data as { message?: string; error?: string } | undefined)?.error ||
          e.message
        : 'No se pudo crear el producto';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-base font-semibold text-slate-900 mb-3">Nuevo producto</h2>
      {error && (
        <Alert variant="danger" className="mb-3">{error}</Alert>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Nombre</label>
          <input
            {...register('nombre')}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-300"
          />
          {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Precio (S/.)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register('precio')}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-300"
          />
          {errors.precio && <p className="mt-1 text-xs text-red-600">{errors.precio.message}</p>}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700">Descripción</label>
          <textarea
            rows={3}
            {...register('descripcion')}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-300"
          />
          {errors.descripcion && <p className="mt-1 text-xs text-red-600">{errors.descripcion.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Categoría</label>
          <select
            {...register('categoria_id')}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-300"
          >
            <option value={0}>Selecciona…</option>
            {categorias.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
          {errors.categoria_id && <p className="mt-1 text-xs text-red-600">{errors.categoria_id.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Stock</label>
          <input
            type="number"
            min="0"
            {...register('stock')}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-300"
          />
          {errors.stock && <p className="mt-1 text-xs text-red-600">{errors.stock.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Destacado</label>
          <div className="mt-2 flex items-center gap-2">
            <input
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-300"
              type="checkbox"
              {...register('destacado')}
            />
            <span className="text-sm text-slate-700">Mostrar como destacado</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Imagen (archivo)</label>
          <input type="file" accept="image/*" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Imagen URL (opcional)</label>
          <input
            {...register('imagen_url')}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-300"
          />
          {errors.imagen_url && <p className="mt-1 text-xs text-red-600">{errors.imagen_url.message}</p>}
        </div>
        <div className="md:col-span-2 flex items-center gap-2">
          <button className={buttonClasses({ variant: 'primary', size: 'md' })} disabled={saving} type="submit">
            {saving ? 'Guardando…' : 'Crear producto'}
          </button>
          <button type="button" className={buttonClasses({ variant: 'link', size: 'md' })} onClick={() => router.back()}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}