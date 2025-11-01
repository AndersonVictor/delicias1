"use client";
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import getImageSrc from "@/utils/image";

type Pedido = {
  id: number;
  total: number;
  estado: string;
  created_at?: string;
  fecha_pedido?: string;
  direccion_entrega?: string | null;
  notas?: string | null;
};

type PedidoDetalle = {
  producto_nombre: string;
  producto_imagen?: string | null;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
};

type Comprobante = {
  id?: string | number;
  tipo?: "boleta" | "factura"; // boleta | factura
  serie?: string;
  numero?: string;
  total?: number;
  archivos?: { pdf?: string; xml?: string; img?: string };
  created_at?: string;
};

export default function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pagina, setPagina] = useState(1);
  const [limite, setLimite] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [selected, setSelected] = useState<{
    pedido: Pedido | null;
    detalles: PedidoDetalle[];
  } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([]);
  const [tab, setTab] = useState<"pedidos" | "comprobantes">("pedidos");
  // Filtros para pedidos
  const [filtrosPed, setFiltrosPed] = useState<{ busqueda: string; estado: string; desde: string; hasta: string }>({ busqueda: "", estado: "", desde: "", hasta: "" });
  // Filtros para comprobantes
  const [filtrosComp, setFiltrosComp] = useState<{ busqueda: string; tipo: string; desde: string; hasta: string }>({ busqueda: "", tipo: "", desde: "", hasta: "" });
  const [imgModal, setImgModal] = useState<{ open: boolean; src?: string; titulo?: string }>({ open: false });
  const imgModalCloseBtnRef = useRef<HTMLButtonElement | null>(null);
  const [imgModalFocusEl, setImgModalFocusEl] = useState<HTMLElement | null>(null);
  // Añadir estado y referencias para visualización de PDF
  const [pdfModal, setPdfModal] = useState<{ open: boolean; src?: string; titulo?: string }>({ open: false });
  const pdfModalCloseBtnRef = useRef<HTMLButtonElement | null>(null);
  const [pdfModalFocusEl, setPdfModalFocusEl] = useState<HTMLElement | null>(null);
  const currency = useMemo(
    () => (n: number) => new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(n),
    []
  );

  const fetchPedidos = useCallback(async () => {
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.get(`/api/pedidos/mis-pedidos?pagina=${pagina}&limite=${limite}`);
      const items = Array.isArray(resp.data?.pedidos) ? resp.data.pedidos : [];
      setPedidos(items);
      setTotal(Number(resp.data?.total ?? items.length));
      setTotalPaginas(Number(resp.data?.totalPaginas ?? Math.ceil((resp.data?.total ?? items.length) / limite)));
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message || err.message
        : "Error al cargar pedidos";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, pagina, limite]);

  useEffect(() => {
    if (tab === "pedidos") fetchPedidos();
  }, [fetchPedidos, tab]);

  const fetchComprobantes = useCallback(async () => {
    if (!isAuthenticated()) return;
    try {
      const resp = await axios.get("/api/facturacion/mis-comprobantes");
      const list = Array.isArray(resp.data?.comprobantes) ? resp.data?.comprobantes : [];
      setComprobantes(list);
    } catch (err) {
      console.warn("No se pudieron cargar comprobantes");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (tab === "comprobantes") fetchComprobantes();
  }, [tab, fetchComprobantes]);

  type RawDetalle = {
    producto_nombre?: string;
    producto_imagen?: string | null;
    cantidad?: number | string;
    precio_unitario?: number | string;
    subtotal?: number | string;
  };

  const abrirDetalles = async (pedidoId: number) => {
    try {
      const resp = await axios.get(`/api/pedidos/${pedidoId}`);
      const p = resp.data?.pedido;
      const d: PedidoDetalle[] = Array.isArray(resp.data?.detalles)
        ? resp.data.detalles.map((x: RawDetalle) => ({
            producto_nombre: String(x.producto_nombre ?? "") || "Producto",
            producto_imagen: x.producto_imagen ?? null,
            cantidad: Number(x.cantidad ?? 0),
            precio_unitario: Number(x.precio_unitario ?? 0),
            subtotal: Number(x.subtotal ?? 0),
          }))
        : [];
      setSelected({ pedido: p, detalles: d });
      setModalOpen(true);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message || err.message
        : "Error al cargar detalles";
      setError(msg);
    }
  };

  const cancelarPedido = async (pedidoId: number) => {
    if (!window.confirm("¿Cancelar este pedido?")) return;
    try {
      await axios.put(`/api/pedidos/${pedidoId}/cancelar`, {});
      await fetchPedidos();
      alert("Pedido cancelado");
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message || err.message
        : "Error al cancelar";
      setError(msg);
    }
  };

  // Derivados y filtros locales (no condicionar hooks)
  const estadosDisponibles = useMemo(() => Array.from(new Set(pedidos.map((p) => p.estado))), [pedidos]);
  const pedidosFiltrados = useMemo(() => {
    let list = pedidos.slice();
    const { busqueda, estado, desde, hasta } = filtrosPed;
    if (busqueda) {
      const q = busqueda.toLowerCase();
      list = list.filter((p) => String(p.id).includes(q) || p.estado.toLowerCase().includes(q));
    }
    if (estado) list = list.filter((p) => p.estado === estado);
    if (desde) {
      const d = new Date(desde).getTime();
      list = list.filter((p) => new Date(p.created_at || p.fecha_pedido || Date.now()).getTime() >= d);
    }
    if (hasta) {
      const h = new Date(hasta).getTime();
      list = list.filter((p) => new Date(p.created_at || p.fecha_pedido || Date.now()).getTime() <= h);
    }
    return list;
  }, [pedidos, filtrosPed]);

  const comprobantesFiltrados = useMemo(() => {
    let list = comprobantes.slice();
    const { busqueda, tipo, desde, hasta } = filtrosComp;
    if (busqueda) {
      const q = busqueda.toLowerCase();
      list = list.filter((c) => `${c.serie}-${c.numero}`.toLowerCase().includes(q));
    }
    if (tipo) list = list.filter((c) => (c.tipo || "").toLowerCase() === tipo.toLowerCase());
    if (desde) {
      const d = new Date(desde).getTime();
      list = list.filter((c) => new Date(c.created_at || Date.now()).getTime() >= d);
    }
    if (hasta) {
      const h = new Date(hasta).getTime();
      list = list.filter((c) => new Date(c.created_at || Date.now()).getTime() <= h);
    }
    return list;
  }, [comprobantes, filtrosComp]);

  // Accesibilidad del modal: focus inicial y cierre por Escape
  useEffect(() => {
    if (!imgModal.open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setImgModal({ open: false });
      }
    };
    // Foco al botón cerrar
    const t = setTimeout(() => imgModalCloseBtnRef.current?.focus(), 0);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKeyDown);
      // Restaurar foco al disparador
      imgModalFocusEl?.focus?.();
    };
  }, [imgModal.open, imgModalFocusEl]);

  const authed = isAuthenticated();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Historial de compras</h1>

      {!authed ? (
        <div className="p-4 rounded border bg-white">
          <p>Debes iniciar sesión para ver tus pedidos.</p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <div className="inline-flex rounded border overflow-hidden">
              <button
                className={`px-4 py-2 ${tab === "pedidos" ? "bg-gray-800 text-white" : "bg-white"}`}
                onClick={() => setTab("pedidos")}
              >
                Pedidos
              </button>
              <button
                className={`px-4 py-2 ${tab === "comprobantes" ? "bg-gray-800 text-white" : "bg-white"}`}
                onClick={() => setTab("comprobantes")}
              >
                Comprobantes
              </button>
            </div>
          </div>

          {tab === "pedidos" ? (
            <div>
              {/* Filtros de pedidos */}
              <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Búsqueda</label>
                  <input
                    type="text"
                    className="w-full rounded border px-3 py-2 text-sm"
                    placeholder="ID o estado"
                    value={filtrosPed.busqueda}
                    onChange={(e) => setFiltrosPed((prev) => ({ ...prev, busqueda: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estado</label>
                  <select
                    className="w-full rounded border px-3 py-2 text-sm"
                    value={filtrosPed.estado}
                    onChange={(e) => setFiltrosPed((prev) => ({ ...prev, estado: e.target.value }))}
                  >
                    <option value="">Todos</option>
                    {estadosDisponibles.map((es) => (
                      <option key={es} value={es}>{es}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Desde</label>
                  <input type="date" className="w-full rounded border px-3 py-2 text-sm" value={filtrosPed.desde} onChange={(e) => setFiltrosPed((prev) => ({ ...prev, desde: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hasta</label>
                  <input type="date" className="w-full rounded border px-3 py-2 text-sm" value={filtrosPed.hasta} onChange={(e) => setFiltrosPed((prev) => ({ ...prev, hasta: e.target.value }))} />
                </div>
              </div>
              {loading ? (
                <div>Cargando...</div>
              ) : error ? (
                <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>
              ) : (
                <div className="space-y-4">
                  {pedidosFiltrados.length === 0 ? (
                    <div className="text-gray-600">Aún no tienes pedidos.</div>
                  ) : (
                    pedidosFiltrados.map((p) => (
                      <div key={p.id} className="border rounded p-4 flex items-center justify-between">
                        <div>
                          <div className="font-medium">Pedido #{p.id}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(p.created_at || p.fecha_pedido || Date.now()).toLocaleString("es-ES")}
                          </div>
                          <div className="text-sm mt-1">
                            Estado: <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100">{p.estado}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="font-semibold">{currency(Number(p.total || 0))}</div>
                          <button
                            className="px-3 py-1.5 rounded border hover:bg-gray-50"
                            onClick={() => abrirDetalles(p.id)}
                          >
                            Ver detalles
                          </button>
                          {p.estado !== "cancelado" && (
                            <button className="px-3 py-1.5 rounded bg-red-600 text-white" onClick={() => cancelarPedido(p.id)}>
                              Cancelar
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}

                  {/* Paginación simple */}
                  {(!filtrosPed.busqueda && !filtrosPed.estado && !filtrosPed.desde && !filtrosPed.hasta && totalPaginas > 1) && (
                    <div className="flex items-center gap-2 mt-4">
                      <button
                        disabled={pagina <= 1}
                        className="px-3 py-1.5 rounded border disabled:opacity-50"
                        onClick={() => setPagina((p) => Math.max(1, p - 1))}
                      >
                        Anterior
                      </button>
                      <span className="text-sm text-gray-700">
                        Página {pagina} de {totalPaginas}
                      </span>
                      <button
                        disabled={pagina >= totalPaginas}
                        className="px-3 py-1.5 rounded border disabled:opacity-50"
                        onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                      >
                        Siguiente
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Modal de detalles (simplificado) */}
              {modalOpen && selected && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
                  <div className="bg-white rounded shadow-lg w-full max-w-2xl">
                    <div className="p-4 border-b flex items-center justify-between">
                      <div className="font-semibold">Pedido #{selected.pedido?.id}</div>
                      <button className="px-2 py-1 rounded border" onClick={() => setModalOpen(false)}>Cerrar</button>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="text-sm">Estado: {selected.pedido?.estado}</div>
                      <div className="text-sm">Total: {currency(Number(selected.pedido?.total || 0))}</div>
                      <div className="text-sm">Dirección: {selected.pedido?.direccion_entrega || "—"}</div>
                      <div className="text-sm">Notas: {selected.pedido?.notas || "—"}</div>
                      <div className="border rounded">
                        <div className="p-2 font-medium border-b">Productos</div>
                        <ul>
                          {selected.detalles.map((d, idx) => (
                            <li key={idx} className="p-2 flex items-center justify-between">
                              <div>
                                <div>{d.producto_nombre}</div>
                                <div className="text-xs text-gray-600">x{d.cantidad} · {currency(d.precio_unitario)}</div>
                              </div>
                              <div className="font-semibold">{currency(d.subtotal)}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* Filtros de comprobantes */}
              <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Búsqueda</label>
                  <input
                    type="text"
                    className="w-full rounded border px-3 py-2 text-sm"
                    placeholder="Serie o número"
                    value={filtrosComp.busqueda}
                    onChange={(e) => setFiltrosComp((prev) => ({ ...prev, busqueda: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo</label>
                  <select
                    className="w-full rounded border px-3 py-2 text-sm"
                    value={filtrosComp.tipo}
                    onChange={(e) => setFiltrosComp((prev) => ({ ...prev, tipo: e.target.value }))}
                  >
                    <option value="">Todos</option>
                    <option value="boleta">Boleta</option>
                    <option value="factura">Factura</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Desde</label>
                  <input type="date" className="w-full rounded border px-3 py-2 text-sm" value={filtrosComp.desde} onChange={(e) => setFiltrosComp((prev) => ({ ...prev, desde: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hasta</label>
                  <input type="date" className="w-full rounded border px-3 py-2 text-sm" value={filtrosComp.hasta} onChange={(e) => setFiltrosComp((prev) => ({ ...prev, hasta: e.target.value }))} />
                </div>
              </div>
              {comprobantes.length === 0 ? (
                <div className="text-gray-600">No hay comprobantes disponibles.</div>
              ) : (
                <div className="space-y-3">
                  {comprobantesFiltrados.map((c, idx) => (
                    <div key={idx} className="border rounded p-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {c.tipo?.toUpperCase?.() ?? c.tipo} {c.serie}-{c.numero}
                        </div>
                        <div className="text-sm text-gray-600">
                          Emitido: {new Date(c.created_at || Date.now()).toLocaleString("es-ES")}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="font-semibold">{currency(Number(c.total || 0))}</div>
                        {c.archivos?.pdf && (
                          <>
                            <button
                              className="px-3 py-1.5 rounded border hover:bg-gray-50"
                              onClick={(e) => {
                                setPdfModalFocusEl(e.currentTarget);
                                setPdfModal({ open: true, src: `${axios.defaults.baseURL || ""}${c.archivos!.pdf}`, titulo: `${c.tipo} ${c.serie}-${c.numero}` });
                              }}
                            >
                              Ver PDF
                            </button>
                            <a
                              href={`${axios.defaults.baseURL || ""}${c.archivos.pdf}`}
                              download
                              className="px-3 py-1.5 rounded border hover:bg-gray-50"
                            >
                              Descargar PDF
                            </a>
                          </>
                        )}
                        {c.archivos?.xml && (
                          <a
                            href={`${axios.defaults.baseURL || ""}${c.archivos.xml}`}
                            download
                            className="px-3 py-1.5 rounded border hover:bg-gray-50"
                          >
                            Descargar XML
                          </a>
                        )}
                        {c.archivos?.img && (
                          <button
                            className="px-3 py-1.5 rounded border hover:bg-gray-50"
                            onClick={(e) => {
                              setImgModalFocusEl(e.currentTarget);
                              setImgModal({ open: true, src: getImageSrc(`${axios.defaults.baseURL || ""}${c.archivos!.img}`, { width: 1024 }), titulo: `${c.tipo} ${c.serie}-${c.numero}` });
                            }}
                          >
                            Ver imagen
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Modal de imagen de comprobante */}
              <AnimatePresence>
                {imgModal.open && (
                  <motion.div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <motion.div role="dialog" aria-modal="true" aria-label="Imagen del comprobante" className="bg-white rounded-lg shadow-xl max-w-3xl w-full overflow-hidden" initial={{ scale: 0.95, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -8 }}>
                      <div className="p-3 border-b flex items-center justify-between">
                        <div className="font-semibold">{imgModal.titulo || "Comprobante"}</div>
                        <button ref={imgModalCloseBtnRef} className="px-2 py-1 rounded border" onClick={() => setImgModal({ open: false })}>Cerrar</button>
                      </div>
                      <div className="p-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imgModal.src} alt={imgModal.titulo || "Comprobante"} className="w-full h-auto object-contain" />
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Modal de PDF de comprobante */}
              <AnimatePresence>
                {pdfModal.open && (
                  <motion.div className="fixed inset-0 z-[1150] flex items-center justify-center bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <motion.div role="dialog" aria-modal="true" aria-label="PDF del comprobante" className="bg-white rounded-lg shadow-xl max-w-4xl w-full overflow-hidden" initial={{ scale: 0.95, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -8 }}>
                      <div className="p-3 border-b flex items-center justify-between">
                        <div className="font-semibold">{pdfModal.titulo || "Comprobante (PDF)"}</div>
                        <button ref={pdfModalCloseBtnRef} className="px-2 py-1 rounded border" onClick={() => setPdfModal({ open: false })}>Cerrar</button>
                      </div>
                      <div className="p-3">
                        <iframe src={pdfModal.src} title={pdfModal.titulo || "Comprobante PDF"} className="w-full h-[70vh]" />
                        <div className="mt-3 flex items-center gap-2">
                          {pdfModal.src && (
                            <a href={pdfModal.src} download className="px-3 py-1.5 rounded border hover:bg-gray-50">Descargar PDF</a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </>
      )}
    </div>
  );
}