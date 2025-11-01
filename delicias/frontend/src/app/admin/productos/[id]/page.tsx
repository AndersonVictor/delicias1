"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import { buttonClasses, Alert } from "@/design/admin";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";

type Categoria = { id: number; nombre: string };

type Producto = {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  categoria_id?: number;
  stock?: number;
  destacado?: boolean;
  imagen?: string | null;
};

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

export default function EditarProductoPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
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
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          axios.get('/api/categorias'),
          axios.get(`/api/productos/${id}`)
        ]);
        const catsData = catRes.data?.data || catRes.data?.categorias || catRes.data;
        setCategorias(Array.isArray(catsData) ? catsData : (Array.isArray(catsData?.categorias) ? catsData.categorias : []));
        const p: Producto = prodRes.data?.producto || prodRes.data;
        reset({
          nombre: p.nombre || '',
          descripcion: p.descripcion || '',
          precio: Number(p.precio ?? 0),
          categoria_id: Number(p.categoria_id ?? 0),
          stock: Number(p.stock ?? 0),
          destacado: !!p.destacado,
          imagen_url: (p.imagen && String(p.imagen).startsWith('http')) ? String(p.imagen) : '',
        });
        setError(null);
      } catch (e: unknown) {
        const msg = axios.isAxiosError(e)
          ? (e.response?.data as { message?: string } | undefined)?.message || e.message
          : 'No se pudo cargar el producto';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id, reset]);

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
        await axios.put(`/api/productos/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        type UpdatePayload = {
          nombre: string;
          descripcion?: string;
          precio: number;
          categoria_id: number;
          stock: number;
          destacado: boolean;
          imagen_url?: string | null;
        };
        const payload: UpdatePayload = {
          nombre: values.nombre,
          descripcion: values.descripcion || undefined,
          precio: values.precio,
          categoria_id: values.categoria_id,
          stock: values.stock || 0,
          destacado: values.destacado || false,
          imagen_url: values.imagen_url ? values.imagen_url : null,
        };
        await axios.put(`/api/productos/${id}`, payload);
      }
      toast.success('Producto actualizado');
      router.push('/admin/productos');
    } catch (e: unknown) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data as { message?: string; error?: string } | undefined)?.message ||
          (e.response?.data as { message?: string; error?: string } | undefined)?.error ||
          e.message
        : 'No se pudo actualizar el producto';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Alert variant="info" className="mb-3">Cargando…</Alert>;
  if (error) return <Alert variant="danger" className="mb-3">{error}</Alert>;

  return (
    <div>
      <h2 className="text-base font-semibold text-slate-900 mb-3">Editar producto #{id}</h2>
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
          <label className="block text sm font-medium text-slate-700">Categoría</label>
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
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
          <button type="button" className={buttonClasses({ variant: 'link', size: 'md' })} onClick={() => router.back()}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}