# 🍰 Delicias Bakery - Sistema de E-commerce

Sistema completo de comercio electrónico para panadería y repostería con backend NestJS, frontend Next.js y base de datos MySQL.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Despliegue en Railway](#despliegue-en-railway)
- [Configuración Local](#configuración-local)
- [Variables de Entorno](#variables-de-entorno)

## ✨ Características

### Backend (NestJS)
- 🔐 Autenticación JWT con roles (Admin/Usuario)
- 👥 Gestión de usuarios y perfiles
- 📦 CRUD completo de productos y categorías
- 🛒 Sistema de pedidos y facturación
- 📊 Reportes y estadísticas
- 📧 Formulario de contacto
- 📄 Generación de comprobantes PDF
- 🖼️ Subida y gestión de imágenes
- 📚 Documentación API con Swagger

### Frontend (Next.js 15)
- 🎨 Interfaz moderna con Tailwind CSS
- 🌙 Modo claro/oscuro
- 🛍️ Catálogo de productos con filtros
- 🛒 Carrito de compras
- 👤 Panel de usuario con historial de pedidos
- 🔧 Panel de administración completo
- 📱 Diseño responsive
- ⚡ Server Components y App Router

## 🚀 Tecnologías

### Backend
- NestJS 11
- Prisma ORM
- MySQL
- JWT Authentication
- Passport.js
- Sharp (procesamiento de imágenes)
- PDFKit (generación de PDFs)
- Swagger/OpenAPI

### Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Axios
- React Hook Form
- Zod
- React Hot Toast

## 🚂 Despliegue en Railway

### Paso 1: Preparar el Proyecto

El proyecto ya está configurado con:
- ✅ `railway.json` para configuración de despliegue
- ✅ Scripts de build optimizados
- ✅ Archivos `.env.example` como referencia

### Paso 2: Crear Servicios en Railway

#### 2.1. Crear Base de Datos MySQL

1. Ve a [Railway](https://railway.app)
2. Crea un nuevo proyecto
3. Agrega un servicio **MySQL**
4. Railway generará automáticamente la `DATABASE_URL`

#### 2.2. Desplegar Backend

1. Conecta tu repositorio de GitHub
2. Crea un nuevo servicio desde el repositorio
3. Configura las variables de entorno:

```bash
DATABASE_URL=${{MySQL.DATABASE_URL}}
JWT_SECRET=tu-secreto-super-seguro-cambiar-en-produccion
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://tu-frontend.railway.app
```

4. Configura el **Root Directory**: `delicias/backend`
5. Configura los comandos:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`

6. Después del primer despliegue, ejecuta las migraciones:
   - Ve a la terminal del servicio
   - Ejecuta: `npm run prisma:migrate`
   - Ejecuta: `npm run seed:admin` (crear usuario admin)

#### 2.3. Desplegar Frontend

1. Crea otro servicio desde el mismo repositorio
2. Configura las variables de entorno:

```bash
NEXT_PUBLIC_API_URL=https://tu-backend.railway.app/api
NEXT_PUBLIC_APP_NAME=Delicias Bakery
NEXT_PUBLIC_APP_URL=https://tu-frontend.railway.app
```

3. Configura el **Root Directory**: `delicias/frontend`
4. Configura los comandos:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`

### Paso 3: Configurar Dominios

1. Railway asignará dominios automáticamente
2. Actualiza `FRONTEND_URL` en el backend con el dominio del frontend
3. Actualiza `NEXT_PUBLIC_API_URL` en el frontend con el dominio del backend

### Paso 4: Verificar Despliegue

1. Accede a tu frontend: `https://tu-frontend.railway.app`
2. Verifica la API: `https://tu-backend.railway.app/api/docs` (Swagger)
3. Prueba el login admin:
   - Email: `admin@delicias.com`
   - Password: (el que configuraste en seed)

## 💻 Configuración Local

### Requisitos Previos

- Node.js 18+ y npm
- MySQL 8+
- Git

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/AndersonVictor/delicias1.git
cd delicias1
```

2. **Instalar dependencias**
```bash
# Desde la raíz del proyecto
npm run install-all
```

3. **Configurar Backend**

```bash
cd delicias/backend

# Copiar archivo de entorno
cp .env.example .env

# Editar .env con tus configuraciones
nano .env
```

Configurar tu `DATABASE_URL` en `.env`:
```
DATABASE_URL="mysql://usuario:password@localhost:3306/delicias_bakery"
```

4. **Ejecutar migraciones de Prisma**
```bash
# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate deploy

# (Opcional) Crear usuario admin
npm run seed:admin
```

5. **Configurar Frontend**

```bash
cd ../frontend

# Copiar archivo de entorno
cp .env.example .env.local

# Editar .env.local
nano .env.local
```

Configurar en `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

6. **Iniciar el proyecto**

```bash
# Desde la raíz del proyecto delicias
cd ..
npm run dev
```

Esto iniciará:
- Backend en `http://localhost:3000`
- Frontend en `http://localhost:3005`

## 🔐 Variables de Entorno

### Backend (.env)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de conexión MySQL | `mysql://user:pass@localhost:3306/db` |
| `JWT_SECRET` | Secreto para tokens JWT | `secret-key-256-bits` |
| `JWT_EXPIRES_IN` | Tiempo de expiración JWT | `7d` |
| `PORT` | Puerto del servidor | `3000` |
| `NODE_ENV` | Entorno de ejecución | `production` |
| `FRONTEND_URL` | URL del frontend para CORS | `https://frontend.com` |

### Frontend (.env.local)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | URL de la API backend | `http://localhost:3000/api` |
| `NEXT_PUBLIC_APP_NAME` | Nombre de la aplicación | `Delicias Bakery` |
| `NEXT_PUBLIC_APP_URL` | URL del frontend | `http://localhost:3005` |

## 📚 Documentación API

Una vez desplegado el backend, accede a la documentación Swagger en:
- Local: `http://localhost:3000/api/docs`
- Producción: `https://tu-backend.railway.app/api/docs`

## 🔧 Scripts Disponibles

### Raíz del Proyecto
```bash
npm run dev           # Inicia backend y frontend en modo desarrollo
npm run install-all   # Instala dependencias de todos los proyectos
```

### Backend
```bash
npm run start:dev     # Desarrollo con hot-reload
npm run build         # Compilar para producción
npm run start:prod    # Iniciar en producción
npm run prisma:migrate # Ejecutar migraciones
npm run seed:admin    # Crear usuario administrador
```

### Frontend
```bash
npm run dev          # Desarrollo con Turbopack
npm run build        # Compilar para producción
npm run start        # Iniciar servidor de producción
npm run lint         # Ejecutar linter
```

## 📦 Estructura del Proyecto

```
delicias/
├── backend/              # API NestJS
│   ├── prisma/          # Esquema y migraciones
│   ├── src/             # Código fuente
│   │   ├── auth/        # Autenticación<z>
│   │   ├── usuarios/    # Gestión de usuarios
│   │   ├── productos/   # CRUD productos
│   │   ├── categorias/  # CRUD categorías
│   │   ├── pedidos/     # Gestión de pedidos
│   │   ├── facturacion/ # Comprobantes
│   │   └── reportes/    # Estadísticas
│   └── uploads/         # Archivos subidos
├── frontend/            # App Next.js
│   ├── src/
│   │   ├── app/         # App Router
│   │   ├── components/  # Componentes React
│   │   ├── context/     # Context API
│   │   └── utils/       # Utilidades
│   └── public/          # Recursos estáticos
└── railway.json         # Configuración Railway
```

## 🐛 Troubleshooting

### Error de conexión a la base de datos
- Verifica que `DATABASE_URL` esté correctamente configurada
- Asegúrate de que MySQL esté ejecutándose
- Ejecuta `npx prisma generate` y `npx prisma migrate deploy`

### Error CORS en producción
- Verifica que `FRONTEND_URL` en el backend coincida con el dominio del frontend
- Asegúrate de usar HTTPS en producción

### Imágenes no se cargan
- Verifica que la carpeta `uploads` tenga permisos de escritura
- En Railway, considera usar un servicio de almacenamiento externo (S3, Cloudinary)

## 📄 Licencia

MIT

## 👨‍💻 Autor

Delicias Bakery Team

---

¿Necesitas ayuda? Abre un issue en GitHub.
