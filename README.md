<p align="center">
  <img src="public/logo_with_text.png" alt="CatrachoGo" width="300" />
</p>

<p align="center">
  <strong>Ride-hailing built for Honduras — request a ride, drive and earn, or run the platform, all from the browser.</strong><br />
  <em>Ride-hailing hecho para Honduras — pide un viaje, conduce y genera ingresos, o administra la plataforma, todo desde el navegador.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Google_Maps-Platform-4285F4?style=flat-square&logo=googlemaps&logoColor=white" alt="Google Maps" />
  <img src="https://img.shields.io/badge/PayPal-Checkout-00457C?style=flat-square&logo=paypal&logoColor=white" alt="PayPal" />
</p>

<p align="center">
  <a href="#-english">🇺🇸 English</a> · <a href="#-español">🇭🇳 Español</a>
</p>

---

## Screenshots · Capturas de pantalla

| Landing page · Página de inicio | Sign in · Inicio de sesión |
|---|---|
| ![Landing](screenshots/landing.png) | ![Login](screenshots/login.png) |

| Passenger — request a trip · Pasajero — solicitar viaje | Driver — main panel · Conductor — panel principal |
|---|---|
| ![Passenger](screenshots/passenger-request.png) | ![Driver](screenshots/driver-home.png) |

| Admin — dashboard · Administración — dashboard |
|---|
| ![Admin dashboard](screenshots/admin-dashboard.png) |

---

# 🇺🇸 English

## Overview

**CatrachoGo** is the web frontend of a ride-hailing platform (think Uber/InDriver) designed for Honduras. It covers the three roles of the platform — **passenger**, **driver** and **administrator** — with password or Google authentication, a wallet with PayPal top-ups, live trip tracking over Google Maps, and a full admin panel with dashboard, driver management, trips, withdrawals, fare zones and incident reports.

On desktop screens, the passenger and driver views use a real web-app layout (information panel next to the map, table-style lists) instead of a stretched mobile app; below the desktop breakpoint the mobile design stays untouched.

This repository consumes the [`catrachogo-api`](https://github.com/xEdwardP/catrachogo-api) API (NestJS + PostgreSQL/PostGIS) — it never modifies it. Both projects run side by side in development.

Academic project by the "Los Inges" team.

## Features

### Passenger

- Request a trip with address autocomplete (Google Places), an estimated fare shown **before** confirming, and the route drawn on the map.
- Favorite addresses (home, work, other) and recent destinations, available from the home screen.
- Live tracking of the ongoing trip with the driver's position and contact details once accepted.
- End a trip before reaching the destination, with a prorated recalculated fare.
- Cancel a trip (with confirmation and reason) both while waiting for a driver and after one is assigned.
- Report a problem or a specific driver from the history or the active trip.
- Rate the driver when the trip finishes.
- Wallet with PayPal top-up and a fully translated transaction history.
- Editable profile (name, phone, photo) and a help/support section with FAQ.
- In-app notifications for trip events (accepted, started, completed or cancelled).

### Driver

- Go online/offline to receive trips (blocked until an administrator approves the documents), a state kept in sync with the backend while navigating between screens.
- Receive and answer incoming requests within a countdown window.
- Mark arrival at the pickup point and cancel for passenger no-show after a grace period, charging the passenger.
- Earnings-and-withdrawals-only wallet (no top-up — that is passenger-exclusive) and PayPal withdrawal requests.
- Same profile, support and incident reporting as the passenger, plus notifications when a withdrawal is resolved or the verification status changes.

### Administration

- Dashboard with platform KPIs (active trips, revenue for the day, available drivers, pending withdrawals and pending drivers) and a completed-trips-per-day chart, all computed in the backend through a single aggregated endpoint.
- Management of drivers (document approval/rejection), trips, fare zones, withdrawals and incident reports submitted by passengers — withdrawals and reports have a detail modal before resolving them.
- Its own notification center inside the panel.

### Legal

- Terms of use, Privacy policy and Licenses pages, linked from the footer and the support section.

## Tech stack

| Area | Choice |
|---|---|
| Framework | **React 19** + **Vite** + **TypeScript** |
| Styling | **Tailwind CSS v4** (`@theme` design tokens, class-based dark mode) |
| Routing | **React Router v7** |
| Maps | **`@vis.gl/react-google-maps`** — map, address autocomplete (Places API New) and geocoding |
| Payments | **`@paypal/react-paypal-js`** — wallet top-ups |
| Auth | **`@react-oauth/google`** — Google Sign-In (ID token verified by the backend) |
| Media | **Cloudinary** unsigned upload — profile photos and driver documents |
| HTTP | **`axios`**, centralized in a single client module |
| Feedback | **`sonner`** — toasts for business errors |
| Icons | **`lucide-react`** |
| Quality | **ESLint** (flat config) + type-checking on build (`tsc -b`) |

## Architecture

### Folder structure

```
src/
├── api/          # HTTP client + one module per domain (trips, drivers, wallet, admin…)
│                 # plus *ErrorMessages.ts files mapping API status codes → Spanish copy
├── components/   # reusable components (layouts, inputs, modals, providers)
├── context/      # AuthProvider (session) and ThemeProvider (light/dark)
├── data/         # static content (legal documents)
├── hooks/        # shared hooks (polling, geolocation, directions, smoothed position…)
├── pages/        # one screen per file, organized by flow (passenger/driver/admin)
├── types/        # shared types between api/ and pages/
└── utils/        # helpers (role routes, labels, fares, phone formatting…)
docs/             # project context for assisted development (not part of the build)
public/           # logo, favicon and static icons
screenshots/      # images used by this README
```

### How it talks to the backend

- Every request goes through `src/api/client.ts` — an axios instance with two interceptors: one that attaches `Authorization: Bearer <jwt>` from storage, and one that clears the session and emits a `session-expired` event on `401`.
- In development the client hits `/backend-api`, proxied by Vite to `VITE_API_URL` (see [vite.config.ts](vite.config.ts)) to avoid CORS issues. In production it calls `VITE_API_URL` directly.
- API shapes are never renamed: the English/camelCase contract stays as-is, and the mapping to Spanish UI copy happens in the presentation layer.

### Real-time strategy

There are no websockets — live behavior is built on short polling with `usePolling`:

| What | Interval |
|---|---|
| Driver sends its position while online | 5 s |
| Driver polls for incoming requests | 4 s |
| Trip detail (both sides) | 4 s |
| Driver position during an active trip | 4 s |
| Unread notification count | 45 s |

Driver positions are passed through `useSmoothedPosition` and a plausibility check, so a bad GPS reading does not teleport the marker across the map.

### Routing and access control

`ProtectedRoute` guards every private route by **role** (`passenger`, `driver`, `admin`) and, where needed, by `requirePhone` — a user who signed in with Google without a phone number is redirected to `/complete-profile` before being allowed to request a trip.

## Business rules the frontend must respect

These are enforced by the backend; the frontend anticipates them in the UX so the user never sees a raw error. All of them surface through `sonner` toasts.

| # | Rule | API response | UX handling |
|---|---|---|---|
| 1 | Phone number required to request a trip | `400` on `POST /trips` | Redirect to complete the profile before allowing the request |
| 2 | Insufficient wallet balance | `402` on `POST /trips` | Show the estimated fare (`POST /trips/estimate`) before confirming |
| 3 | Phone numbers are only revealed while the trip is `accepted` or `in_progress` | `GET /trips/:id` | Contact details rendered conditionally, never assumed present |
| 4 | A driver cannot go online without admin approval | `403` on `PATCH /drivers/availability` | Explain the "under review" state instead of showing the error |
| 5 | Driver documents must be Cloudinary URLs | `400` | Uploads go straight to Cloudinary; only the resulting URL is sent |
| 6 | Race condition when accepting a trip | `409` on `PATCH /trips/:id/accept` | Graceful "another driver already took it" message |
| 7 | Rate limiting on login/register (5/min per IP) | `429` | Clear, specific message |

## Design system

The palette lives as Tailwind v4 tokens in [src/index.css](src/index.css):

| Use | Token | Value |
|---|---|---|
| Primary (buttons, logo, brand accents) | `--color-brand` | `#E8532E` |
| Primary hover/pressed | `--color-brand-dark` | `#D1471F` |
| Highlighted surfaces, informational chips | `--color-brand-pale` | `#FDEAE3` |
| Success, confirmations, positive balance | `--color-success` | `#158059` |
| Success hover/pressed | `--color-success-dark` | `#0F6647` |
| General screen background | `--color-cream` | `#F6F1EC` |

Dark mode is class-based (`@custom-variant dark`). The user's choice is stored in `localStorage` under `catrachogo_theme` and applied by an inline script in [index.html](index.html) **before** first paint, so there is no flash of the wrong theme; with no stored choice it follows `prefers-color-scheme`.

Language convention: **all code in English** (variables, functions, components, files, commits), **all user-visible text in Spanish** — that is the product's real audience.

## Getting started

### Prerequisites

- **Node.js 20+**
- [`catrachogo-api`](https://github.com/xEdwardP/catrachogo-api) running in parallel (defaults to `http://localhost:3000`) — this frontend does not work without the API up.
- Your own accounts/API keys for: Google Cloud (Maps + Sign-In), PayPal (sandbox), Cloudinary (unsigned upload preset).

### Installation

```bash
git clone https://github.com/xEdwardP/catrachogo-web.git
cd catrachogo-web
npm install
cp .env.example .env
```

### Environment variables

Fill `.env` with your own credentials:

| Variable | Where to get it |
|---|---|
| `VITE_API_URL` | URL where `catrachogo-api` runs (`http://localhost:3000` locally) |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Cloud Console → Maps JavaScript API + Places API (New) |
| `VITE_GOOGLE_CLIENT_ID` | Google Cloud Console → Google Identity Services (OAuth Client ID) |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary dashboard → your cloud name |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Cloudinary → Settings → Upload → an **unsigned** preset |
| `VITE_PAYPAL_CLIENT_ID` | PayPal Developer Dashboard → sandbox app |
| `VITE_SUPPORT_EMAIL` | Contact email shown in the support section |
| `VITE_ENABLE_DEMO_MODE` | `"true"` simulates driver movement during a trip — for presentations only, keep `"false"` |

> **Note:** the Maps key must be restricted by domain in Google Cloud Console, and the Places API used is the **New** one — `PlaceAutocompleteElement`, not the legacy `Autocomplete`.

### Development

```bash
npm run dev
```

Open `http://localhost:5173`. Requires `catrachogo-api` running (see its own README).

### Production build

```bash
npm run build    # tsc -b && vite build → generates dist/
npm run preview  # serves the build locally to test it
```

### Available scripts

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server with the `/backend-api` proxy |
| `npm run build` | Type-checks (`tsc -b`) and builds to `dist/` |
| `npm run preview` | Serves `dist/` locally |
| `npm run lint` | Runs ESLint over the whole project |

## Deployment

The project deploys as a static SPA. [vercel.json](vercel.json) rewrites every route to `index.html` so client-side routing works on refresh and deep links.

Before deploying, set the same `VITE_*` variables in the hosting provider's environment, and remember that the production build calls `VITE_API_URL` **directly** — the dev proxy does not exist there, so the API must allow the frontend's origin via CORS.

## Project documentation

The `docs/` folder is the project's source of truth for assisted development:

| File | Content |
|---|---|
| `proyecto-ridehailing.md` | Full scope, business rules and conventions |
| `api-contract-catrachogo.md` | Complete API contract (routes, bodies, responses) |
| `erd-catrachogo.mermaid` | Data model |
| `wireframes-especificacion-web.md` | Screen-by-screen specification |
| `sprints-catrachogo-web.md` | Single log of every sprint: what was planned and what was actually built |
| `manual-testing-checklist.md` | Manual test checklist against the real backend |
| `backend-changes-needed.md` | Live list of backend gaps/bugs detected from this repo |
| `backend-specs/` | Design specs for backend changes originated in a sprint of this repo |
| `mobile-specs/` | Specs shared with the `catrachogo-mobile` app |
| `presentation-guide.md` | Demo script for presenting the project |

## Working methodology

The project is built in **sprints**, each documented before writing code: number, branch name (`feature/<module>`), list of steps, and a suggested commit message. Branch flow is `main` → `develop` → `feature/*`, one module per branch so anything can be reviewed or reverted in isolation. Every sprint is tested manually against the real backend before being considered done. Commits follow **Conventional Commits** in English.

## Related repositories

- [`catrachogo-api`](https://github.com/xEdwardP/catrachogo-api) — NestJS + PostgreSQL/PostGIS backend. Required to run this frontend.
- [`catrachogo-mobile`](https://github.com/xEdwardP/catrachogo-mobile) — native app (React Native + Expo) for the three roles, against the same backend.

## Credits

Developed by **Edward Pineda** ([@xEdwardP](https://github.com/xEdwardP)).

---

# 🇭🇳 Español

## Qué es CatrachoGo

**CatrachoGo** es el frontend web de una plataforma de ride-hailing (tipo Uber/InDriver) pensada para Honduras. Cubre los tres roles de la plataforma — **pasajero**, **conductor** y **administrador** — con autenticación por contraseña o Google, wallet con recargas por PayPal, seguimiento de viajes en tiempo real sobre Google Maps, y un panel de administración con dashboard, gestión de conductores, viajes, retiros, zonas tarifarias y reportes de incidencias.

En pantallas de escritorio, las vistas de pasajero y conductor usan un layout de aplicación web real (panel de información junto al mapa, listas tipo tabla) en vez de una app móvil estirada; por debajo del breakpoint de escritorio el diseño mobile se mantiene sin cambios.

Este repositorio consume la API de [`catrachogo-api`](https://github.com/xEdwardP/catrachogo-api) (NestJS + PostgreSQL/PostGIS) — no la modifica. Ambos proyectos corren en paralelo en desarrollo.

Proyecto académico del equipo "Los Inges".

## Funcionalidades

### Pasajero

- Solicitar viaje con autocompletado de direcciones (Google Places), tarifa estimada **antes** de confirmar, y ruta trazada sobre el mapa.
- Direcciones favoritas (casa, trabajo, otro) y destinos recientes, disponibles desde la pantalla de inicio.
- Seguimiento del viaje en curso con la ubicación del conductor y datos de contacto una vez aceptado.
- Terminar un viaje antes de llegar al destino, con tarifa recalculada de forma prorrateada.
- Cancelar un viaje (con confirmación y motivo) tanto en espera de conductor como ya con conductor asignado.
- Reportar un problema o a un conductor específico desde el historial o el viaje activo.
- Calificar al conductor al finalizar el viaje.
- Wallet con recarga vía PayPal e historial de movimientos traducido.
- Perfil editable (nombre, teléfono, foto) y sección de ayuda/soporte con FAQ.
- Notificaciones dentro de la app para eventos del viaje (aceptado, iniciado, completado o cancelado).

### Conductor

- Activarse/desactivarse para recibir viajes (bloqueado hasta que el administrador aprueba sus documentos), estado que se mantiene sincronizado con el backend al navegar entre pantallas.
- Recibir y responder solicitudes entrantes con ventana de tiempo límite.
- Marcar llegada al punto de recogida y cancelar por no-show del pasajero tras un periodo de gracia, con cargo aplicado al pasajero.
- Wallet de solo ganancias/retiros (sin opción de recarga, exclusiva de pasajeros) y solicitud de retiro vía PayPal.
- Mismo perfil, soporte y reporte de incidencias que el pasajero, más notificaciones cuando se resuelve un retiro o cambia su estado de verificación.

### Administración

- Dashboard con KPIs de la plataforma (viajes activos, ingresos del día, conductores disponibles, retiros y conductores pendientes) y gráfico de viajes completados por día, calculados en el backend con un único endpoint agregado.
- Gestión de conductores (aprobación/rechazo de documentos), viajes, zonas tarifarias, retiros y reportes de incidencias enviados por pasajeros — retiros y reportes cuentan con una vista modal de detalle antes de resolverlos.
- Centro de notificaciones propio en el panel.

### Legal

- Páginas de Términos de uso, Política de privacidad y Licencias, enlazadas desde el footer y la sección de soporte.

## Stack técnico

| Área | Elección |
|---|---|
| Framework | **React 19** + **Vite** + **TypeScript** |
| Estilos | **Tailwind CSS v4** (tokens de diseño con `@theme`, modo oscuro por clase) |
| Ruteo | **React Router v7** |
| Mapas | **`@vis.gl/react-google-maps`** — mapa, autocompletado de direcciones (Places API New) y geocoding |
| Pagos | **`@paypal/react-paypal-js`** — recargas de wallet |
| Auth | **`@react-oauth/google`** — inicio de sesión con Google (ID token verificado por el backend) |
| Multimedia | **Cloudinary** (unsigned upload) — fotos de perfil y documentos de conductor |
| HTTP | **`axios`**, centralizado en un único módulo cliente |
| Feedback | **`sonner`** — toasts para errores de negocio |
| Íconos | **`lucide-react`** |
| Calidad | **ESLint** (flat config) + verificación de tipos en el build (`tsc -b`) |

## Arquitectura

### Estructura de carpetas

```
src/
├── api/          # cliente HTTP + un módulo por dominio (trips, drivers, wallet, admin…)
│                 # más archivos *ErrorMessages.ts que mapean códigos de la API → texto en español
├── components/   # componentes reutilizables (layouts, inputs, modales, providers)
├── context/      # AuthProvider (sesión) y ThemeProvider (claro/oscuro)
├── data/         # contenido estático (documentos legales)
├── hooks/        # hooks compartidos (polling, geolocalización, rutas, posición suavizada…)
├── pages/        # una pantalla por archivo, organizadas por flujo (pasajero/conductor/admin)
├── types/        # tipos compartidos entre api/ y pages/
└── utils/        # helpers (rutas por rol, labels, tarifas, formato de teléfono…)
docs/             # contexto del proyecto para desarrollo asistido (no se sube al build)
public/           # logo, favicon e íconos estáticos
screenshots/      # imágenes usadas por este README
```

### Cómo se comunica con el backend

- Toda petición pasa por `src/api/client.ts` — una instancia de axios con dos interceptores: uno que adjunta `Authorization: Bearer <jwt>` desde el almacenamiento, y otro que limpia la sesión y emite un evento `session-expired` ante un `401`.
- En desarrollo el cliente apunta a `/backend-api`, que Vite proxea hacia `VITE_API_URL` (ver [vite.config.ts](vite.config.ts)) para evitar problemas de CORS. En producción llama directamente a `VITE_API_URL`.
- Los shapes de la API nunca se renombran: el contrato en inglés/camelCase se mantiene tal cual, y el mapeo al texto en español ocurre en la capa de presentación.

### Estrategia de tiempo real

No hay websockets — el comportamiento en vivo se construye con short polling mediante `usePolling`:

| Qué | Intervalo |
|---|---|
| El conductor envía su posición mientras está disponible | 5 s |
| El conductor consulta solicitudes entrantes | 4 s |
| Detalle del viaje (ambos lados) | 4 s |
| Posición del conductor durante un viaje activo | 4 s |
| Contador de notificaciones sin leer | 45 s |

Las posiciones del conductor pasan por `useSmoothedPosition` y una validación de plausibilidad, para que una lectura mala del GPS no teletransporte el marcador por el mapa.

### Ruteo y control de acceso

`ProtectedRoute` protege cada ruta privada por **rol** (`passenger`, `driver`, `admin`) y, donde aplica, por `requirePhone` — un usuario que entró con Google sin número de teléfono es redirigido a `/complete-profile` antes de poder pedir un viaje.

## Reglas de negocio que el frontend DEBE respetar

Están validadas en el backend; el frontend las anticipa en la UX para que el usuario nunca vea un error crudo. Todas se muestran con toasts de `sonner`.

| # | Regla | Respuesta de la API | Manejo en la UX |
|---|---|---|---|
| 1 | Teléfono obligatorio para pedir un viaje | `400` en `POST /trips` | Redirigir a completar el perfil antes de dejar pedir el viaje |
| 2 | Saldo insuficiente en el wallet | `402` en `POST /trips` | Mostrar la tarifa estimada (`POST /trips/estimate`) antes de confirmar |
| 3 | Los teléfonos solo se revelan con el viaje en `accepted` o `in_progress` | `GET /trips/:id` | Datos de contacto renderizados condicionalmente, nunca asumidos |
| 4 | El conductor no puede ponerse disponible sin aprobación del admin | `403` en `PATCH /drivers/availability` | Explicar el estado "en revisión" en vez de mostrar el error |
| 5 | Los documentos del conductor deben ser URLs de Cloudinary | `400` | La subida va directo a Cloudinary; solo se manda la URL resultante |
| 6 | Condición de carrera al aceptar un viaje | `409` en `PATCH /trips/:id/accept` | Mensaje amable de "ya fue tomado por otro conductor" |
| 7 | Rate limiting en login/register (5/min por IP) | `429` | Mensaje claro y específico |

## Identidad visual

La paleta vive como tokens de Tailwind v4 en [src/index.css](src/index.css):

| Uso | Token | Valor |
|---|---|---|
| Primario (botones, logo, acentos de marca) | `--color-brand` | `#E8532E` |
| Primario hover/presionado | `--color-brand-dark` | `#D1471F` |
| Superficies destacadas, chips informativos | `--color-brand-pale` | `#FDEAE3` |
| Éxito, confirmaciones, saldo positivo | `--color-success` | `#158059` |
| Éxito hover/presionado | `--color-success-dark` | `#0F6647` |
| Fondo general de pantallas | `--color-cream` | `#F6F1EC` |

El modo oscuro es por clase (`@custom-variant dark`). La elección del usuario se guarda en `localStorage` bajo `catrachogo_theme` y se aplica con un script inline en [index.html](index.html) **antes** del primer render, para que no haya destello del tema equivocado; sin elección guardada sigue a `prefers-color-scheme`.

Convención de idioma: **todo el código en inglés** (variables, funciones, componentes, archivos, commits), **todo el texto visible al usuario en español** — es la audiencia real del producto.

## Puesta en marcha

### Requisitos previos

- **Node.js 20+**
- [`catrachogo-api`](https://github.com/xEdwardP/catrachogo-api) corriendo en paralelo (por defecto en `http://localhost:3000`) — este frontend no funciona sin la API activa.
- Cuentas/API keys propias para: Google Cloud (Maps + Sign-In), PayPal (sandbox), Cloudinary (unsigned upload preset).

### Instalación

```bash
git clone https://github.com/xEdwardP/catrachogo-web.git
cd catrachogo-web
npm install
cp .env.example .env
```

### Variables de entorno

Completa `.env` con tus propias credenciales:

| Variable | De dónde se obtiene |
|---|---|
| `VITE_API_URL` | URL donde corre `catrachogo-api` (`http://localhost:3000` en local) |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Cloud Console → Maps JavaScript API + Places API (New) |
| `VITE_GOOGLE_CLIENT_ID` | Google Cloud Console → Google Identity Services (OAuth Client ID) |
| `VITE_CLOUDINARY_CLOUD_NAME` | Panel de Cloudinary → nombre de tu cloud |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Cloudinary → Settings → Upload → un preset **unsigned** |
| `VITE_PAYPAL_CLIENT_ID` | PayPal Developer Dashboard → app sandbox |
| `VITE_SUPPORT_EMAIL` | Correo de contacto que se muestra en la sección de soporte |
| `VITE_ENABLE_DEMO_MODE` | `"true"` simula el movimiento del conductor durante un viaje — solo para presentaciones, dejar en `"false"` |

> **Nota:** la key de Maps debe estar restringida por dominio en Google Cloud Console, y la Places API que se usa es la **New** — `PlaceAutocompleteElement`, no el `Autocomplete` legacy.

### Desarrollo

```bash
npm run dev
```

Abre `http://localhost:5173`. Requiere `catrachogo-api` corriendo (ver su propio README para instrucciones).

### Build de producción

```bash
npm run build    # tsc -b && vite build → genera dist/
npm run preview  # sirve el build localmente para probarlo
```

### Scripts disponibles

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo de Vite con el proxy `/backend-api` |
| `npm run build` | Verifica tipos (`tsc -b`) y construye a `dist/` |
| `npm run preview` | Sirve `dist/` localmente |
| `npm run lint` | Corre ESLint sobre todo el proyecto |

## Despliegue

El proyecto se despliega como SPA estática. [vercel.json](vercel.json) reescribe todas las rutas a `index.html` para que el ruteo del lado del cliente funcione al refrescar y con enlaces directos.

Antes de desplegar, configura las mismas variables `VITE_*` en el entorno del proveedor de hosting, y recuerda que el build de producción llama a `VITE_API_URL` **directamente** — ahí no existe el proxy de desarrollo, así que la API debe permitir el origen del frontend vía CORS.

## Documentación del proyecto

La carpeta `docs/` es la fuente de verdad del proyecto para desarrollo asistido:

| Archivo | Contenido |
|---|---|
| `proyecto-ridehailing.md` | Alcance completo, reglas de negocio y convenciones |
| `api-contract-catrachogo.md` | Contrato completo de la API (rutas, bodies, responses) |
| `erd-catrachogo.mermaid` | Modelo de datos |
| `wireframes-especificacion-web.md` | Especificación pantalla por pantalla |
| `sprints-catrachogo-web.md` | Registro único de todos los sprints: qué se planeó y qué se construyó realmente |
| `manual-testing-checklist.md` | Checklist de pruebas manuales contra el backend real |
| `backend-changes-needed.md` | Lista viva de gaps/bugs del backend detectados desde este repo |
| `backend-specs/` | Specs de diseño para cambios del backend originados en un sprint de este repo |
| `mobile-specs/` | Specs compartidas con la app `catrachogo-mobile` |
| `presentation-guide.md` | Guion de demo para presentar el proyecto |

## Metodología de trabajo

El proyecto se construye por **sprints**, cada uno documentado antes de escribir código: número, nombre de rama (`feature/<módulo>`), lista de pasos y un mensaje de commit sugerido. El flujo de ramas es `main` → `develop` → `feature/*`, un módulo por rama para poder revisar o revertir por partes. Cada sprint se prueba manualmente contra el backend real antes de darse por terminado. Los commits siguen **Conventional Commits** en inglés.

## Repositorios relacionados

- [`catrachogo-api`](https://github.com/xEdwardP/catrachogo-api) — backend NestJS + PostgreSQL/PostGIS. Es requisito para correr este frontend.
- [`catrachogo-mobile`](https://github.com/xEdwardP/catrachogo-mobile) — app nativa (React Native + Expo) para los tres roles, contra el mismo backend.

## Créditos

Desarrollado por **Edward Pineda** ([@xEdwardP](https://github.com/xEdwardP)).
