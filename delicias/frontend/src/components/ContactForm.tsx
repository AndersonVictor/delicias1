"use client";
import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

type FormValues = {
  nombre: string;
  email: string;
  telefono?: string;
  mensaje: string;
};

export default function ContactForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await axios.post('/api/contacto', data);
      if (res.data?.ok) {
        alert("¡Gracias! Tu mensaje fue enviado y te contactaremos pronto.");
        reset();
      } else {
        alert("No se pudo enviar el mensaje. Inténtalo nuevamente.");
      }
    } catch (err) {
      console.error('Error enviando contacto', err);
      alert("Ocurrió un error al enviar el mensaje. Por favor, inténtalo más tarde.");
    }
  };

  return (
    <section id="contacto" className="py-12">
      <div className="container">
        <div className="max-w-xl mx-auto card p-6">
          <h3 className="text-xl font-semibold text-[var(--color-secondary)]">Contáctanos</h3>
          <p className="text-sm text-black/70 mt-1">¿Tienes un pedido especial o consulta? Envíanos un mensaje.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3">
            <div>
              <label className="block text-sm font-medium">Nombre</label>
              <input
                type="text"
                className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/20"
                {...register("nombre", { required: "Ingresa tu nombre" })}
              />
              {errors.nombre && <p className="text-xs text-red-600 mt-1">{errors.nombre.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/20"
                {...register("email", {
                  required: "Ingresa tu email",
                  pattern: { value: /[^@\s]+@[^@\s]+\.[^@\s]+/, message: "Email inválido" },
                })}
              />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">Teléfono (opcional)</label>
              <input
                type="tel"
                className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/20"
                {...register("telefono")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Mensaje</label>
              <textarea
                rows={4}
                className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/20"
                {...register("mensaje", { required: "Cuéntanos tu consulta" })}
              />
              {errors.mensaje && <p className="text-xs text-red-600 mt-1">{errors.mensaje.message}</p>}
            </div>

            <div className="pt-2">
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}