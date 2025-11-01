"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function VisitUs() {
  const gallery = [
    "/images/products/alfajores.jpg",
    "/images/products/delikeik.jpg",
    "/images/products/karamanduka.jpg",
    "/images/products/pionono.jpg",
    "/images/products/tostadas.jpg",
  ];

  return (
    <section id="visitanos" className="py-12">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-secondary)]">Visítanos hoy</h2>
            <p className="subheadline">
              Panadería Delicias — Jr. Parra del Riego #164, El Tambo, Huancayo.
              Atención: Lunes a Domingo, 7:00 AM – 9:00 PM.
            </p>
            <ul className="text-sm text-black/70">
              <li><strong>Celular:</strong> 993560096</li>
              <li><strong>Correo:</strong> contacto@delicias.com</li>
            </ul>
            <div className="flex gap-3 mt-3">
              <a href="/products" className="btn btn-outline-secondary">Ver el menú</a>
              <a href="#mapa" className="btn btn-primary">Cómo llegar</a>
            </div>
            <div id="mapa" className="mt-4 card overflow-hidden">
              <iframe
                title="Ubicación Delicias"
                src="https://www.google.com/maps?q=Jr.+Parra+del+Riego+164,+El+Tambo,+Huancayo&output=embed"
                width="100%"
                height="280"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {gallery.map((src) => (
                <div key={src} className="relative aspect-square rounded-2xl overflow-hidden">
                  <Image src={src} alt="Producto Delicias" fill className="object-cover" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}