"use client";
import { useEffect, useState } from "react";
import { buttonClasses } from "@/design/admin";

export default function AdminConfiguracionPage() {
  const [moneda, setMoneda] = useState('PEN');
  const [prefijo, setPrefijo] = useState('S/.');
  const [branding, setBranding] = useState('Delicias');

  useEffect(() => {
    // Cargar configuración básica desde localStorage (placeholder hasta tener API específica)
    const raw = localStorage.getItem('admin:config');
    if (raw) {
      try {
        const cfg = JSON.parse(raw);
        setMoneda(cfg.moneda || 'PEN');
        setPrefijo(cfg.prefijo || 'S/.');
        setBranding(cfg.branding || 'Delicias');
      } catch {}
    }
  }, []);

  const guardar = () => {
    const cfg = { moneda, prefijo, branding };
    localStorage.setItem('admin:config', JSON.stringify(cfg));
    alert('Configuración guardada');
  };

  return (
    <div>
      <h2 className="text-base font-semibold text-slate-900">Configuración del sitio</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Moneda</label>
          <select value={moneda} onChange={(e) => setMoneda(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-300">
            <option value="PEN">PEN (Soles peruanos)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Prefijo</label>
          <input value={prefijo} onChange={(e) => setPrefijo(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-300" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Marca (branding)</label>
          <input value={branding} onChange={(e) => setBranding(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-300" />
        </div>
      </div>

      <div className="mt-3">
        <button className={buttonClasses({ variant: 'primary', size: 'md' })} onClick={guardar}>Guardar</button>
      </div>
    </div>
  );
}