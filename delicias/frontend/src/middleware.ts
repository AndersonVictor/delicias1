import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rutas que requieren autenticación de usuario
const USER_PROTECTED = [
  "/profile",
  "/orders",
  "/checkout",
];

// Rutas que requieren rol admin
const ADMIN_PROTECTED_PREFIX = "/admin";
const ADMIN_LOGIN_PATH = "/admin/login";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get("token")?.value;

  // Protege rutas de usuario
  if (USER_PROTECTED.includes(pathname)) {
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  // Protege rutas admin (se validará rol en el backend o con un claim futuro)
  // Evitar bucle de redirección: permitir acceso a /admin/login sin token
  if (pathname.startsWith(ADMIN_PROTECTED_PREFIX) && pathname !== ADMIN_LOGIN_PATH) {
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profile",
    "/orders",
    "/checkout",
    "/admin/:path*",
  ],
};