"use client";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShoppingCart, Menu, X, Phone, Truck, Search, Wheat } from "lucide-react";
import SearchSuggest from "@/components/Product/SearchSuggest";
import axios from "axios";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { isAuthenticated, isAdmin, logout, user } = useAuth();
  const { getCartItemsCount, openCart } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [search, setSearch] = useState("");
  const [categorias, setCategorias] = useState<Array<{ id: number; nombre: string }>>([]);

  // Cierra el menú al cambiar de ruta
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cargar categorías para la barra secundaria
  useEffect(() => {
    const loadCategorias = async () => {
      try {
        const res = await axios.get("/api/categorias");
        const data = res.data?.data || res.data?.categorias || res.data || [];
        setCategorias(Array.isArray(data) ? data : Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        // Silenciar error en navbar; la tienda sigue funcionando aunque no cargue la barra de categorías
        console.debug("Navbar: no se pudieron cargar categorías");
      }
    };
    loadCategorias();
  }, []);

  const cartCount = getCartItemsCount();

  const onSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = search.trim();
    const url = q ? `/products?buscar=${encodeURIComponent(q)}` : "/products";
    router.push(url);
    setOpen(false);
  };

  // Alturas del header fijo (px)
  const TOPBAR_H = 36; // h-9
  const NAV_H = 64;    // h-16
  const CATEGORIES_H = categorias.length > 0 ? 48 : 0; // h-12 si hay categorías
  const headerOffset = TOPBAR_H + NAV_H + CATEGORIES_H;

  return (
    <>
    <header role="navigation" aria-label="Barra principal" className="navbar">
      {/* Top bar informativa */}
      <div className="bg-white/90 border-b border-black/10">
        <div className="container h-9 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 text-black/70">
            <span className="inline-flex items-center gap-1"><Truck size={14} /> Envío gratis en compras desde S/ 80</span>
            <span className="hidden sm:inline-block">|</span>
            <a href="tel:993560096" className="inline-flex items-center gap-1 hover:text-black"><Phone size={14} /> 993560096</a>
          </div>
          <div className="flex items-center gap-3 text-black/70">
            <Link href="/#contacto" className="hover:text-black">Contáctanos</Link>
            <Link href="/checkout" className="hover:text-black">Ordenar ahora</Link>
          </div>
        </div>
      </div>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`navbar-inner ${isScrolled ? "navbar-blur" : ""}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/logos/logo 1.png" alt="Delicias" width={40} height={40} />
            <span className="font-semibold text-[var(--color-secondary)]">Delicias</span>
          </Link>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <nav aria-label="Navegación principal" className="flex items-center gap-6">
            <Link href="/" className="text-sm hover:text-[var(--color-secondary)]">Inicio</Link>
            <Link href="/products" className="text-sm hover:text-[var(--color-secondary)]">Menú</Link>
            <Link href="/historial" className="text-sm hover:text-[var(--color-secondary)]">Historial</Link>
            <Link href="/#nosotros" className="text-sm hover:text-[var(--color-secondary)]">Nosotros</Link>
            <Link href="/#contacto" className="text-sm hover:text-[var(--color-secondary)]">Contáctanos</Link>
            {isAdmin() && (
              <Link href="/admin" className="text-sm text-black/70 hover:text-black">Admin</Link>
            )}
          </nav>
          {/* Buscador */}
          <form onSubmit={onSearchSubmit} className="relative w-64">
            <label htmlFor="navbar-search" className="sr-only">Buscar en la tienda</label>
            <SearchSuggest
              value={search}
              onChange={(v) => setSearch(v)}
              onSelect={(s) => {
                const q = s?.nombre?.trim() || "";
                const url = q ? `/products?buscar=${encodeURIComponent(q)}` : "/products";
                router.push(url);
                setOpen(false);
              }}
              placeholder="Buscar productos..."
            />
            <button type="submit" aria-label="Buscar" className="absolute right-1 top-1.5 rounded-lg p-1.5 text-black/70 hover:text-black">
              <Search size={16} />
            </button>
          </form>
          <Link href="/checkout" className="btn btn-primary">Ordenar Ahora</Link>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-3">
          <button type="button" onClick={openCart} aria-label="Abrir carrito" className="relative inline-flex items-center justify-center rounded-xl p-2 hover:bg-black/5">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 rounded-full bg-[var(--color-primary)] text-white text-[10px] px-1.5 py-0.5">
                {cartCount}
              </span>
            )}
          </button>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Auth */}
          {isAuthenticated() ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/profile" className="inline-flex items-center gap-2">
                {user?.avatar ? (
                  <Image src={user.avatar} alt="Perfil" width={28} height={28} className="rounded-full border border-black/10" />
                ) : (
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-black/5 text-xs font-medium">
                    {(user?.nombre || user?.email || "?")[0]?.toUpperCase()}
                  </span>
                )}
                <span className="text-sm hover:text-[var(--color-secondary)]">{user?.nombre || user?.email || "Perfil"}</span>
              </Link>
              <button onClick={logout} className="text-sm text-black/70 hover:text-black">Salir</button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login" className="text-sm hover:text-[var(--color-secondary)]">Entrar</Link>
              <Link href="/register" className="text-sm hover:text-[var(--color-secondary)]">Registro</Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button aria-label="Abrir menú" aria-expanded={open} onClick={() => setOpen(v => !v)} className="md:hidden rounded-xl p-2 hover:bg-black/5">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      {/* Barra secundaria de categorías */}
      {categorias.length > 0 && (
        <div className="bg-white/90 border-b border-black/10">
          <div className="container h-12 flex items-center gap-4 overflow-x-auto">
            {categorias.map((c) => (
              <Link key={c.id} href={`/products?categoria=${c.id}`} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-sm text-black/80 hover:border-gray-400 whitespace-nowrap">
                <Wheat size={16} /> {c.nombre}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="md:hidden bg-white/80 backdrop-blur-md shadow-sm"
        >
          <div className="container py-3 grid grid-cols-2 gap-3">
            {/* Buscador móvil */}

            <form onSubmit={onSearchSubmit} className="col-span-2 relative">
              <label htmlFor="navbar-search-mobile" className="sr-only">Buscar en la tienda</label>
              <SearchSuggest
                value={search}
                onChange={(v) => setSearch(v)}
                onSelect={(s) => {
                  const q = s?.nombre?.trim() || "";
                  const url = q ? `/products?buscar=${encodeURIComponent(q)}` : "/products";
                  router.push(url);
                  setOpen(false);
                }}
                placeholder="Buscar productos..."
              />
              <button type="submit" aria-label="Buscar" className="absolute right-1 top-1.5 rounded-lg p-1.5 text-black/70 hover:text-black">
                <Search size={16} />
              </button>
            </form>
            <Link href="/" className="text-sm">Inicio</Link>
            <Link href="/products" className="text-sm">Menú</Link>
            <Link href="/historial" className="text-sm">Historial</Link>
            <Link href="/#nosotros" className="text-sm">Nosotros</Link>
            <Link href="/#contacto" className="text-sm">Contáctanos</Link>
            {isAdmin() && <Link href="/admin" className="text-sm">Admin</Link>}
            <Link href="/checkout" className="btn btn-primary col-span-2">Ordenar Ahora</Link>
            <button type="button" onClick={openCart} className="btn btn-outline-secondary col-span-2" aria-label="Abrir carrito">
              Abrir Carrito ({cartCount})
            </button>
            <div className="col-span-2">
              <ThemeToggle />
            </div>
            <div className="col-span-2 flex items-center gap-3">
              {isAuthenticated() ? (
                <>
                  <Link href="/profile" className="text-sm">{user?.nombre || user?.email || "Perfil"}</Link>
                  <button onClick={logout} className="text-sm">Cerrar sesión</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm">Iniciar sesión</Link>
                  <Link href="/register" className="text-sm">Registrarse</Link>
                </>
              )}
            </div>
            {/* Categorías móviles */}
            {categorias.length > 0 && (
              <div className="col-span-2 flex items-center gap-2 overflow-x-auto">
                {categorias.map((c) => (
                  <Link key={c.id} href={`/products?categoria=${c.id}`} className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white text-sm text-black/80 whitespace-nowrap">
                    <Wheat size={16} /> {c.nombre}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </header>
    {/* Spacer para que el contenido no quede debajo del header fijo */}
    <div aria-hidden className="pointer-events-none" style={{ height: headerOffset }} />
    </>
  );
}