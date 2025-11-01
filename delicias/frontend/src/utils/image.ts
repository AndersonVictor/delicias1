import axios from "axios";

// Sanea URLs malformadas (comillas, paréntesis) y soporta rutas relativas
const sanitizeUrl = (url?: string | null) => {
  if (!url) return undefined;
  const trimmed = String(url).trim();
  // Elimina comillas/paréntesis comunes en datos sucios
  const cleaned = trimmed.replace(/^[["'()\]]+|[["')\]]+$/g, "");
  return cleaned || undefined;
};

/**
 * Resuelve la URL de imagen a partir de:
 * - un string (ruta/URL)
 * - un objeto con la propiedad `imagen`
 * Devuelve un fallback agradable si no hay imagen.
 */
export function getImageSrc(input?: string | { imagen?: string | null } | null, opts?: { width?: number }) {
  const fallbackW = opts?.width ?? 800;
  const fallback = `https://images.unsplash.com/photo-1549931319-a545dcf3bc73?ixlib=rb-4.0.3&auto=format&fit=crop&w=${fallbackW}&q=80`;

  const raw = typeof input === "string" ? input : input?.imagen ?? undefined;
  const val = sanitizeUrl(raw);

  // Soporta rutas relativas del sitio (e.g. /images/products/...)
  if (val && val.startsWith("/")) return val;

  // URL absolutas válidas
  if (val && (val.startsWith("http://") || val.startsWith("https://"))) {
    try {
      const u = new URL(val);
      return u.toString();
    } catch {
      return fallback;
    }
  }

  // Nombre de archivo servido por el backend
  if (val) return `${axios.defaults.baseURL || ""}/uploads/${val}`;

  return fallback;
}

export default getImageSrc;