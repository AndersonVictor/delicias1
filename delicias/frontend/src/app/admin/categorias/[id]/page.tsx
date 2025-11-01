"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { buttonClasses, Alert } from "@/design/admin";
import getImageSrc from "@/utils/image";

type Categoria = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  imagen?: string | null;
  activo?: boolean;
};

export default function EditarCategoriaPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [form, setForm] = useState({ nombre: "", descripcion: "", imagen: "" });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/categorias/admin/${id}`);
        const cat = res.data?.categoria || res.data;
        setCategoria(cat);
        setForm({ nombre: cat?.nombre || "", descripcion: cat?.descripcion || "", imagen: cat?.imagen || "" });
        setError(null);
      } catch (e: unknown) {
        const errMsg = axios.isAxiosError(e)
          ? ((e.response?.data as { message?: string })?.message || e.message)
          : e instanceof Error
          ? e.message
          : 'No se pudo cargar la categoría';
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    const p = f ? URL.createObjectURL(f) : null;
    setPreview(p);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // 1) si hay archivo, subir imagen local primero y actualizar estado local con la ruta devuelta
      if (file) {
        const fd = new FormData();
        fd.append('imagen', file);
        const imgRes = await axios.put(`/api/categorias/admin/${id}/imagen`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const catActualizada = imgRes.data?.categoria || imgRes.data;
        if (catActualizada) {
          setCategoria((prev) => ({ ...(prev || catActualizada), imagen: catActualizada.imagen }));
          setForm((prev) => ({ ...prev, imagen: catActualizada.imagen || prev.imagen }));
        }
      }
      // 2) luego actualizar campos de texto SIN sobreescribir imagen si se subió archivo o si el campo está vacío
      const payload: Record<string, any> = {
        nombre: form.nombre,
        descripcion: form.descripcion || null,
      };
      // incluir imagen solo si el usuario proporcionó una URL no vacía y no se subió archivo
      if (!file) {
        const imgVal = (form.imagen || '').trim();
        if (imgVal) payload.imagen = imgVal;
      }
      const res = await axios.put(`/api/categorias/admin/${id}`, payload);
      const cat = res.data?.categoria || res.data;
      setCategoria(cat);
      alert('Categoría actualizada');
      router.push('/admin/categorias');
    } catch (e: unknown) {
      const errMsg = axios.isAxiosError(e)
        ? ((e.response?.data as { message?: string; error?: string })?.message || (e.response?.data as any)?.error || e.message)
        : e instanceof Error
        ? e.message
        : 'No se pudo actualizar la categoría';
      setError(errMsg);
    } finally {
      setSaving(false);
      // limpiar objeto URL del preview para liberar memoria
      if (preview) {
        try { URL.revokeObjectURL(preview); } catch {}
      }
    }
  };

  const imagenActualSrc = useMemo(() => getImageSrc(form.imagen || categoria?.imagen || null, { width: 600 }), [form.imagen, categoria?.imagen]);

  if (loading) return <Alert variant="info" className="mb-3">Cargando…</Alert>;
  if (error) return <Alert variant="danger" className="mb-3">{error}</Alert>;
  if (!categoria) return <Alert variant="warning" className="mb-3">Categoría no encontrada</Alert>;

  return (
    <div>
      <h2 className="text-base font-semibold text-slate-900 mb-3">Editar categoría</h2>
      <form onSubmit={onSubmit} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium text-slate-700">Nombre</label>
          <input type="text" name="nombre" value={form.nombre} onChange={onChange} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-300" required minLength={2} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Descripción</label>
          <textarea name="descripcion" value={form.descripcion} onChange={onChange} rows={3} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-300" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Imagen (URL externa opcional)</label>
            <input type="url" name="imagen" value={form.imagen} onChange={onChange} placeholder="https://..." className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-300" />
            <p className="mt-1 text-xs text-slate-500">Si subes un archivo local, se usará esa imagen y esta URL puede quedar vacía.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Subir imagen local</label>
            <input type="file" accept="image/*" onChange={onFileChange} className="mt-1 block w-full text-sm" />
            {preview ? (
              <div className="mt-2 h-24 w-full overflow-hidden rounded-md border border-slate-200 bg-white">
                <Image src={preview} alt="Previsualización" width={320} height={96} className="h-full w-full object-cover" />
              </div>
            ) : imagenActualSrc ? (
              <div className="mt-2 h-24 w-full overflow-hidden rounded-md border border-slate-200 bg-white">
                <Image src={imagenActualSrc} alt={categoria.nombre} width={320} height={96} className="h-full w-full object-cover" />
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className={buttonClasses({ variant: 'primary', size: 'md' })} disabled={saving} type="submit">{saving ? 'Guardando…' : 'Guardar cambios'}</button>
          <button type="button" className={buttonClasses({ variant: 'outline-secondary', size: 'md' })} onClick={() => router.push('/admin/categorias')}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}