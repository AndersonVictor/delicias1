"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { buttonClasses, StatusBadge, Alert } from "@/design/admin";

type Usuario = {
  id: number;
  nombre: string;
  apellido?: string;
  email: string;
  telefono?: string | null;
  direccion?: string | null;
  activo?: boolean;
};

export default function EditarUsuarioPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [form, setForm] = useState({ nombre: "", apellido: "", email: "", telefono: "", direccion: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/usuarios/admin/${id}`);
        const u = res.data?.usuario || res.data;
        setUsuario(u);
        setForm({
          nombre: u?.nombre || "",
          apellido: u?.apellido || "",
          email: u?.email || "",
          telefono: u?.telefono || "",
          direccion: u?.direccion || "",
        });
        setError(null);
      } catch (e: unknown) {
        const msg = axios.isAxiosError(e)
          ? (e.response?.data as { message?: string } | undefined)?.message || e.message
          : 'No se pudo cargar el usuario';
        setError(msg);
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      type UpdatePayload = {
        nombre: string;
        apellido?: string;
        email: string;
        telefono?: string | null;
        direccion?: string | null;
      };
      const payload: UpdatePayload = {
        nombre: form.nombre,
        apellido: form.apellido || undefined,
        email: form.email,
        telefono: form.telefono || null,
        direccion: form.direccion || null,
      };
      const res = await axios.put(`/api/usuarios/admin/${id}`, payload);
      const u = res.data?.usuario || res.data;
      setUsuario(u);
      alert('Usuario actualizado');
      router.push('/admin/usuarios');
    } catch (e: unknown) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data as { message?: string } | undefined)?.message || e.message
        : 'No se pudo actualizar el usuario';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const toggleActivo = async () => {
    if (!usuario) return;
    try {
      const res = await axios.patch(`/api/usuarios/admin/${id}/estado`, { activo: !usuario.activo });
      const u = res.data?.usuario || res.data;
      setUsuario({ ...usuario, activo: u?.activo ?? !usuario.activo });
    } catch (e: unknown) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data as { message?: string } | undefined)?.message || e.message
        : 'No se pudo actualizar el estado';
      alert(msg);
    }
  };

  if (loading) return <Alert variant="info" className="mb-3">Cargando…</Alert>;
  if (error) return <Alert variant="danger" className="mb-3">{error}</Alert>;
  if (!usuario) return <Alert variant="warning" className="mb-3">Usuario no encontrado</Alert>;

  return (
    <div>
      <h2 className="text-base font-semibold text-slate-900 mb-3">Editar usuario</h2>
      <form onSubmit={onSubmit} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium text-slate-700">Nombre</label>
          <input type="text" name="nombre" value={form.nombre} onChange={onChange} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-300" required minLength={2} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Apellido</label>
          <input type="text" name="apellido" value={form.apellido} onChange={onChange} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-300" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input type="email" name="email" value={form.email} onChange={onChange} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-300" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Teléfono</label>
          <input type="tel" name="telefono" value={form.telefono} onChange={onChange} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-300" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Dirección</label>
          <textarea name="direccion" value={form.direccion} onChange={onChange} rows={2} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-300" />
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-slate-700">Estado:</span>
          <StatusBadge active={usuario.activo} />
          <button type="button" className={buttonClasses({ variant: usuario.activo ? 'outline-secondary' : 'outline-success', size: 'sm' })} onClick={toggleActivo}>
            {usuario.activo ? 'Desactivar' : 'Activar'}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className={buttonClasses({ variant: 'primary', size: 'md' })} disabled={saving} type="submit">{saving ? 'Guardando…' : 'Guardar cambios'}</button>
          <button type="button" className={buttonClasses({ variant: 'outline-secondary', size: 'md' })} onClick={() => router.push('/admin/usuarios')}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}