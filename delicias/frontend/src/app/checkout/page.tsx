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
  const [dniData, setDniData] = useState<Record<string, unknown> | null>(null);
  const [rucData, setRucData] = useState<Record<string, unknown> | null>(null);
  const [docMessage, setDocMessage] = useState<string | null>(null);

  // Field validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const currency = useMemo(
    () => (n: number) => new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(n),
    []
  );

  useEffect(() => {
    // Si no hay autenticación o el carrito está vacío, mostrar mensajes
  }, []);

  // Get minimum date (today) for delivery date
  const getMinDeliveryDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Validate and format phone (9 digits)
  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const limited = digits.slice(0, 9);
    setTelefonoContacto(limited);
    
    if (limited.length > 0 && limited.length < 9) {
      setFieldErrors(prev => ({ ...prev, telefono: 'El teléfono debe tener exactamente 9 dígitos' }));
    } else if (limited.length === 9) {
      setFieldErrors(prev => {
        const { telefono, ...rest } = prev;
        return rest;
      });
    } else {
      setFieldErrors(prev => {
        const { telefono, ...rest } = prev;
        return rest;
      });
    }
  };

  // Validate and format card number (16 digits with spaces)
  const handleCardNumberChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const limited = digits.slice(0, 16);
    const formatted = limited.match(/.{1,4}/g)?.join(' ') || limited;
    setCardNumber(formatted);

    if (limited.length > 0 && limited.length < 16) {
      setFieldErrors(prev => ({ ...prev, cardNumber: 'La tarjeta debe tener 16 dígitos' }));
    } else if (limited.length === 16) {
      setFieldErrors(prev => {
        const { cardNumber, ...rest } = prev;
        return rest;
      });
    } else {
      setFieldErrors(prev => {
        const { cardNumber, ...rest } = prev;
        return rest;
      });
    }
  };

  // Validate and format card expiration (MM/YY)
  const handleCardExpChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    let formatted = digits;
    
    if (digits.length >= 2) {
      formatted = digits.slice(0, 2) + '/' + digits.slice(2, 4);
    }
    
    setCardExp(formatted);

    if (formatted.length === 5) {
      const [month, year] = formatted.split('/');
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);
      const currentYear = new Date().getFullYear() % 100;
      
      if (monthNum < 1 || monthNum > 12) {
        setFieldErrors(prev => ({ ...prev, cardExp: 'Mes debe estar entre 01-12' }));
      } else if (yearNum < currentYear) {
        setFieldErrors(prev => ({ ...prev, cardExp: 'El año no puede ser anterior al actual' }));
      } else {
        setFieldErrors(prev => {
          const { cardExp, ...rest } = prev;
          return rest;
        });
      }
    } else if (formatted.length > 0) {
      setFieldErrors(prev => ({ ...prev, cardExp: 'Formato de expiración inválido (MM/YY)' }));
    } else {
      setFieldErrors(prev => {
        const { cardExp, ...rest } = prev;
        return rest;
      });
    }
  };

  // Validate and format CVV (3 digits)
  const handleCvvChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const limited = digits.slice(0, 3);
    setCardCvv(limited);

    if (limited.length > 0 && limited.length < 3) {
      setFieldErrors(prev => ({ ...prev, cvv: 'El CVV debe tener 3 dígitos' }));
    } else if (limited.length === 3) {
      setFieldErrors(prev => {
        const { cvv, ...rest } = prev;
        return rest;
      });
    } else {
      setFieldErrors(prev => {
        const { cvv, ...rest } = prev;
        return rest;
      });
    }
  };

  // Validate delivery date
  const handleFechaEntregaChange = (value: string) => {
    setFechaEntrega(value);
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setFieldErrors(prev => ({ ...prev, fechaEntrega: 'La fecha de entrega no puede ser anterior a hoy' }));
    } else {
      setFieldErrors(prev => {
        const { fechaEntrega, ...rest } = prev;
        return rest;
      });
    }
  };

  // Check if form has errors
  const hasErrors = Object.keys(fieldErrors).length > 0;

  const validate = () => {
    // Check if there are any field errors
    if (hasErrors) {
      setError("Por favor corrige los errores en el formulario");
      return false;
    }

    if (!fechaEntrega || !direccionEntrega || !telefonoContacto) {
      setError("Completa fecha de entrega, dirección y teléfono");
      return false;
    }

    // Validate delivery date is not in the past
    const selectedDate = new Date(fechaEntrega);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setError("La fecha de entrega no puede ser anterior a hoy");
      return false;
    }

    // Validate phone is exactly 9 digits
    if (!/^\d{9}$/.test(telefonoContacto)) {
      setError("El teléfono debe tener exactamente 9 dígitos");
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
      
      // Validate expiration date
      const [month, year] = cardExp.split('/');
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);
      const currentYear = new Date().getFullYear() % 100;
      
      if (monthNum < 1 || monthNum > 12) {
        setError("Mes debe estar entre 01-12");
        return false;
      }
      if (yearNum < currentYear) {
        setError("El año no puede ser anterior al actual");
        return false;
      }

      if (!/^\d{3}$/.test(cardCvv)) {
        setError("El CVV debe tener 3 dígitos");
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
        const resp = await axios.get(`/api/facturacion/consulta-dni?numero=${encodeURIComponent(numeroDocumento)}`);
        setDniData(resp.data?.data || resp.data);
        setRucData(null);
        setDocMessage("Datos consultados en RENIEC correctamente.");
        toast.success("Datos consultados correctamente");
      } else {
        const resp = await axios.get(`/api/facturacion/consulta-ruc?numero=${encodeURIComponent(numeroDocumento)}`);
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
                    onChange={(e) => handleFechaEntregaChange(e.target.value)}
                    min={getMinDeliveryDate()}
                    className={`mt-1 w-full border rounded px-3 py-2 ${
                      fieldErrors.fechaEntrega 
                        ? 'border-red-500' 
                        : fechaEntrega && !fieldErrors.fechaEntrega 
                        ? 'border-green-500' 
                        : ''
                    }`}
                  />
                  {fieldErrors.fechaEntrega && (
                    <p className="text-red-600 text-xs mt-1">{fieldErrors.fechaEntrega}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium">Dirección de entrega</label>
                  <input
                    type="text"
                    value={direccionEntrega}
                    onChange={(e) => setDireccionEntrega(e.target.value)}
                    className={`mt-1 w-full border rounded px-3 py-2 ${
                      direccionEntrega ? 'border-green-500' : ''
                    }`}
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
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className={`mt-1 w-full border rounded px-3 py-2 ${
                      fieldErrors.telefono 
                        ? 'border-red-500' 
                        : telefonoContacto.length === 9 
                        ? 'border-green-500' 
                        : ''
                    }`}
                    placeholder="999999999"
                    maxLength={9}
                  />
                  {fieldErrors.telefono && (
                    <p className="text-red-600 text-xs mt-1">{fieldErrors.telefono}</p>
                  )}
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
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      className={`mt-1 w-full border rounded px-3 py-2 ${
                        fieldErrors.cardNumber 
                          ? 'border-red-500' 
                          : cardNumber.replace(/\s/g, '').length === 16 
                          ? 'border-green-500' 
                          : ''
                      }`}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                    {fieldErrors.cardNumber && (
                      <p className="text-red-600 text-xs mt-1">{fieldErrors.cardNumber}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Nombre en la tarjeta</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className={`mt-1 w-full border rounded px-3 py-2 ${
                        cardName ? 'border-green-500' : ''
                      }`}
                      placeholder="JUAN PEREZ"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Expiración (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExp}
                      onChange={(e) => handleCardExpChange(e.target.value)}
                      className={`mt-1 w-full border rounded px-3 py-2 ${
                        fieldErrors.cardExp 
                          ? 'border-red-500' 
                          : cardExp.length === 5 && !fieldErrors.cardExp 
                          ? 'border-green-500' 
                          : ''
                      }`}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                    {fieldErrors.cardExp && (
                      <p className="text-red-600 text-xs mt-1">{fieldErrors.cardExp}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium">CVV</label>
                    <input
                      type="text"
                      value={cardCvv}
                      onChange={(e) => handleCvvChange(e.target.value)}
                      className={`mt-1 w-full border rounded px-3 py-2 ${
                        fieldErrors.cvv 
                          ? 'border-red-500' 
                          : cardCvv.length === 3 
                          ? 'border-green-500' 
                          : ''
                      }`}
                      placeholder="123"
                      maxLength={3}
                    />
                    {fieldErrors.cvv && (
                      <p className="text-red-600 text-xs mt-1">{fieldErrors.cvv}</p>
                    )}
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
                  disabled={loading || !isAuthenticated() || hasErrors}
                  className="px-4 py-2 rounded bg-gray-800 text-white hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileTap={{ scale: 0.98 }}
                  title={hasErrors ? "Corrige los errores antes de proceder" : ""}
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