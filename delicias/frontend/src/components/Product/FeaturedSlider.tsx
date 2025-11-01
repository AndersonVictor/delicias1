"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import ProductCard, { type Producto } from "./ProductCard";
import { useCart } from "@/context/CartContext";
import { toast } from "react-hot-toast";

export default function FeaturedSlider() {
  const [items, setItems] = useState<Producto[]>([]);
  const { addToCart, canAddToCart, openCart } = useCart();

  useEffect(() => {
    const run = async () => {
      try {
        const resp = await axios.get("/api/productos?destacado=true&limite=10");
        const list: Producto[] = Array.isArray(resp.data?.productos) ? resp.data.productos : [];
        setItems(list);
      } catch (e) {
        // silencioso
      }
    };
    run();
  }, []);

  if (!items.length) return null;

  const handleAdd = (p: Producto) => {
    if (canAddToCart?.(p)) {
      addToCart(p, 1);
      openCart?.();
      toast.success(`${p.nombre} añadido al carrito`);
    } else {
      toast.error("Stock insuficiente para agregar al carrito");
    }
  };

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold text-[var(--color-secondary)]">Destacados</h2>
      </div>
      <Swiper
        spaceBetween={12}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {items.map((p) => (
          <SwiperSlide key={p.id}>
            <ProductCard producto={p} onAddToCart={handleAdd} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}