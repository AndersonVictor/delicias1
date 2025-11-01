import type { NextConfig } from "next";

// Determinar dinámicamente el backend a partir de la variable de entorno
// Usa la URL completa del API (incluyendo "/api") si está disponible
const RAW_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

// Derivar ORIGIN (protocolo+host) y PREFIX (ruta, normalmente "/api") para rewrites y assets
let API_ORIGIN = "http://localhost:5001";
let API_PREFIX = "/api";
try {
  const u = new URL(RAW_API);
  API_ORIGIN = `${u.protocol}//${u.host}`;
  API_PREFIX = u.pathname.replace(/\/$/, "") || "/api";
} catch {
  // Mantener defaults locales si la URL es inválida
}

const nextConfig: NextConfig = {
  // Desactivar checks de tipos y ESLint durante build de producción
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Deshabilitar generación estática completa
  output: 'standalone',
  experimental: {
    // Forzar renderizado dinámico para todas las páginas
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_ORIGIN}${API_PREFIX}/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${API_ORIGIN}/uploads/:path*`,
      },
    ];
  },
  images: {
    // Configurar calidades permitidas para evitar advertencias de Next 16
    qualities: [80],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5001",
        pathname: "/uploads/**",
      },
      // Permitir imágenes de Unsplash usadas como fallback en productos
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      // Permitir placeholders remotos si existen en datos (p.ej. via.placeholder.com)
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "/**",
      },
      // Permitir imágenes del backend configurado (dinámico según env)
      (() => {
        try {
          const u = new URL(API_ORIGIN);
          return {
            protocol: u.protocol.replace(":", ""),
            hostname: u.hostname,
            port: u.port || undefined,
            pathname: "/uploads/**",
          } as const;
        } catch {
          return { protocol: "https", hostname: "delicias1-production.up.railway.app", pathname: "/uploads/**" } as const;
        }
      })() as any,
    ],
  },
};

export default nextConfig;
