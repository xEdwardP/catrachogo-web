import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Bell,
  Car,
  ChevronDown,
  Clock,
  MapPin,
  Navigation,
  Rocket,
  ShieldCheck,
  Smartphone,
  Star,
  Wallet,
  Zap,
} from 'lucide-react';

const HIGHLIGHTS = [
  { icon: ShieldCheck, text: '100% conductores verificados' },
  { icon: Wallet, text: 'Pagos sin efectivo desde tu wallet' },
  { icon: Navigation, text: 'Seguimiento en tiempo real' },
  { icon: Smartphone, text: 'Sin descargar nada, desde tu navegador' },
];

const FEATURES = [
  {
    icon: MapPin,
    accent: 'brand' as const,
    title: 'Cobertura en toda Honduras',
    description: 'Pide un viaje desde donde estés, con tarifas calculadas por zona en tiempo real.',
  },
  {
    icon: ShieldCheck,
    accent: 'success' as const,
    title: 'Conductores verificados',
    description: 'Cada conductor pasa por una revisión de documentos antes de recibir viajes.',
  },
  {
    icon: Wallet,
    accent: 'brand' as const,
    title: 'Paga como quieras',
    description: 'Recarga tu wallet con PayPal y paga tus viajes sin usar efectivo.',
  },
  {
    icon: Clock,
    accent: 'success' as const,
    title: 'Rápido y confiable',
    description: 'Sigue a tu conductor en el mapa en tiempo real, desde que acepta hasta que llega.',
  },
];

const STEPS = [
  {
    number: '1',
    title: 'Pide tu viaje',
    description: 'Escribe a dónde vas y mira la tarifa estimada antes de confirmar.',
  },
  {
    number: '2',
    title: 'Un conductor te recoge',
    description: 'Sigue su ubicación en el mapa y llámalo directo desde la app.',
  },
  {
    number: '3',
    title: 'Paga y califica',
    description: 'El cobro se hace automático desde tu wallet. Califica cómo te fue.',
  },
];

const DRIVER_BENEFITS = [
  {
    icon: Clock,
    title: 'Tus horarios, tus reglas',
    description: 'Actívate cuando quieras recibir viajes y desconéctate cuando termines.',
  },
  {
    icon: Banknote,
    title: 'Cobra cada viaje al instante',
    description: 'El pago llega directo a tu wallet al completar el viaje, sin esperas.',
  },
  {
    icon: BadgeCheck,
    title: 'Retiros a tu PayPal',
    description: 'Solicita el retiro de tus ganancias cuando quieras, desde la misma app.',
  },
];

const APP_HIGHLIGHTS = [
  {
    icon: Bell,
    title: 'Notificaciones push nativas',
    description: 'Entérate al instante cuando un conductor acepta o llega, sin depender del navegador.',
  },
  {
    icon: Zap,
    title: 'Más rápida y ligera',
    description: 'Pensada para conexiones móviles, con la misma experiencia que ya conoces.',
  },
  {
    icon: Rocket,
    title: 'Lanzamiento completo',
    description: 'Estamos preparando todo para lanzarla de una sola vez, no por partes.',
  },
];

const FAQS = [
  {
    question: '¿Necesito instalar una aplicación?',
    answer:
      'No. CatrachoGo funciona directo en el navegador de tu teléfono o computadora. Solo crea tu cuenta y pide tu primer viaje.',
  },
  {
    question: '¿Cómo pago mis viajes?',
    answer:
      'Con tu wallet CatrachoGo: la recargas con PayPal y el cobro de cada viaje se descuenta automáticamente al completarlo. Ves la tarifa estimada antes de confirmar, sin sorpresas.',
  },
  {
    question: '¿Cómo sé que mi conductor es confiable?',
    answer:
      'Todos los conductores pasan por una revisión de identidad y documentos del vehículo antes de poder recibir viajes, y los pasajeros los califican al final de cada viaje.',
  },
  {
    question: '¿Qué necesito para ser conductor?',
    answer:
      'Tu identidad, licencia, los documentos de tu vehículo y una selfie de verificación. Subes todo al registrarte y nuestro equipo lo revisa para aprobarte.',
  },
  {
    question: '¿Cómo se calculan las tarifas?',
    answer:
      'Por zona y distancia recorrida. Antes de confirmar tu viaje siempre ves la tarifa estimada, y el conductor ve lo mismo que tú.',
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <img src="/logo_without_text.png" alt="CatrachoGo" className="h-9 w-9" />
            <span className="text-lg font-bold text-gray-800">CatrachoGo</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 md:flex">
            <a href="#como-funciona" className="transition hover:text-gray-900">
              Cómo funciona
            </a>
            <a href="#conductores" className="transition hover:text-gray-900">
              Conductores
            </a>
            <a href="#app-movil" className="transition hover:text-gray-900">
              App móvil
            </a>
            <a href="#preguntas" className="transition hover:text-gray-900">
              Preguntas
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden text-sm font-medium text-gray-600 hover:text-gray-900 sm:block"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              state={{ role: 'passenger' }}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF3EC] to-cream">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-[#F5C99B]/40 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:py-24">
          <div className="text-center lg:text-left">
            <span className="mb-4 inline-block rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-success shadow-sm">
              Ride-hailing hecho para Honduras
            </span>
            <h1 className="mb-4 text-4xl font-bold leading-tight text-gray-800 sm:text-5xl">
              Tu viaje, <span className="text-brand">a tu manera</span>
            </h1>
            <p className="mb-8 text-lg text-gray-600">
              Pide un viaje en minutos, sigue a tu conductor en tiempo real y paga desde tu
              wallet — todo desde tu navegador, sin descargar nada.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Link
                to="/register"
                state={{ role: 'passenger' }}
                className="w-full rounded-xl bg-brand px-6 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-brand/20 transition hover:-translate-y-0.5 hover:bg-brand-dark sm:w-auto"
              >
                Pedir un viaje
              </Link>
              <Link
                to="/register"
                state={{ role: 'driver' }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-gray-50 sm:w-auto"
              >
                <Car className="h-4 w-4" />
                Conducir con CatrachoGo
              </Link>
            </div>
          </div>

          <div aria-hidden className="relative mx-auto hidden w-full max-w-sm lg:block">
            <div className="rotate-2 rounded-3xl bg-white p-5 shadow-2xl shadow-brand/10 ring-1 ring-black/5 transition duration-300 hover:rotate-0">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">Tu viaje</span>
                <span className="flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                  </span>
                  Conductor en camino
                </span>
              </div>

              <div className="mb-4 flex gap-3">
                <div className="flex flex-col items-center pt-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand" />
                  <span className="my-1 w-px flex-1 border-l border-dashed border-gray-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-success" />
                </div>
                <div className="flex flex-1 flex-col justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-gray-400">Origen</p>
                    <p className="text-sm text-gray-800">Parque Central</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-gray-400">Destino</p>
                    <p className="text-sm text-gray-800">Mall Multiplaza</p>
                  </div>
                </div>
              </div>

              <div className="mb-4 flex items-center justify-between rounded-lg bg-brand-pale px-3 py-2">
                <span className="text-sm text-gray-600">Tarifa estimada</span>
                <span className="text-sm font-bold text-success">L. 85.00 · 4.2 km</span>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-pale text-sm font-bold text-brand">
                  C
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">Carlos M.</p>
                  <p className="text-xs text-gray-500">Toyota Corolla · ABC 1234</p>
                </div>
                <span className="flex items-center gap-1 text-sm text-gray-600">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  4.9
                </span>
              </div>
            </div>

            <div className="absolute -left-16 bottom-20 -rotate-3 rounded-xl bg-white px-3 py-2 shadow-lg ring-1 ring-black/5">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <MapPin className="h-3.5 w-3.5 text-brand" />
                Llega en 3 min
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {HIGHLIGHTS.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center justify-center gap-2 text-sm text-gray-600 lg:justify-start">
              <Icon className="h-4 w-4 shrink-0 text-success" />
              {text}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto mb-10 max-w-xl text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-800 sm:text-3xl">Por qué elegir CatrachoGo</h2>
          <p className="text-gray-500">Diseñado para moverte por tu ciudad de forma simple y segura.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, accent, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div
                className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${
                  accent === 'brand' ? 'bg-brand-pale text-brand' : 'bg-success/10 text-success'
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1 font-semibold text-gray-800">{title}</h3>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="como-funciona" className="scroll-mt-20 bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto mb-12 max-w-xl text-center">
            <h2 className="mb-2 text-2xl font-bold text-gray-800 sm:text-3xl">Cómo funciona</h2>
            <p className="text-gray-500">De pedir tu viaje a llegar a tu destino, en 3 pasos.</p>
          </div>
          <div className="relative grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
            <div
              aria-hidden
              className="absolute left-[16.6%] right-[16.6%] top-6 hidden border-t-2 border-dashed border-gray-200 sm:block"
            />
            {STEPS.map((step) => (
              <div key={step.number} className="relative text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-lg font-bold text-white shadow-lg shadow-brand/25 ring-4 ring-gray-50">
                  {step.number}
                </div>
                <h3 className="mb-1 font-semibold text-gray-800">{step.title}</h3>
                <p className="mx-auto max-w-xs text-sm text-gray-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="conductores" className="scroll-mt-20 py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <span className="mb-3 inline-block rounded-full bg-brand-pale px-4 py-1.5 text-xs font-semibold text-brand">
              Para conductores
            </span>
            <h2 className="mb-3 text-2xl font-bold text-gray-800 sm:text-3xl">
              ¿Tienes vehículo? Genera ingresos con él
            </h2>
            <p className="mb-6 text-gray-500">
              Regístrate, sube tus documentos y empieza a recibir viajes en cuanto te
              aprobemos. Solo necesitas tu licencia y un vehículo en buen estado.
            </p>
            <Link
              to="/register"
              state={{ role: 'driver' }}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition hover:-translate-y-0.5 hover:bg-brand-dark"
            >
              Empezar a conducir
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {DRIVER_BENEFITS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="mb-0.5 font-semibold text-gray-800">{title}</h3>
                  <p className="text-sm text-gray-500">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="app-movil" className="scroll-mt-20 py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <span className="mb-3 inline-block rounded-full bg-success/10 px-4 py-1.5 text-xs font-semibold text-success">
              Próximamente
            </span>
            <h2 className="mb-3 text-2xl font-bold text-gray-800 sm:text-3xl">
              La app móvil de CatrachoGo está en camino
            </h2>
            <p className="mb-6 text-gray-500">
              Estamos trabajando en la versión nativa para iOS y Android. La web ya funciona
              perfecto desde tu navegador, y la app llegará como un extra para quienes la
              prefieran instalada.
            </p>
            <div className="flex flex-col gap-4">
              {APP_HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="mb-0.5 text-sm font-semibold text-gray-800">{title}</h3>
                    <p className="text-sm text-gray-500">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div aria-hidden className="order-1 flex justify-center lg:order-2">
            <div className="relative">
              <div className="w-56 rounded-[2.5rem] border-8 border-gray-800 bg-gray-800 p-1 shadow-2xl shadow-brand/10">
                <div className="flex h-[26rem] flex-col items-center justify-center gap-4 rounded-[2rem] bg-gradient-to-b from-cream to-white px-6 text-center">
                  <img src="/logo_without_text.png" alt="" className="h-14 w-14" />
                  <span className="rounded-full bg-brand-pale px-3 py-1 text-[11px] font-semibold text-brand">
                    Próximamente
                  </span>
                  <p className="text-xs text-gray-400">iOS y Android</p>
                </div>
              </div>

              <div className="absolute -right-10 top-10 w-40 rotate-3 rounded-xl bg-white px-3 py-2 shadow-lg ring-1 ring-black/5">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                    <Bell className="h-3 w-3" />
                  </span>
                  <p className="text-[11px] font-medium text-gray-700">Tu conductor llegó</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="preguntas" className="scroll-mt-20 bg-gray-50 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="mx-auto mb-10 max-w-xl text-center">
            <h2 className="mb-2 text-2xl font-bold text-gray-800 sm:text-3xl">Preguntas frecuentes</h2>
            <p className="text-gray-500">Lo que la gente suele preguntar antes de su primer viaje.</p>
          </div>
          <div className="flex flex-col gap-3">
            {FAQS.map(({ question, answer }) => (
              <details
                key={question}
                className="group rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm open:shadow-md"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium text-gray-800 [&::-webkit-details-marker]:hidden">
                  {question}
                  <ChevronDown className="h-4 w-4 shrink-0 text-gray-400 transition group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-gray-500">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gray-800 p-8 text-center sm:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-success/20 blur-3xl"
          />
          <div className="relative">
            <h2 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
              Tu próximo viaje está a un clic
            </h2>
            <p className="mx-auto mb-6 max-w-md text-gray-300">
              Crea tu cuenta gratis y pide tu primer viaje hoy mismo, sin instalar nada.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/register"
                state={{ role: 'passenger' }}
                className="w-full rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition hover:-translate-y-0.5 hover:bg-brand-dark sm:w-auto"
              >
                Crear mi cuenta
              </Link>
              <Link
                to="/login"
                className="w-full rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/20 sm:w-auto"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-xs">
              <div className="mb-2 flex items-center gap-2">
                <img src="/logo_without_text.png" alt="CatrachoGo" className="h-8 w-8" />
                <span className="font-bold text-gray-800">CatrachoGo</span>
              </div>
              <p className="text-sm text-gray-400">
                Ride-hailing hecho para Honduras: viajes seguros, tarifas claras y pagos sin
                efectivo.
              </p>
            </div>
            <div className="flex gap-16">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Producto
                </p>
                <ul className="flex flex-col gap-2 text-sm text-gray-500">
                  <li>
                    <a href="#como-funciona" className="hover:text-gray-800">
                      Cómo funciona
                    </a>
                  </li>
                  <li>
                    <a href="#conductores" className="hover:text-gray-800">
                      Conductores
                    </a>
                  </li>
                  <li>
                    <a href="#app-movil" className="hover:text-gray-800">
                      App móvil
                    </a>
                  </li>
                  <li>
                    <a href="#preguntas" className="hover:text-gray-800">
                      Preguntas frecuentes
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Cuenta
                </p>
                <ul className="flex flex-col gap-2 text-sm text-gray-500">
                  <li>
                    <Link to="/login" className="hover:text-gray-800">
                      Iniciar sesión
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" state={{ role: 'passenger' }} className="hover:text-gray-800">
                      Crear cuenta
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" state={{ role: 'driver' }} className="hover:text-gray-800">
                      Conducir con CatrachoGo
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-100 pt-6 text-center text-sm text-gray-400 sm:text-left">
            © {new Date().getFullYear()} CatrachoGo. Hecho en Honduras.
          </div>
        </div>
      </footer>
    </div>
  );
}
