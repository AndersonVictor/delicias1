"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import axios from "axios";
import { useCart } from "@/context/CartContext";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { formatPEN } from "@/utils/currency";
import getImageSrc from "@/utils/image";

type Producto = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  stock: number;
  destacado?: boolean;
  imagen?: string | null;
  categoria_id?: number;
  categoria_nombre?: string | null;
  ingredientes?: string | null;
};

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [relacionados, setRelacionados] = useState<Producto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [cantidad, setCantidad] = useState<number>(1);
  const [imgModal, setImgModal] = useState<{ open: boolean; src?: string }>({ open: false });
  const imgCloseBtnRef = useRef<HTMLButtonElement | null>(null);
  const [imgTriggerEl, setImgTriggerEl] = useState<HTMLElement | null>(null);

  const { addToCart, isInCart, getCartItem } = useCart();


  const fetchProducto = async (id: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/productos/${id}`);
      setProducto(res.data);
      setError("");
    } catch (err) {
      console.error("Error al cargar producto:", err);
      setError("No se pudo cargar el producto.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelacionados = async (categoriaId?: number, actualId?: number) => {
    try {
      if (!categoriaId) return;
      const res = await axios.get(`/api/productos?categoria=${categoriaId}&limite=4`);
      const items: Producto[] = res.data.productos || [];
      setRelacionados(items.filter((p) => p.id !== actualId));
    } catch (err) {
      console.error("Error al cargar productos relacionados:", err);
    }
  };

  useEffect(() => {
    if (params?.id) fetchProducto(params.id);
  }, [params?.id]);

  useEffect(() => {
    if (producto) fetchRelacionados(producto.categoria_id, producto.id);
  }, [producto]);

  // Accesibilidad del modal: foco inicial y cierre por Escape + restauración de foco
  useEffect(() => {
    if (!imgModal.open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setImgModal({ open: false });
    };
    const t = setTimeout(() => imgCloseBtnRef.current?.focus(), 0);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKeyDown);
      imgTriggerEl?.focus?.();
    };
  }, [imgModal.open, imgTriggerEl]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <p className="text-sm text-gray-600">Cargando producto...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div role="alert" className="p-3 rounded border border-red-200 bg-red-50 text-red-700">
          <p className="mb-2">{error}</p>
          <Link href="/products" className="underline">Volver a Productos</Link>
        </div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div role="alert" className="p-3 rounded border bg-yellow-50 text-yellow-800">
          <p className="mb-2">Producto no encontrado</p>
          <Link href="/products" className="underline">Volver a Productos</Link>
        </div>
      </div>
    );
  }

  const itemEnCarrito = getCartItem(producto.id);
  const cantidadEnCarrito = itemEnCarrito ? itemEnCarrito.cantidad : 0;
  const stockDisponible = producto.stock - cantidadEnCarrito;
  

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Breadcrumb mínimo */}
      <nav aria-label="breadcrumb" className="text-sm text-gray-600 mb-3">
        <span>
          <Link href="/" className="hover:underline">Inicio</Link> / <Link href="/products" className="hover:underline">Productos</Link> / {producto.nombre}
        </span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Imagen del producto */}
        <div>
          <div className="relative rounded-lg overflow-hidden bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getImageSrc(producto, { width: 1024 })}
              alt={producto.nombre}
              className="w-full h-auto object-cover md:object-contain hover:scale-[1.02] transition-transform duration-200 cursor-zoom-in"
              onClick={(e) => {
                setImgTriggerEl(e.currentTarget);
                setImgModal({ open: true, src: getImageSrc(producto, { width: 1600 }) });
              }}
            />
          </div>
          <div className="mt-3 flex items-center gap-2">
            {producto.destacado && <Badge className="inline-flex items-center px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs">Destacado</Badge>}
            {producto.stock === 0 && <Badge className="inline-flex items-center px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs">Agotado</Badge>}
            {producto.stock <= 5 && producto.stock > 0 && <Badge className="inline-flex items-center px-2 py-0.5 rounded bg-orange-100 text-orange-700 text-xs">Pocas unidades</Badge>}
          </div>
        </div>

        {/* Información principal */}
        <div>
          <h1 className="text-2xl font-semibold">{producto.nombre}</h1>
          <p className="text-xl font-bold mt-1">{formatPEN(producto.precio)}</p>
          {producto.descripcion && <p className="text-gray-700 mt-2">{producto.descripcion}</p>}
          {producto.categoria_nombre && (
            <p className="text-sm text-gray-600 mt-2">
              <strong>Categoría:</strong> {producto.categoria_nombre}
            </p>
          )}
          <p className="text-sm mt-2">
            <strong>Stock disponible:</strong> {producto.stock} unidades
            {cantidadEnCarrito > 0 && <span> ({cantidadEnCarrito} en tu carrito)</span>}
          </p>

          {/* Acciones de compra */}
          {producto.stock > 0 ? (
            <div className="mt-4">
              <label htmlFor="cantidad" className="text-sm font-medium">Cantidad:</label>
              <div className="mt-1 inline-flex items-center gap-2">
                <Button aria-label="Disminuir cantidad" variant="outline" size="sm" onClick={() => setCantidad(Math.max(1, cantidad - 1))} disabled={cantidad <= 1}>
                  -
                </Button>
                <input
                  id="cantidad"
                  type="number"
                  value={cantidad}
                  onChange={(e) => {
                    const nueva = parseInt(e.target.value || "1", 10);
                    if (!Number.isNaN(nueva)) setCantidad(Math.min(stockDisponible, Math.max(1, nueva)));
                  }}
                  min={1}
                  max={stockDisponible}
                  className="w-16 text-center border rounded px-2 py-1"
                />
                <Button aria-label="Aumentar cantidad" variant="outline" size="sm" onClick={() => setCantidad(Math.min(stockDisponible, cantidad + 1))} disabled={cantidad >= stockDisponible}>
                  +
                </Button>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Button onClick={() => addToCart(producto, cantidad)} disabled={stockDisponible === 0}>
                  {isInCart(producto.id) ? "Agregar más al carrito" : "Agregar al carrito"}
                </Button>
                <Button asChild variant="ghost">
                  <Link href="/products">Seguir comprando</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <div role="alert" className="p-3 rounded border bg-gray-50 text-gray-800">Este producto está temporalmente agotado.</div>
              <Button asChild variant="ghost" className="mt-2">
                <Link href="/products">Ver otros productos</Link>
              </Button>
            </div>
          )}

          {/* Ingredientes */}
          {producto.ingredientes && (
            <div className="mt-5">
              <strong>Ingredientes:</strong>
              <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{producto.ingredientes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Productos relacionados */}
      {relacionados.length > 0 && (
        <section className="mt-8">
          <h3 className="text-lg font-semibold mb-3">Productos Relacionados</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {relacionados.map((p) => (
              <li key={p.id} className="border rounded-lg overflow-hidden bg-[var(--surface)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={getImageSrc(p, { width: 600 })} alt={p.nombre} className="w-full h-32 object-cover" />
                <div className="p-3">
                  <p className="font-medium">{p.nombre}</p>
                  <p className="text-sm text-gray-600">{formatPEN(p.precio)}</p>
                  <Button asChild variant="ghost" size="sm" className="mt-2">
                    <Link href={`/product/${p.id}`}>Ver detalle</Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Modal de imagen ampliada */}
      <AnimatePresence>
        {imgModal.open && (
          <motion.div className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setImgModal({ open: false })}>
            <motion.div role="dialog" aria-modal="true" aria-label="Imagen ampliada del producto" className="bg-white rounded-lg shadow-xl max-w-4xl w-full overflow-hidden" initial={{ scale: 0.96, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: -8 }} onClick={(e) => e.stopPropagation()}>
              <div className="p-3 border-b flex items-center justify-between">
                <div className="font-semibold">{producto.nombre}</div>
                <Button ref={imgCloseBtnRef as any} variant="outline" size="sm" onClick={() => setImgModal({ open: false })}>Cerrar</Button>
              </div>
              <div className="p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgModal.src} alt={producto.nombre} className="w-full h-auto object-contain" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}