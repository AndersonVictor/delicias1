"use client";
import React from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { formatPEN } from "@/utils/currency";
import getImageSrc from "@/utils/image";
import { ShoppingCart, Eye } from "lucide-react";

export type Producto = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  stock: number;
  destacado?: boolean;
  imagen?: string | null;
  categoria_id?: number;
  categoria_nombre?: string | null;
};

type Props = {
  producto: Producto;
  onAddToCart: (p: Producto) => void;
  isDisabled?: boolean; // por stock o límites de carrito
};

export default function ProductCard({ producto, onAddToCart, isDisabled }: Props) {
  const agotado = (producto.stock ?? 0) <= 0;
  const lowStock = (producto.stock ?? 0) > 0 && (producto.stock ?? 0) <= 5;

  return (
    <motion.article
      className="card card-hover overflow-hidden"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative aspect-square group overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          src={getImageSrc({ imagen: producto.imagen }, { width: 800 })}
          alt={producto.nombre}
          loading="lazy"
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.35 }}
        />
        <div className="absolute top-2 left-2 flex items-center gap-2">
          {producto.destacado && <Badge variant="accent" className="inline-flex items-center rounded-full px-2 py-0.5 text-xs">Destacado</Badge>}
          {lowStock && <Badge variant="warning" className="inline-flex items-center rounded-full px-2 py-0.5 text-xs">Quedan {producto.stock}</Badge>}
          {agotado && <Badge variant="danger" className="inline-flex items-center rounded-full px-2 py-0.5 text-xs">Agotado</Badge>}
        </div>
        {producto.categoria_nombre && (
          <div className="absolute top-2 right-2">
            <Badge className="inline-flex items-center rounded-full bg-white/80 text-black/70 px-2 py-0.5 text-xs backdrop-blur">
              {producto.categoria_nombre}
            </Badge>
          </div>
        )}
        {/* Sombra superior sutil para legibilidad */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/10" />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3 min-w-0">
          <h3 className="font-semibold text-xl leading-tight truncate">{producto.nombre}</h3>
          <span className="text-[var(--color-secondary)] text-xl font-semibold whitespace-nowrap">{formatPEN(Number(producto.precio || 0))}</span>
        </div>
        {producto.descripcion ? (
          <p
            className="text-sm text-black/70 mt-1"
            style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
          >
            {producto.descripcion}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <motion.div whileTap={{ scale: 0.98 }} whileHover={{ scale: agotado || isDisabled ? 1 : 1.02 }}>
            <Button
              size="md"
              variant={agotado ? "ghost" : "primary"}
              disabled={agotado || isDisabled}
              aria-disabled={agotado || isDisabled}
              onClick={() => onAddToCart(producto)}
              className="w-full sm:flex-1"
            >
              {agotado ? (
                "Agotado"
              ) : isDisabled ? (
                "Limite alcanzado"
              ) : (
                <span className="inline-flex items-center gap-2">
                  <ShoppingCart size={16} />
                  Agregar al carrito
                </span>
              )}
            </Button>
          </motion.div>
          <Button asChild size="md" variant="outline" className="hidden sm:inline-flex sm:flex-1">
            <a href={`/product/${producto.id}`} aria-label={`Ver detalles de ${producto.nombre}`} className="inline-flex items-center gap-2 justify-center w-full">
              <Eye size={16} />
              Ver detalle
            </a>
          </Button>
        </div>
      </div>
    </motion.article>
  );
}