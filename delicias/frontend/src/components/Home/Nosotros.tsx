"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { CheckCircle } from "lucide-react";

export default function Nosotros() {
  const puntos = [
    "Ingredientes seleccionados y de calidad",
    "Recetas tradicionales con toques modernos",
    "Horneado diario para asegurar frescura",
    "Hecho con cariño por nuestro equipo",
  ];

  return (
    <section id="nosotros" className="py-12">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-secondary)]">Nosotros</h2>
            <p className="subheadline">
              En Delicias, horneamos cada día con dedicación y cariño. Nuestros productos combinan ingredientes naturales,
              recetas de familia y procesos artesanales para ofrecerte sabores auténticos.
            </p>

            <ul className="grid sm:grid-cols-2 gap-2 mt-2">
              {puntos.map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm text-black/80">
                  <CheckCircle size={16} className="text-[var(--color-primary)] mt-0.5" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>

            <div className="flex gap-3 mt-3">
              <a href="/products" className="btn btn-outline-secondary">Ver el menú</a>
              <a href="#contacto" className="btn btn-primary">Contacto</a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative overflow-hidden rounded-2xl"
          >
            <div className="aspect-[4/3]">
              <Image src="/images/illustrations/illustrations.png" alt="Panadería Delicias" fill className="object-cover" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}