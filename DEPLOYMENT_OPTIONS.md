# 🚀 Opciones de Despliegue para Delicias Bakery

Si Railway te está dando problemas, aquí tienes las **mejores alternativas** probadas y fáciles de usar.

---

## 1. 🟢 **Render.com** (MÁS RECOMENDADO)

### Por qué es la mejor opción:
- ✅ **Setup automático** desde GitHub
- ✅ **Base de datos MySQL gratis** incluida
- ✅ **Menos errores** que otras plataformas
- ✅ **SSL automático**
- ✅ **Auto-deploy** en cada push
- ✅ **Interface muy intuitiva**

### Pasos para desplegar:

#### 1. Crear cuenta
- Ve a [render.com](https://render.com)
- Regístrate con GitHub

#### 2. Conectar repositorio
- Click en "New +"
- Selecciona "Blueprint"
- Conecta tu repo: `AndersonVictor/delicias1`
- Render detectará automáticamente el archivo `render.yaml`

#### 3. Configurar variables
Render leerá el archivo `render.yaml` y configurará:
- ✅ Backend (NestJS)
- ✅ Frontend (Next.js)
- ✅ Base de datos MySQL

#### 4. Desplegar
- Click en "Apply"
- Espera 5-10 minutos
- ¡Listo! 🎉

#### 5. Ejecutar migraciones (una sola vez)
- Ve al Dashboard de tu backend
- Click en "Shell"
- Ejecuta:
```bash
cd delicias/backend
npx prisma migrate deploy
npm run seed:admin
```

**URLs automáticas:**
- Backend: `https://delicias-backend.onrender.com`
- Frontend: `https://delicias-frontend.onrender.com`

---

## 2. 🔵 **Vercel (Frontend) + Railway/Render (Backend)**

### Mejor para:
- Frontend Next.js (Vercel es experto en Next.js)
- Backend separado en otra plataforma

### Setup Frontend en Vercel:

1. Ve a [vercel.com](https://vercel.com)
2. Importa tu repo de GitHub
3. Configuración:
   - **Root Directory**: `delicias/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

4. Variables de entorno:
```bash
NEXT_PUBLIC_API_URL=https://tu-backend.onrender.com/api
NEXT_PUBLIC_APP_NAME=Delicias Bakery
```

5. Deploy automático ✅

### Setup Backend en Render (igual que arriba)

---

## 3. 🟣 **Heroku** (Clásico y confiable)

### Por qué usarlo:
- ✅ Muy estable
- ✅ Documentación extensa
- ⚠️ Ya no tiene plan gratuito ($5/mes por dyno)

### Setup con Heroku:

#### 1. Instalar Heroku CLI
```bash
brew tap heroku/brew && brew install heroku
```

#### 2. Login
```bash
heroku login
```

#### 3. Crear apps
```bash
# Backend
heroku create delicias-backend

# Frontend
heroku create delicias-frontend

# Base de datos
heroku addons:create jawsdb:kitefin -a delicias-backend
```

#### 4. Configurar variables (Backend)
```bash
heroku config:set JWT_SECRET=tu-secreto-super-seguro -a delicias-backend
heroku config:set NODE_ENV=production -a delicias-backend
heroku config:set FRONTEND_URL=https://delicias-frontend.herokuapp.com -a delicias-backend
```

#### 5. Configurar variables (Frontend)
```bash
heroku config:set NEXT_PUBLIC_API_URL=https://delicias-backend.herokuapp.com/api -a delicias-frontend
```

#### 6. Crear Procfiles

**Backend Procfile:**
```bash
echo "web: cd delicias/backend && npm run start:prod" > Procfile
```

**Frontend Procfile (crear en otra rama):**
```bash
echo "web: cd delicias/frontend && npm run start" > Procfile
```

#### 7. Deploy
```bash
# Backend
git push heroku main

# Frontend (necesitas crear subtree)
git subtree push --prefix delicias/frontend heroku-frontend main
```

---

## 4. 🟠 **DigitalOcean App Platform**

### Por qué:
- ✅ Muy rápido
- ✅ $5/mes (precio fijo)
- ✅ Base de datos incluida
- ✅ Interface clara

### Setup:

1. Ve a [digitalocean.com](https://digitalocean.com/products/app-platform)
2. Conecta GitHub
3. Selecciona tu repo
4. Configuración automática detectada
5. Agrega base de datos MySQL ($15/mes)
6. Deploy

---

## 5. 🔴 **Fly.io** (Alternativa moderna)

### Por qué:
- ✅ Muy rápido (edge network)
- ✅ Plan gratuito disponible
- ✅ Buena documentación
- ⚠️ Requiere tarjeta de crédito

### Setup:

1. Instala Fly CLI:
```bash
curl -L https://fly.io/install.sh | sh
```

2. Login:
```bash
flyctl auth login
```

3. Crea apps:
```bash
# Backend
cd delicias/backend
flyctl launch --name delicias-backend

# Frontend
cd ../frontend
flyctl launch --name delicias-frontend
```

4. Deploy:
```bash
flyctl deploy
```

---

## 📊 Comparación Rápida

| Plataforma | Facilidad | Precio | Base de Datos | Auto-deploy |
|------------|-----------|--------|---------------|-------------|
| **Render** | ⭐⭐⭐⭐⭐ | Gratis | ✅ MySQL gratis | ✅ |
| **Vercel** | ⭐⭐⭐⭐⭐ | Gratis | ❌ | ✅ |
| **Railway** | ⭐⭐⭐⭐ | Gratis | ✅ | ✅ |
| **Heroku** | ⭐⭐⭐⭐ | $5/mes | ✅ Extra | ✅ |
| **DigitalOcean** | ⭐⭐⭐ | $5/mes | ✅ Extra | ✅ |
| **Fly.io** | ⭐⭐⭐ | Gratis | ✅ Extra | ✅ |

---

## 🎯 Mi Recomendación Personal

### Para ti, te recomiendo:

**Opción 1 (Más fácil):**
```
Frontend: Vercel (gratis, especializado en Next.js)
Backend: Render (gratis, con MySQL incluido)
```

**Opción 2 (Todo en uno):**
```
Todo: Render (gratis, archivo render.yaml ya incluido)
```

**Opción 3 (Si tienes $5):**
```
Todo: Heroku (muy estable y confiable)
```

---

## 🚨 Solución de Problemas Comunes

### Error: "Build failed"
- Verifica que el **Root Directory** esté correcto
- Para backend: `delicias/backend`
- Para frontend: `delicias/frontend`

### Error: "Database connection"
- Verifica la variable `DATABASE_URL`
- Debe incluir: `mysql://user:pass@host:port/database`

### Error: "Module not found"
- Ejecuta `npm install` antes de `npm run build`
- Verifica que `node_modules` no esté en `.gitignore`

### Error: Prisma
- Siempre ejecuta `npx prisma generate` antes del build
- Verifica que `postinstall` script exista en `package.json`

### Error: "Cloudinary upload failed"
- Verifica que las variables de Cloudinary estén configuradas correctamente
- Asegúrate de tener una cuenta gratuita en [cloudinary.com](https://cloudinary.com)
- Verifica que `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET` estén configuradas

---

## 🔧 Configuración de Cloudinary (Requerido para Facturas)

El sistema usa **Cloudinary** para almacenar archivos PDF, XML e imágenes de comprobantes de forma persistente.

### Pasos para configurar Cloudinary:

1. **Crear cuenta gratuita**:
   - Ve a [cloudinary.com](https://cloudinary.com)
   - Regístrate con tu email (plan gratuito: 25 GB)

2. **Obtener credenciales**:
   - En tu Dashboard, ve a "Settings" → "API Keys"
   - Copia tu **Cloud Name**, **API Key** y **API Secret**

3. **Configurar variables de entorno en tu plataforma**:

**Para Render/Vercel/Railway/Heroku**, agrega estas variables al backend:

```bash
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=tu_api_secret
RUC_EMISOR=20123456789
RAZON_SOCIAL_EMISOR=Delicias Bakery SAC
```

**Nota**: Las variables `RUC_EMISOR` y `RAZON_SOCIAL_EMISOR` son para los datos del emisor en las facturas.

---

## ✅ Siguiente Paso Recomendado

**Prueba Render primero** porque:
1. Ya tienes el archivo `render.yaml` configurado ✅
2. Es gratis ✅
3. Incluye base de datos ✅
4. Setup en 5 minutos ✅

**Instrucciones rápidas:**
1. Ve a [render.com](https://render.com)
2. Click "New +" → "Blueprint"
3. Conecta tu repo
4. Click "Apply"
5. Espera 10 minutos
6. ¡Listo! 🎉

---

¿Necesitas ayuda con alguna plataforma específica? ¡Dímelo!
