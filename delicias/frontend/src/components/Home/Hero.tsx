"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden">
      {/* Fondo hero: imagen decorativa desde public/images/banners */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/banners/baners 1.jpg"
          alt="Panadería Delicias"
          fill
          className="object-cover opacity-70"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/50 to-white/80" />
      </div>

      <div className="container py-20 sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <h1 className="headline text-[var(--color-secondary)]">Recién horneado, ¡hecho para ti!</h1>
          <p className="subheadline mt-3">
            Panadería artesanal con ingredientes de primera calidad y recetas tradicionales.
            Descubre panes crujientes, dulces irresistibles y tortas personalizadas.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              href="/checkout"
              className="btn btn-primary"
            >
              Ordenar Ahora
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              href="/products"
              className="btn btn-outline-secondary"
            >
              Ver Menú
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}