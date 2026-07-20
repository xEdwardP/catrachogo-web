import { Link } from 'react-router-dom';
import {
  Car,
  Clock,
  MapPin,
  ShieldCheck,
  Star,
  Wallet,
} from 'lucide-react';

const FEATURES = [
  {
    icon: MapPin,
    title: 'Cobertura en toda Honduras',
    description: 'Pide un viaje desde donde estés, con tarifas calculadas por zona en tiempo real.',
  },
  {
    icon: ShieldCheck,
    title: 'Conductores verificados',
    description: 'Cada conductor pasa por una revisión de documentos antes de recibir viajes.',
  },
  {
    icon: Wallet,
    title: 'Paga como quieras',
    description: 'Recarga tu wallet con PayPal y paga tus viajes sin usar efectivo.',
  },
  {
    icon: Clock,
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

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <img src="/logo_without_text.png" alt="CatrachoGo" className="h-9 w-9" />
            <span className="text-lg font-bold text-gray-800">CatrachoGo</span>
          </div>
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
              className="rounded-lg bg-[#E8532E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#d1471f]"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF3EC] to-[#F6F1EC]">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#E8532E]/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-[#F5C99B]/40 blur-3xl"
        />
        <img
          src="/logo_without_text.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute -right-16 top-1/2 hidden h-[28rem] w-[28rem] -translate-y-1/2 opacity-[0.07] lg:block"
        />

        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="mb-4 inline-block rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-[#2DBE87] shadow-sm">
              Ride-hailing hecho para Honduras
            </span>
            <h1 className="mb-4 text-4xl font-bold leading-tight text-gray-800 sm:text-5xl">
              Tu viaje, <span className="text-[#E8532E]">a tu manera</span>
            </h1>
            <p className="mb-8 text-lg text-gray-600">
              Pide un viaje en minutos, sigue a tu conductor en tiempo real y paga desde tu
              wallet todo desde tu navegador, sin descargar nada.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/register"
                state={{ role: 'passenger' }}
                className="w-full rounded-xl bg-[#E8532E] px-6 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-[#E8532E]/20 transition hover:bg-[#d1471f] sm:w-auto"
              >
                Pedir un viaje
              </Link>
              <Link
                to="/register"
                state={{ role: 'driver' }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 sm:w-auto"
              >
                <Car className="h-4 w-4" />
                Conducir con CatrachoGo
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto mb-10 max-w-xl text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-800">Por qué elegir CatrachoGo</h2>
          <p className="text-gray-500">Diseñado para moverte por tu ciudad de forma simple y segura.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#2DBE87]/10 text-[#2DBE87]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1 font-semibold text-gray-800">{title}</h3>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto mb-10 max-w-xl text-center">
            <h2 className="mb-2 text-2xl font-bold text-gray-800">Cómo funciona</h2>
            <p className="text-gray-500">De pedir tu viaje a llegar a tu destino, en 3 pasos.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.number} className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#E8532E] text-lg font-bold text-white">
                  {step.number}
                </div>
                <h3 className="mb-1 font-semibold text-gray-800">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-gray-800 p-8 text-center sm:flex-row sm:p-12 sm:text-left">
          <div>
            <h2 className="mb-2 text-2xl font-bold text-white">¿Tienes vehículo?</h2>
            <p className="max-w-md text-gray-300">
              Regístrate como conductor y genera ingresos con tus propios horarios. Solo
              necesitas tus documentos y un vehículo en buen estado.
            </p>
          </div>
          <Link
            to="/register"
            state={{ role: 'driver' }}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-[#2DBE87] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#26a374]"
          >
            <Star className="h-4 w-4" />
            Empezar a conducir
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-sm text-gray-400 sm:flex-row sm:px-6">
          <span>© {new Date().getFullYear()} CatrachoGo. Hecho en Honduras.</span>
          <Link to="/login" className="hover:text-gray-600">
            Iniciar sesión
          </Link>
        </div>
      </footer>
    </div>
  );
}
