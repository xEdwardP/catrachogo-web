<p align="center">
  <img src="public/logo_with_text.png" alt="CatrachoGo" width="280" />
</p>

<p align="center">
  Ride-hailing hecho para Honduras — pide un viaje, conduce y genera ingresos, o administra la plataforma, todo desde el navegador.
</p>

## Qué es CatrachoGo

**CatrachoGo** es el frontend web de una plataforma de ride-hailing (tipo Uber/InDriver) pensada para Honduras. Cubre los tres roles de la plataforma — pasajero, conductor y administrador — con autenticación por contraseña o Google, wallet con recargas por PayPal, seguimiento de viajes en tiempo real sobre Google Maps, y un panel de administración con dashboard, gestión de conductores, viajes, retiros y zonas tarifarias.

Este repositorio consume la API de [`catrachogo-api`](https://github.com/xEdwardP/catrachogo-api) (NestJS + PostgreSQL/PostGIS) — no la modifica. Ambos proyectos corren en paralelo en desarrollo.

Proyecto académico del equipo "Los Inges".

## Stack técnico

- **React 18 + Vite + TypeScript**
- **Tailwind CSS v4**
- **React Router v7**
- **`@vis.gl/react-google-maps`** — mapa, autocompletado de direcciones (Places API) y geocoding
- **`@paypal/react-paypal-js`** — recargas de wallet
- **`@react-oauth/google`** — inicio de sesión con Google
- **Cloudinary** (unsigned upload) — fotos de perfil y documentos de conductor
- **`axios`** — cliente HTTP centralizado
- **`sonner`** — notificaciones/errores de negocio
- **`lucide-react`** — íconos

## Capturas de pantalla

| Landing page | Inicio de sesión |
|---|---|
| ![Landing](screenshots/landing.png) | ![Login](screenshots/login.png) |

| Pasajero — solicitar viaje | Conductor — panel principal |
|---|---|
| ![Pasajero](screenshots/passenger-request.png) | ![Conductor](screenshots/driver-home.png) |

| Administración — dashboard |
|---|
| ![Dashboard admin](screenshots/admin-dashboard.png) |

## Requisitos previos

- **Node.js 20+**
- [`catrachogo-api`](https://github.com/xEdwardP/catrachogo-api) corriendo en paralelo (por defecto en `http://localhost:3000`) — este frontend no funciona sin la API activa.
- Cuentas/API keys propias para: Google Cloud (Maps + Sign-In), PayPal (sandbox), Cloudinary (unsigned upload preset).

## Instalación

```bash
git clone https://github.com/xEdwardP/catrachogo-web.git
cd catrachogo-web
npm install
cp .env.example .env
```

Completa `.env` con tus propias credenciales:

| Variable | De dónde se obtiene |
|---|---|
| `VITE_API_URL` | URL donde corre `catrachogo-api` (`http://localhost:3000` en local) |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Cloud Console → Maps JavaScript API + Places API (New) |
| `VITE_GOOGLE_CLIENT_ID` | Google Cloud Console → Google Identity Services (OAuth Client ID) |
| `VITE_CLOUDINARY_CLOUD_NAME` | Panel de Cloudinary → nombre de tu cloud |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Cloudinary → Settings → Upload → un preset *unsigned* |
| `VITE_PAYPAL_CLIENT_ID` | PayPal Developer Dashboard → app sandbox |

## Desarrollo

```bash
npm run dev
```

Abre `http://localhost:5173`. Requiere `catrachogo-api` corriendo (ver su propio README para instrucciones).

## Build de producción

```bash
npm run build    # tsc -b && vite build → genera dist/
npm run preview  # sirve el build localmente para probarlo
```

Otros comandos útiles: `npm run lint`.

## Estructura de carpetas

```
src/
├── api/          # cliente HTTP y funciones por dominio (trips, drivers, wallet, admin...)
├── components/   # componentes reutilizables (layouts, inputs, modales)
├── context/      # AuthProvider y contexto de sesión
├── hooks/        # hooks compartidos (polling, posición suavizada del mapa...)
├── pages/        # una pantalla por archivo, organizadas por flujo (pasajero/conductor/admin)
├── types/        # tipos compartidos entre api/ y pages/
└── utils/        # helpers (rutas por rol, etc.)
docs/             # contexto del proyecto para desarrollo asistido (no se sube al build)
```

## Repositorio relacionado

- [`catrachogo-api`](https://github.com/xEdwardP/catrachogo-api) — backend NestJS + PostgreSQL/PostGIS. Es requisito para correr este frontend.

## Créditos

Desarrollado por **Edward Pineda** ([@xEdwardP](https://github.com/xEdwardP))
