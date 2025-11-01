"use client";
import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

type Testimonio = {
  nombre: string;
  texto: string;
};

const testimonios: Testimonio[] = [
  {
    nombre: "María G.",
    texto: "Las tortas personalizadas son espectaculares. La decoración y el sabor superaron mis expectativas.",
  },
  {
    nombre: "Luis P.",
    texto: "El pan artesanal siempre está fresco y crujiente. Atención amable y rápida.",
  },
  {
    nombre: "Andrea R.",
    texto: "Los alfajores y piononos son mis favoritos. Perfectos para compartir en familia.",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonios" className="py-12">
      <div className="container">
        <div className="max-w-2xl mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-secondary)]">Testimonios</h2>
          <p className="subheadline mt-2">Lo que dicen nuestros clientes sobre Delicias.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonios.map((t, idx) => (
            <motion.article
              key={t.nombre}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              className="card p-4"
            >
              <div className="flex items-center gap-2 text-[var(--color-primary)]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" stroke="none" />
                ))}
              </div>
              <p className="text-sm text-black/80 mt-2">“{t.texto}”</p>
              <p className="mt-3 text-sm font-semibold text-black/90">{t.nombre}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}