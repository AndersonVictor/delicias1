"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

type Perfil = {
  id: number;
  nombre: string | null;
  apellido: string | null;
  email: string;
  telefono: string | null;
  direccion: string | null;
  created_at?: string;
};

export default function ProfilePage() {
  const { isAuthenticated, user, updateUser } = useAuth();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [stats, setStats] = useState<{ total_pedidos: number; total_gastado: number } | null>(null);

  // Form state
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");

  // Password form state
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  useEffect(() => {
    const fetchPerfil = async () => {
      if (!isAuthenticated()) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get("/api/usuarios/perfil");
        const p: Perfil = res.data.usuario;
        setPerfil(p);
        setNombre(p.nombre || "");
        setApellido(p.apellido || "");
        setTelefono(p.telefono || "");
        setDireccion(p.direccion || "");
        // Cargar estadísticas básicas del usuario
        try {
          const statsRes = await axios.get("/api/usuarios/estadisticas");
          const s = statsRes.data?.estadisticas;
          if (s) {
            setStats({ total_pedidos: s.total_pedidos ?? 0, total_gastado: s.total_gastado ?? 0 });
          }
        } catch (err) {
          // No bloquear carga de perfil si falla stats
          console.warn("No se pudieron cargar estadísticas del usuario");
        }
      } catch (err: unknown) {
        const msg = axios.isAxiosError(err)
          ? (err.response?.data as { message?: string; error?: string } | undefined)?.message || err.message
          : "Error al cargar el perfil";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchPerfil();
  }, [isAuthenticated]);

  const handleGuardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      type PerfilPayload = Partial<{ nombre: string; apellido: string; telefono: string; direccion: string }>;
      const body: PerfilPayload = {};
      // Solo enviar campos que hayan cambiado para evitar errores de validación innecesarios
      if (nombre !== (perfil?.nombre || "")) body.nombre = nombre || undefined;
      if (apellido !== (perfil?.apellido || "")) body.apellido = apellido || undefined;
      if (telefono !== (perfil?.telefono || "")) body.telefono = telefono || undefined;
      if (direccion !== (perfil?.direccion || "")) body.direccion = direccion || undefined;

      const res = await axios.put("/api/usuarios/perfil", body);
      const updated = res.data.usuario as Perfil;
      setPerfil(updated);
      setSuccess("Perfil actualizado correctamente");
      // Actualizar usuario en AuthContext si aplica
      updateUser({ ...user, ...updated });
    } catch (err: unknown) {
      let msg: string | undefined;
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as unknown;
        if (typeof data === 'object' && data !== null) {
          const o = data as { message?: string; error?: string; details?: Array<{ msg?: string }> };
          msg = o.message || o.error || (Array.isArray(o.details) ? o.details[0]?.msg : undefined);
        }
        msg = msg || err.message;
      }
      setError(msg || "Error al actualizar el perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await axios.put("/api/usuarios/cambiar-password", {
        passwordActual,
        passwordNueva,
        confirmarPassword,
      });
      if (res.status >= 200 && res.status < 300) {
        setSuccess(res.data?.message || "Contraseña cambiada correctamente");
        setPasswordActual("");
        setPasswordNueva("");
        setConfirmarPassword("");
      }
    } catch (err: unknown) {
      let msg: string | undefined;
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as unknown;
        if (typeof data === 'object' && data !== null) {
          const o = data as { message?: string; error?: string; details?: Array<{ msg?: string }> };
          msg = o.message || o.error || (Array.isArray(o.details) ? o.details[0]?.msg : undefined);
        }
        msg = msg || err.message;
      }
      setError(msg || "Error al cambiar la contraseña");
    } finally {
      setPwdSaving(false);
    }
  };

  if (!isAuthenticated()) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Perfil</h1>
        <p className="mb-4">Debes iniciar sesión para ver tu perfil.</p>
        <Link href="/login" className="px-4 py-2 rounded bg-gray-800 text-white hover:bg-gray-900">Ir a iniciar sesión</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Mi perfil</h1>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-6 bg-gray-200 rounded w-1/2" />
          <div className="h-6 bg-gray-200 rounded w-2/3" />
        </div>
      ) : (
        <div className="space-y-6">
          {(error || success) && (
            <div className={`p-3 rounded ${error ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
              {error || success}
            </div>
          )}

          {/* Datos del perfil */}
          <form onSubmit={handleGuardarPerfil} className="bg-white border rounded p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Apellido</label>
                <input
                  type="text"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2"
                  placeholder="Tu apellido"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" value={perfil?.email || ""} readOnly className="mt-1 w-full border rounded px-3 py-2 bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2"
                  placeholder="600123456"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Dirección</label>
              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className="mt-1 w-full border rounded px-3 py-2"
                placeholder="Av. Siempre Viva 742"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded bg-gray-800 text-white hover:bg-gray-900 disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>

          {/* Cambiar contraseña */}
          <form onSubmit={handleCambiarPassword} className="bg-white border rounded p-4 space-y-4">
            <h2 className="text-lg font-semibold">Cambiar contraseña</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Contraseña actual</label>
                <input
                  type="password"
                  value={passwordActual}
                  onChange={(e) => setPasswordActual(e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2"
                  placeholder="********"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nueva contraseña</label>
                <input
                  type="password"
                  value={passwordNueva}
                  onChange={(e) => setPasswordNueva(e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2"
                  placeholder="********"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirmar contraseña</label>
                <input
                  type="password"
                  value={confirmarPassword}
                  onChange={(e) => setConfirmarPassword(e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2"
                  placeholder="********"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="submit"
                disabled={pwdSaving}
                className="px-4 py-2 rounded bg-gray-800 text-white hover:bg-gray-900 disabled:opacity-50"
              >
                {pwdSaving ? "Guardando..." : "Cambiar contraseña"}
              </button>
            </div>
          </form>

          {/* Información adicional */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-sm text-gray-700">
            {perfil?.created_at && (
              <div>Miembro desde: {new Date(perfil.created_at).toLocaleDateString("es-ES")}</div>
            )}
            {stats && (
              <div className="flex items-center gap-4">
                <span>Pedidos: <strong>{stats.total_pedidos}</strong></span>
                <span>Total gastado: <strong>{stats.total_gastado.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</strong></span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}