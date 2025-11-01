"use client";
import React from "react";
import ProductCard, { type Producto } from "@/components/Product/ProductCard";
import { useCart } from "@/context/CartContext";

export default function ProductGallery() {
  const { addToCart, canAddToCart, openCart } = useCart();

  const featured: Producto[] = [
    {
      id: 101,
      nombre: "Alfajores",
      descripcion: "Dulces tradicionales con manjar y azúcar impalpable",
      precio: 3.5,
      stock: 25,
      destacado: true,
      imagen: "/images/products/alfajores.jpg",
      categoria_nombre: "Dulces",
    },
    {
      id: 102,
      nombre: "Delikeik clásico",
      descripcion: "Bizcochuelo esponjoso con crema suave",
      precio: 18.9,
      stock: 12,
      destacado: true,
      imagen: "/images/products/delikeik.jpg",
      categoria_nombre: "Tortas",
    },
    {
      id: 103,
      nombre: "Karamanduka artesanal",
      descripcion: "Nuestra especialidad con toques de caramelo",
      precio: 22.0,
      stock: 8,
      imagen: "/images/products/karamanduka.jpg",
      categoria_nombre: "Tortas",
    },
    {
      id: 104,
      nombre: "Pionono",
      descripcion: "Rollo suave relleno de manjar",
      precio: 9.9,
      stock: 20,
      imagen: "/images/products/pionono.jpg",
      categoria_nombre: "Dulces",
    },
    {
      id: 105,
      nombre: "Tostadas",
      descripcion: "Crujientes y doradas, perfectas para acompañar",
      precio: 6.5,
      stock: 30,
      imagen: "/images/products/tostadas.jpg",
      categoria_nombre: "Panes",
    },
  ];

  const handleAdd = (p: Producto) => {
    if (canAddToCart?.(p)) {
      addToCart(p, 1);
      openCart?.();
    } else {
      alert("Stock insuficiente para agregar al carrito");
    }
  };

  return (
    <section id="destacados" className="py-12">
      <div className="container">
        <div className="max-w-2xl mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-secondary)]">Productos destacados</h2>
          <p className="subheadline mt-2">Una selección de nuestros favoritos para que empieces a disfrutar.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {featured.map((p) => (
            <ProductCard key={p.id} producto={p} onAddToCart={handleAdd} />
          ))}
        </div>
      </div>
    </section>
  );
}