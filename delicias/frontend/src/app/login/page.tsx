"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await login(email, password, false);
    setLoading(false);
    if (res.success) {
      router.push("/");
    } else {
      setError(res.error || "Error al iniciar sesión");
    }
  };

  return (
    <div className="max-w-md mx-auto w-full mt-10 p-6 border rounded-lg bg-white shadow-sm">
      <h1 className="text-2xl font-semibold mb-4">Iniciar sesión</h1>
      {error && (
        <div className="mb-4 p-3 rounded bg-red-100 text-red-700 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
            placeholder="tu@email.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-800 text-white rounded px-4 py-2 hover:bg-gray-900"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
      <p className="text-sm text-gray-600 mt-4">
        ¿No tienes cuenta? <a href="/register" className="text-blue-600 hover:underline">Regístrate</a>
      </p>
    </div>
  );
}