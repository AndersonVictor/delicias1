"use client";
import React from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { AnimatePresence, motion } from "framer-motion";
import { X, Trash2, Minus, Plus, ShoppingCart, CreditCard } from "lucide-react";
import getImageSrc from "@/utils/image";
import { toast } from "react-hot-toast";

export default function CartSidebar() {
  const {
    cartItems,
    isOpen,
    closeCart,
    clearCart,
    updateQuantity,
    removeFromCart,
    getCartTotal,
  } = useCart();
  type CartItem = { id: number; nombre: string; precio: number | string; cantidad: number; stock: number; imagen?: string | null };
  const cartItemsTyped = cartItems as CartItem[];

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(price);

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={closeCart}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            className={`fixed top-0 right-0 h-full w-full sm:w-[400px] md:w-[420px] xl:w-[480px] bg-[var(--surface)] shadow-xl z-50`}
            role="dialog"
            aria-modal="true"
            aria-label="Carrito"
            onClick={(e) => e.stopPropagation()}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", ease: "easeOut", duration: 0.25 }}
          >

        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold inline-flex items-center gap-2"><ShoppingCart size={18} /> Tu Carrito</h2>
            <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-black/5 text-black/70">
              {cartItemsTyped.length} {cartItemsTyped.length === 1 ? "producto" : "productos"}
            </span>
          </div>
          <motion.button
            className="p-2 rounded hover:bg-black/5"
            onClick={closeCart}
            aria-label="Cerrar carrito"
            whileTap={{ scale: 0.95 }}
          >
            <X size={18} />
          </motion.button>
        </div>

        {/* Contenido */}
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {cartItems.length === 0 ? (
              <div className="text-center text-gray-600 py-8">
                <p>Tu carrito está vacío.</p>
                <Link href="/products" className="btn btn-primary mt-3">
                  Ir a productos
                </Link>
              </div>
            ) : (
              <ul className="space-y-4">
                <AnimatePresence initial={false}>
                {cartItemsTyped.map((item) => (
                  <motion.li
                    key={item.id}
                    className="flex gap-3 p-2 border rounded-xl"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Image
                  src={getImageSrc({ imagen: item.imagen }, { width: 160 })}
                  alt={item.nombre}
                  width={64}
                  height={64}
                  className="w-16 h-16 object-cover rounded-xl border border-black/10"
                />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{item.nombre}</p>
                          <p className="text-sm text-gray-600">{formatPrice(parseFloat(String(item.precio)))}</p>
                        </div>

                        <motion.button
                          className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
                          onClick={() => { removeFromCart(item.id); toast.success("Producto eliminado del carrito"); }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <Trash2 size={16} /> Eliminar
                        </motion.button>
                      </div>
                      <div className="mt-2 flex items-center gap-2">

                        <motion.button
                          className="px-3 py-2 border rounded-xl bg-white hover:bg-black/5 transition-colors"
                          onClick={() => updateQuantity(item.id, Math.max(1, item.cantidad - 1))}
                          disabled={item.cantidad <= 1}
                          aria-label="Disminuir cantidad"
                          title="Disminuir cantidad"
                          whileTap={{ scale: 0.95 }}
                        >
                          <Minus size={16} />
                        </motion.button>
                        <input
                          type="number"
                          className="w-16 text-center border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
                          value={item.cantidad}
                          min={1}
                          max={item.stock}
                          onChange={(e) => {
                            const nueva = parseInt(e.target.value || "1", 10);
                            if (!Number.isNaN(nueva)) {
                              updateQuantity(item.id, Math.min(item.stock, Math.max(1, nueva)));
                            }
                          }}
                        />

                        <motion.button
                          className="px-3 py-2 border rounded-xl bg-white hover:bg-black/5 transition-colors"
                          onClick={() => {
                            if (item.cantidad >= item.stock) {
                              toast.error("No hay más stock disponible");
                              return;
                            }
                            updateQuantity(item.id, Math.min(item.stock, item.cantidad + 1));
                          }}
                          disabled={item.cantidad >= item.stock}
                          aria-label="Aumentar cantidad"
                          title="Aumentar cantidad"
                          whileTap={{ scale: 0.95 }}
                        >
                          <Plus size={16} />
                        </motion.button>
                        {/* Efecto sutil al cambiar la cantidad */}
                        <motion.span
                          key={`qty-${item.id}-${item.cantidad}`}
                          initial={{ scale: 1 }}
                          animate={{ scale: [1, 1.08, 1] }}
                          transition={{ duration: 0.25 }}
                          className="sr-only"
                        >{item.cantidad}</motion.span>
                      </div>
                    </div>
                  </motion.li>
                ))}
                </AnimatePresence>
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="border-t px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium">Total</span>
              <span className="font-semibold">{formatPrice(getCartTotal())}</span>
            </div>

            <p className="text-xs text-black/60 mb-2">Comprobante: Boleta (sin IGV)</p>

            <div className="flex gap-2">
              <motion.button className="btn btn-outline-secondary flex-1 inline-flex items-center justify-center gap-2" onClick={() => { clearCart(); toast.success("Carrito vaciado"); }} disabled={cartItems.length === 0} whileTap={{ scale: 0.98 }}>
                <Trash2 size={16} /> Vaciar carrito
              </motion.button>
              <Link href="/checkout" className={`btn btn-primary flex-1 inline-flex items-center justify-center gap-2 ${cartItems.length === 0 ? "disabled pointer-events-none" : ""}`}>
                <CreditCard size={16} /> Ir a pagar
              </Link>
            </div>
          </div>
        </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}