# Delicias Bakery — Monorepo Next.js + NestJS

Aplicación web profesional para una panadería, migrada y consolidada en un monorepo con:
- Frontend: Next.js 15 (App Router, SSR/SSG), Tailwind CSS.
- Backend: NestJS 11 (JWT, Prisma), MySQL como base de datos.

## 🚀 Características

### Frontend (Next.js)
- Ruteo por archivos (App Router) y metadata por página.
- SSR/SSG donde aporta rendimiento (catálogo, páginas públicas).
- Autenticación con token JWT almacenado en cookie.
- Protección de rutas mediante `src/middleware.ts` (usuario y admin).
- Rewrites de `/api/*` y `/uploads/*` hacia el backend NestJS.
- Componentes de UI y diseño admin en `src/design/admin/`.

### Backend (NestJS)
- Módulos para autenticación, usuarios, productos, categorías, pedidos y facturación.
- Validación con `class-validator` y `ValidationPipe` global.
- JWT con expiración de 24h y estrategia Passport.
- Prisma ORM con `provider = "mysql"` y modelos listos para producción.
- Servido de archivos estáticos en `/uploads` (imágenes de productos).
- Documentación de API con Swagger en `/api/docs` y YAML en `/api/docs-yaml`.

## 📁 Estructura del Proyecto

```
delicias/
├── backend/               # NestJS + Prisma (MySQL)
│   ├── src/               # Módulos, controladores y servicios
│   ├── prisma/            # Esquema Prisma (MySQL)
│   ├── uploads/           # Archivos subidos (servidos en /uploads)
│   └── scripts/seed-admin.js
├── frontend/              # Next.js (App Router)
│   ├── src/app/           # Rutas y layouts
│   ├── src/components/    # Componentes UI
│   ├── src/context/       # Contextos (Auth, Cart)
│   └── next.config.ts     # Rewrites hacia backend
└── package.json           # Scripts del monorepo
```

## 📋 Requisitos Previos

- Node.js 18+ (recomendado 20+).
- MySQL 8.x en local o en servicio gestionado.
- npm (o yarn/pnpm).

## ⚙️ Configuración

1) Instalar dependencias del monorepo:

```bash
npm run install-all
```

2) Backend — Variables de entorno (`backend/.env`):

```env
PORT=5001
DATABASE_URL="mysql://usuario:password@localhost:3306/delicias"
JWT_SECRET="tu_jwt_secret_seguro"
# Opcional para seeding del admin por defecto
ADMIN_EMAIL="admin@delicias.com"
ADMIN_PASSWORD="admin123"
```

3) Inicializar Prisma (si es primera vez):

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

4) Sembrar admin por defecto (opcional):

```bash
cd backend
npm run seed:admin
```

## ▶️ Ejecución en Desarrollo

Desde la raíz del monorepo:

```bash
npm run dev
```

- Frontend (Next): http://localhost:3005
- Backend (Nest): http://localhost:5001

El frontend reescribe `/api/*` y `/uploads/*` hacia el backend, por lo que las llamadas `axios` a `/api/...` funcionan sin configurar dominios manualmente.

## 🧪 Pruebas

- Backend (Nest):
```bash
cd backend
npm run test
npm run test:e2e
```

- Frontend (Next): pendiente de integrar pruebas (p. ej. Vitest/Playwright).

## 🔐 Usuarios por Defecto

Si ejecutaste el seed:
- Admin: `admin@delicias.com` / `admin123` (puedes cambiarlo en `.env`).

## 🧰 Tecnologías

### Frontend
- Next.js 15, React 19, Tailwind CSS 4, Framer Motion, Lucide React, Swiper.

### Backend
- NestJS 11, Prisma, JWT, Bcrypt, Swagger.

## 📖 Notas de Migración

- Se eliminó la app independiente de React (CRA/Vite/React Router DOM). El frontend ahora es 100% Next.js con App Router.
- Las rutas protegidas se manejan vía `middleware.ts` y verificación en backend.
- Las llamadas a API se realizan contra `/api/*`, y son atendidas por NestJS mediante rewrites definidos en `next.config.ts`.

## 📄 Licencia

MIT.

## 📞 Soporte

Para soporte o preguntas, contacta a: soporte@delicias.com

---

¡Gracias por usar Delicias Bakery! 🥖🧁