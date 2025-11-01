"use client";
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import getImageSrc from "@/utils/image";

export default function CheckoutPage() {
  const { isAuthenticated } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();
  type CartItem = { id: number; nombre: string; precio: number | string; cantidad: number; imagen?: string | null };
  const cartItemsTyped = cartItems as CartItem[];
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [direccionEntrega, setDireccionEntrega] = useState("");
  const [telefonoContacto, setTelefonoContacto] = useState("");
  const [notas, setNotas] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const [comprobanteTipo, setComprobanteTipo] = useState<"boleta" | "factura">("boleta");
  const [tipoDocumento, setTipoDocumento] = useState<"DNI" | "RUC">("DNI");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  // Datos de identidad consultados (RENIEC/SUNAT)
  const [dniData, setDniData] = useState<any | null>(null);
  const [rucData, setRucData] = useState<any | null>(null);
  const [docMessage, setDocMessage] = useState<string | null>(null);

  const currency = useMemo(
    () => (n: number) => new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(n),
    []
  );

  useEffect(() => {
    // Si no hay autenticación o el carrito está vacío, mostrar mensajes
  }, []);

  const validate = () => {
    if (!fechaEntrega || !direccionEntrega || !telefonoContacto) {
      setError("Completa fecha de entrega, dirección y teléfono");
      return false;
    }
    if (!numeroDocumento) {
      setError("Ingresa el número de documento para el comprobante");
      return false;
    }
    if (comprobanteTipo === "factura" && tipoDocumento !== "RUC") {
      setError("Para emitir factura, el tipo de documento debe ser RUC");
      return false;
    }
    if (tipoDocumento === "DNI" && !/^\d{8}$/.test(numeroDocumento)) {
      setError("El DNI debe tener 8 dígitos");
      return false;
    }
    if (tipoDocumento === "RUC" && !/^\d{11}$/.test(numeroDocumento)) {
      setError("El RUC debe tener 11 dígitos");
      return false;
    }
    if (paymentMethod === "card") {
      if (!cardNumber || !cardName || !cardExp || !cardCvv) {
        setError("Completa los datos de la tarjeta");
        return false;
      }
      if (!/^\d{16}$/.test(cardNumber.replace(/\s+/g, ""))) {
        setError("Número de tarjeta inválido (16 dígitos)");
        return false;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExp)) {
        setError("Fecha de expiración inválida (MM/YY)");
        return false;
      }
      if (!/^\d{3,4}$/.test(cardCvv)) {
        setError("CVV inválido");
        return false;
      }
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      setError("Debes iniciar sesión para realizar el checkout");
      toast.error("Debes iniciar sesión para realizar el checkout");
      return;
    }
    if (cartItems.length === 0) {
      setError("Tu carrito está vacío");
      toast.error("Tu carrito está vacío");
      return;
    }
    if (!validate()) {
      toast.error("Revisa los datos del formulario");
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const orderData = {
        productos: cartItemsTyped.map((item) => ({ id: item.id, cantidad: item.cantidad })),
        fecha_entrega: fechaEntrega,
        direccion_entrega: direccionEntrega,
        telefono_contacto: telefonoContacto,
        notas: notas || undefined,
        pago: {
          metodo: paymentMethod,
          tarjeta:
            paymentMethod === "card"
              ? { numero: cardNumber, nombre: cardName, exp: cardExp, cvv: cardCvv }
              : undefined,
        },
      };

      const response = await axios.post("/api/pedidos", orderData);
      const pedidoId = response.data?.pedido?.id;
      setMessage(`Pedido creado. ID: ${pedidoId}`);
      toast.success("Pedido creado exitosamente");

      // Emitir comprobante si el backend lo soporta
      try {
        const emitirResp = await axios.post(
          "/api/facturacion/emitir",
          {
            pedido_id: pedidoId,
            comprobante_tipo: comprobanteTipo,
            tipo_documento: tipoDocumento,
            numero_documento: numeroDocumento,
          },
          {
            headers: process.env.NEXT_PUBLIC_DECOLECTA_TOKEN
              ? { "X-Decolecta-Token": process.env.NEXT_PUBLIC_DECOLECTA_TOKEN }
              : undefined,
          }
        );
        const baseURL = axios.defaults.baseURL || "";
        const pdfUrl = `${baseURL}${emitirResp.data?.archivos?.pdf || ""}`;
        const xmlUrl = `${baseURL}${emitirResp.data?.archivos?.xml || ""}`;
        setMessage(
          `Pedido y comprobante emitidos. Ver PDF: ${pdfUrl} · Ver XML: ${xmlUrl}`
        );
        toast.success("Comprobante emitido");
        // Limpiar datos de identidad consultados tras la emisión
        setDniData(null);
        setRucData(null);
        setDocMessage(null);
      } catch (err) {
        console.warn("No se pudo emitir comprobante", err);
      }

      clearCart();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message || err.message
        : "Error al procesar el pedido";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleConsultarDocumento = async () => {
    if (!isAuthenticated()) {
      setError("Debes iniciar sesión para consultar el documento");
      return;
    }
    // Validación básica previa
    if (tipoDocumento === "DNI" && !/^\d{8}$/.test(numeroDocumento)) {
      setError("El DNI debe tener 8 dígitos");
      return;
    }
    if (tipoDocumento === "RUC" && !/^\d{11}$/.test(numeroDocumento)) {
      setError("El RUC debe tener 11 dígitos");
      return;
    }
    setError(null);
    setDocMessage(null);
    try {
      if (tipoDocumento === "DNI") {
        const resp = await axios.get(`/api/facturacion/consulta-dni?numero=${encodeURIComponent(numeroDocumento)}`,
          {
            headers: process.env.NEXT_PUBLIC_DECOLECTA_TOKEN
              ? { "X-Decolecta-Token": process.env.NEXT_PUBLIC_DECOLECTA_TOKEN }
              : undefined,
          }
        );
        setDniData(resp.data?.data || resp.data);
        setRucData(null);
        setDocMessage("Datos consultados en RENIEC correctamente.");
        toast.success("Datos consultados correctamente");
      } else {
        const resp = await axios.get(`/api/facturacion/consulta-ruc?numero=${encodeURIComponent(numeroDocumento)}`,
          {
            headers: process.env.NEXT_PUBLIC_DECOLECTA_TOKEN
              ? { "X-Decolecta-Token": process.env.NEXT_PUBLIC_DECOLECTA_TOKEN }
              : undefined,
          }
        );
        setRucData(resp.data?.data || resp.data);
        setDniData(null);
        setDocMessage("Datos consultados en SUNAT correctamente.");
        toast.success("Datos consultados correctamente");
      }
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? ((err.response?.data as { message?: string } | undefined)?.message || err.message)
        : "No se pudo consultar el documento";
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Checkout</h1>

      {!isAuthenticated() && (
        <div className="p-3 bg-yellow-100 text-yellow-800 rounded mb-4">
          Debes iniciar sesión para completar tu compra. <Link href="/login" className="underline">Iniciar sesión</Link>
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="p-3 bg-blue-100 text-blue-800 rounded">Tu carrito está vacío.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Resumen mejorado */}
          <div className="md:col-span-2 space-y-6">
            <div className="border rounded">
              <div className="p-3 font-medium border-b">Resumen de productos</div>
              <ul className="divide-y">
                <AnimatePresence initial={false}>
                  {cartItemsTyped.map((item) => (
                    <motion.li
                      key={item.id}
                      className="p-3 flex items-center gap-3"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getImageSrc({ imagen: item.imagen }, { width: 160 })}
                        alt={item.nombre}
                        className="w-16 h-16 rounded object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{item.nombre}</div>
                            <div className="text-xs text-gray-600">Cantidad: x{item.cantidad}</div>
                          </div>
                          <div className="text-sm text-black/70">Precio unitario: {currency(Number(item.precio))}</div>
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <div className="text-xs text-gray-600">Subtotal</div>
                          <motion.div
                            key={item.cantidad}
                            initial={{ scale: 1 }}
                            animate={{ scale: [1, 1.06, 1] }}
                            transition={{ duration: 0.35 }}
                            className="font-semibold"
                          >
                            {currency(Number(item.precio) * item.cantidad)}
                          </motion.div>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
              <div className="p-3 border-t flex items-center justify-between">
                <div className="text-sm">Total</div>
                <div className="font-semibold">{currency(getCartTotal())}</div>
              </div>
+             <div className="px-3 pb-3 text-xs text-black/60">
+               {comprobanteTipo === "boleta" ? "Boleta: Sin IGV" : "Factura: IGV no aplicado (temporal)"}
+             </div>
            </div>

            {/* Formulario de checkout */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium">Fecha de entrega</label>
                  <input
                    type="date"
                    value={fechaEntrega}
                    onChange={(e) => setFechaEntrega(e.target.value)}
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium">Dirección de entrega</label>
                  <input
                    type="text"
                    value={direccionEntrega}
                    onChange={(e) => setDireccionEntrega(e.target.value)}
                    className="mt-1 w-full border rounded px-3 py-2"
                    placeholder="Av. Siempre Viva 742"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Teléfono de contacto</label>
                  <input
                    type="tel"
                    value={telefonoContacto}
                    onChange={(e) => setTelefonoContacto(e.target.value)}
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Notas</label>
                  <input
                    type="text"
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    className="mt-1 w-full border rounded px-3 py-2"
                    placeholder="Instrucciones adicionales"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium">Método de pago</label>
                <div className="mt-1 flex items-center gap-4">
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" name="payment" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} />
                    Tarjeta
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" name="payment" checked={paymentMethod === "cash"} onChange={() => setPaymentMethod("cash")} />
                    Efectivo
                  </label>
                </div>
              </div>

              {paymentMethod === "card" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">Número de tarjeta</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="mt-1 w-full border rounded px-3 py-2"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Nombre en la tarjeta</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="mt-1 w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Expiración (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExp}
                      onChange={(e) => setCardExp(e.target.value)}
                      className="mt-1 w-full border rounded px-3 py-2"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">CVV</label>
                    <input
                      type="text"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="mt-1 w-full border rounded px-3 py-2"
                      placeholder="123"
                    />
                  </div>
                </div>
              )}

              {/* Comprobante */}
              <div className="border rounded">
                <div className="p-3 font-medium border-b">Comprobante electrónico</div>
                <div className="p-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium">Tipo</label>
                    <select className="mt-1 w-full border rounded px-3 py-2" value={comprobanteTipo} onChange={(e) => setComprobanteTipo(e.target.value as "boleta" | "factura")}>
                      <option value="boleta">Boleta</option>
                      <option value="factura">Factura</option>
                    </select>
+                   <p className="mt-1 text-xs text-black/60">Para boleta no se aplica IGV.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Documento</label>
                    <select className="mt-1 w-full border rounded px-3 py-2" value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value as "DNI" | "RUC")}>
                      <option value="DNI">DNI</option>
                      <option value="RUC">RUC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Número</label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={numeroDocumento}
                        onChange={(e) => setNumeroDocumento(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        placeholder="12345678 (DNI) o 20123456789 (RUC)"
                      />
                      <button
                        type="button"
                        onClick={handleConsultarDocumento}
                        className="px-3 py-2 rounded border bg-white hover:bg-gray-50"
                        title="Consultar datos en RENIEC/SUNAT"
                      >
                        Consultar
                      </button>
                    </div>
                  </div>
                </div>
                {(dniData || rucData || docMessage) && (
                  <div className="p-3 border-t text-sm text-gray-800 space-y-2">
                    {docMessage && <div className="text-green-700">{docMessage}</div>}
                    {dniData && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div><span className="text-gray-600">Nombres:</span> {dniData.first_name || "-"}</div>
                        <div><span className="text-gray-600">Apellido paterno:</span> {dniData.first_last_name || "-"}</div>
                        <div><span className="text-gray-600">Apellido materno:</span> {dniData.second_last_name || "-"}</div>
                      </div>
                    )}
                    {rucData && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div><span className="text-gray-600">Razón social:</span> {rucData.razon_social || rucData.nombre_o_razon_social || "-"}</div>
                        <div><span className="text-gray-600">Nombre comercial:</span> {rucData.nombre_comercial || "-"}</div>
                        <div><span className="text-gray-600">Estado/Condición:</span> {(rucData.estado || rucData.condicion) || "-"}</div>
                        <div className="md:col-span-3"><span className="text-gray-600">Domicilio fiscal:</span> {rucData.direccion || rucData.domicilio_fiscal || rucData.domicilio || "-"}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}
              {message && <div className="p-3 bg-green-100 text-green-700 rounded">{message}</div>}

              <div className="flex justify-end">
                <motion.button
                  type="submit"
                  disabled={loading || !isAuthenticated()}
                  className="px-4 py-2 rounded bg-gray-800 text-white hover:bg-gray-900 disabled:opacity-50"
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? "Procesando..." : "Confirmar pedido"}
                </motion.button>
              </div>
            </form>
          </div>

          {/* Info lateral */}
          <div className="space-y-4">
            <div className="border rounded p-3">
              <div className="font-medium mb-2">Ayuda</div>
              <div className="text-sm text-gray-700">Nuestros pedidos se preparan diariamente. La fecha de entrega puede ajustarse según disponibilidad.</div>
            </div>
            <div className="border rounded p-3">
              <div className="font-medium mb-2">Soporte</div>
              <div className="text-sm text-gray-700">Si tienes dudas, contáctanos por WhatsApp o email.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}