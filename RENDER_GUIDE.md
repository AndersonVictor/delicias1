# 🚀 GUÍA RÁPIDA: Desplegar en Render

## ✅ Cambios Importantes

He actualizado tu proyecto para usar **PostgreSQL** en lugar de MySQL, porque:
- ✅ Render ofrece PostgreSQL gratis
- ✅ MySQL en Render requiere plan de pago
- ✅ PostgreSQL es más común en plataformas cloud

---

## 📋 PASOS PARA DESPLEGAR EN RENDER

### Opción 1: Usar Blueprint (RECOMENDADO - 1 Click)

1. En Render, busca la opción **"New +"** → **"Blueprint"**
2. Conecta tu repo: `AndersonVictor/delicias1`
3. Render detectará el archivo `render.yaml`
4. Click en **"Apply"**
5. Espera 10-15 minutos
6. ¡Listo! 🎉

### Opción 2: Desplegar Manualmente (Paso a Paso)

Si no ves la opción Blueprint, sigue estos pasos:

#### PASO 1: Crear Base de Datos

1. En el dashboard de Render, click **"New +"**
2. Selecciona **"PostgreSQL"**
3. Configuración:
   - **Name:** `delicias-db`
   - **Database:** `delicias_bakery`
   - **User:** (automático)
   - **Region:** Oregon (US West)
   - **Plan:** **Free**
4. Click **"Create Database"**
5. Espera 2 minutos
6. **COPIA** la **Internal Database URL** (la usarás después)

---

#### PASO 2: Desplegar Backend

1. Click **"New +"** → **"Web Service"**
2. Conecta GitHub → Selecciona `AndersonVictor/delicias1`
3. Configuración:

| Campo | Valor |
|-------|-------|
| **Name** | `delicias-backend` |
| **Region** | Oregon (US West) |
| **Branch** | `main` |
| **Root Directory** | `delicias/backend` |
| **Runtime** | Node |
| **Build Command** | `npm install && npx prisma generate && npm run build` |
| **Start Command** | `npm run start:prod` |
| **Plan** | Free |

4. **Variables de Entorno** (click "Advanced" o "Environment"):

```bash
DATABASE_URL=internal-database-url-que-copiaste-antes
JWT_SECRET=mi-secreto-super-seguro-123456789
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://delicias-frontend.onrender.com
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=tu_api_secret
RUC_EMISOR=20123456789
RAZON_SOCIAL_EMISOR=Delicias Bakery SAC
```

**Importante**: Debes crear una cuenta gratuita en [cloudinary.com](https://cloudinary.com) para obtener las credenciales de Cloudinary. Esto es necesario para el almacenamiento persistente de archivos de facturación.

5. Click **"Create Web Service"**
6. Espera 10-15 minutos al primer deploy

---

#### PASO 3: Ejecutar Migraciones (IMPORTANTE)

Después del primer deploy del backend:

1. Ve al Dashboard de `delicias-backend`
2. Click en **"Shell"** (en el menú lateral)
3. Ejecuta estos comandos:

```bash
# Aplicar migraciones
npx prisma migrate deploy

# Crear usuario admin
npm run seed:admin
```

4. Anota las credenciales del admin que se muestren

---

#### PASO 4: Desplegar Frontend

1. Click **"New +"** → **"Web Service"**
2. Conecta el mismo repo: `AndersonVictor/delicias1`
3. Configuración:

| Campo | Valor |
|-------|-------|
| **Name** | `delicias-frontend` |
| **Region** | Oregon (US West) |
| **Branch** | `main` |
| **Root Directory** | `delicias/frontend` |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start` |
| **Plan** | Free |

4. **Variables de Entorno:**

```bash
NEXT_PUBLIC_API_URL=https://delicias-backend.onrender.com/api
NEXT_PUBLIC_APP_NAME=Delicias Bakery
NEXT_PUBLIC_APP_URL=https://delicias-frontend.onrender.com
NODE_ENV=production
```

5. Click **"Create Web Service"**
6. Espera 5-10 minutos

---

#### PASO 5: Actualizar CORS del Backend

1. Ve al Dashboard de `delicias-backend`
2. Click en **"Environment"**
3. Actualiza la variable `FRONTEND_URL` con la URL real de tu frontend:
   - Por ejemplo: `https://delicias-frontend.onrender.com`
4. Guarda y espera al redeploy automático

---

## 🎉 ¡Verificar que Todo Funciona!

1. **Backend API:** 
   - URL: `https://delicias-backend.onrender.com/api/docs`
   - Deberías ver la documentación Swagger

2. **Frontend:**
   - URL: `https://delicias-frontend.onrender.com`
   - Deberías ver la página de inicio

3. **Login Admin:**
   - Ve a: `https://delicias-frontend.onrender.com/admin/login`
   - Usa las credenciales que obtuviste del seed

---

## ⚠️ Notas Importantes

### Plan Free de Render:
- ✅ 750 horas gratis al mes (suficiente para 1 servicio 24/7)
- ⚠️ Los servicios se duermen después de 15 minutos de inactividad
- ⚠️ El primer request después de dormir tarda 30-60 segundos
- ✅ PostgreSQL gratis incluido (256 MB)

### Para evitar que se duerma:
- Usa un servicio como [UptimeRobot](https://uptimerobot.com) (gratis)
- Configura un ping cada 10 minutos a tu API

---

## 🐛 Solución de Problemas

### Error: "Build failed"
```bash
# Verifica que Root Directory esté correcto:
# Backend: delicias/backend
# Frontend: delicias/frontend
```

### Error: "Prisma schema not found"
```bash
# En el Shell del backend, ejecuta:
npx prisma generate
npx prisma migrate deploy
```

### Error: "Cannot connect to database"
```bash
# Verifica que DATABASE_URL use la Internal Database URL
# Debe empezar con: postgresql://
```

### Error: "CORS error"
```bash
# Actualiza FRONTEND_URL en el backend con la URL exacta del frontend
# Debe ser: https://tu-frontend.onrender.com (sin / al final)
```

### El frontend no carga datos
```bash
# Verifica NEXT_PUBLIC_API_URL en el frontend
# Debe ser: https://tu-backend.onrender.com/api (con /api al final)
```

---

## 🔗 URLs de tu Aplicación

Después del deploy, tendrás:

| Servicio | URL |
|----------|-----|
| **Frontend** | `https://delicias-frontend.onrender.com` |
| **Backend API** | `https://delicias-backend.onrender.com/api` |
| **Swagger Docs** | `https://delicias-backend.onrender.com/api/docs` |
| **Database** | Internal only (no público) |

---

## 💡 Próximos Pasos

1. ✅ Personaliza tu dominio (opcional, $1/mes)
2. ✅ Configura UptimeRobot para mantener el servicio activo
3. ✅ Considera usar Cloudinary para las imágenes
4. ✅ Configura backups de la base de datos

---

¿Problemas? Revisa los logs en el Dashboard de cada servicio.
