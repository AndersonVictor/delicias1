"use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

type Suggest = { id: number; nombre: string; precio?: number; imagen?: string | null };

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSelect: (suggest: Suggest) => void;
  placeholder?: string;
};

export default function SearchSuggest({ value, onChange, onSelect, placeholder }: Props) {
  const [loading, setLoading] = useState(false);
  const [suggests, setSuggests] = useState<Suggest[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const q = value.trim();
    if (q.length < 2) {
      setSuggests([]);
      setOpen(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const run = async () => {
      try {
        const resp = await axios.get(`/api/productos?buscar=${encodeURIComponent(q)}&limite=5`);
        const list: Suggest[] = Array.isArray(resp.data?.productos)
          ? resp.data.productos.map((p: any) => ({ id: p.id, nombre: String(p.nombre || ""), precio: Number(p.precio || 0), imagen: p.imagen || null }))
          : [];
        if (!cancelled) {
          setSuggests(list);
          setOpen(list.length > 0);
        }
      } catch (e) {
        if (!cancelled) {
          setSuggests([]);
          setOpen(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    const t = setTimeout(run, 220); // debounce
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [value]);

  return (
    <div ref={boxRef} className="relative">
      <input
        type="text"
        className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400"
        placeholder={placeholder || "Buscar productos..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(suggests.length > 0)}
      />
      {open && (
        <div className="absolute left-0 right-0 mt-1 rounded-xl border border-black/10 bg-white shadow-md z-20">
          <ul>
            {suggests.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-black/5"
                  onClick={() => {
                    onSelect(s);
                    setOpen(false);
                  }}
                >
                  {s.nombre}
                </button>
              </li>
            ))}
            {loading && (
              <li className="px-3 py-2 text-sm text-black/60">Buscando...</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}