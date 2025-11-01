"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Features() {
  const items = [
    {
      title: "Panes artesanales",
      description: "Recetas con masa madre, horneado diario y máxima frescura.",
      src: "/images/categories/pan.png",
      href: "/products",
    },
    {
      title: "Dulces y pasteles",
      description: "Croissants, bollería y dulces con mantequilla real.",
      src: "/images/categories/pasteles.png",
      href: "/products",
    },
    {
      title: "Tortas personalizadas",
      description: "Diseños únicos para tus celebraciones: sabores y decoración a medida.",
      src: "/images/categories/tortas.jpg",
      href: "/#contacto",
    },
  ];

  return (
    <section id="categorias" className="py-12">
      <div className="container">
        <div className="max-w-2xl mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-secondary)]">¿Por qué elegirnos?</h2>
          <p className="subheadline mt-2">Tres clásicos de la casa para empezar: panes artesanales, dulces irresistibles y tortas personalizadas.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, idx) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              className="card card-hover overflow-hidden"
            >
              <div className="aspect-[4/3] relative">
                <Image src={item.src} alt={item.title} fill className="object-cover" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-sm text-black/70 mt-1">{item.description}</p>
                <a href={item.href} className="btn btn-outline-secondary mt-3">Ver más</a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}