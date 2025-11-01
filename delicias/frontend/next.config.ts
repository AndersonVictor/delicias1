import type { NextConfig } from "next";

// Apuntar explícitamente al backend NestJS en 5001 para evitar inconsistencias por variables de entorno.
const API_BASE = "http://localhost:5001";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_BASE}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${API_BASE}/uploads/:path*`,
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
    ],
  },
};

export default nextConfig;
