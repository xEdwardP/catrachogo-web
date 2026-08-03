import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Banknote,
  Car,
  CarFront,
  Loader2,
  RefreshCw,
  UserCheck,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { getApiStatusCode } from '../api/client';
import { getAdminStats } from '../api/adminStats';
import type { AdminStats } from '../api/adminStats';
import type { TripStatus } from '../types/trip';

interface KpiCardConfig {
  key: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  to: string;
  accent: 'brand' | 'success';
  getValue: (stats: AdminStats) => string;
  getBadge?: (stats: AdminStats) => number;
}

const KPI_CARDS: KpiCardConfig[] = [
  {
    key: 'active',
    label: 'Viajes activos',
    hint: 'Pendientes, aceptados y en curso',
    icon: Car,
    to: '/admin/trips',
    accent: 'brand',
    getValue: (stats) => String(stats.activeTrips),
  },
  {
    key: 'revenue',
    label: 'Ingresos de hoy',
    hint: `${new Date().toLocaleDateString('es-HN', { day: 'numeric', month: 'long' })}`,
    icon: Banknote,
    to: '/admin/trips?status=completed',
    accent: 'success',
    getValue: (stats) => `L. ${stats.revenueToday.toFixed(2)}`,
  },
  {
    key: 'available',
    label: 'Conductores disponibles',
    hint: 'Conectados en este momento',
    icon: CarFront,
    to: '/admin/drivers?status=approved',
    accent: 'brand',
    getValue: (stats) => String(stats.availableDrivers),
  },
  {
    key: 'withdrawals',
    label: 'Retiros pendientes',
    hint: 'Solicitudes por resolver',
    icon: Wallet,
    to: '/admin/withdrawals',
    accent: 'brand',
    getValue: (stats) => String(stats.pendingWithdrawals),
    getBadge: (stats) => stats.pendingWithdrawals,
  },
  {
    key: 'pendingDrivers',
    label: 'Conductores por aprobar',
    hint: 'Documentos en revisión',
    icon: UserCheck,
    to: '/admin/drivers?status=pending',
    accent: 'brand',
    getValue: (stats) => String(stats.pendingDrivers),
    getBadge: (stats) => stats.pendingDrivers,
  },
];

const STATUS_ROWS: { status: TripStatus; label: string; getCount: (stats: AdminStats) => number }[] = [
  { status: 'pending', label: 'Pendientes', getCount: (s) => s.pendingTrips },
  { status: 'accepted', label: 'Aceptados', getCount: (s) => s.acceptedTrips },
  { status: 'in_progress', label: 'En curso', getCount: (s) => s.inProgressTrips },
  { status: 'completed', label: 'Completados', getCount: (s) => s.completedTrips },
  { status: 'cancelled', label: 'Cancelados', getCount: (s) => s.cancelledTrips },
];

const CHART_HEIGHT = 180;

function CompletedTripsChart({ stats }: { stats: AdminStats }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const points = stats.dailyCompleted;
  const maxCount = Math.max(...points.map((point) => point.count));
  const hasData = maxCount > 0;
  const scaleMax = hasData ? maxCount : 1;
  const gridSteps = Math.round(scaleMax * 0.5) === scaleMax ? [1] : [0.5, 1];

  return (
    <div>
      {!hasData && (
        <p className="mb-2 text-sm text-gray-400 dark:text-gray-500">
          Aún no hay viajes completados en los últimos 14 días.
        </p>
      )}
      <div className="relative">
        {hoveredIndex !== null && (
          <div
            className="pointer-events-none absolute -top-1 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-800 px-2.5 py-1.5 text-xs text-white shadow-lg"
            style={{ left: `${((hoveredIndex + 0.5) / points.length) * 100}%` }}
          >
            <span className="font-semibold">{points[hoveredIndex].count}</span>{' '}
            {points[hoveredIndex].count === 1 ? 'viaje' : 'viajes'} ·{' '}
            {points[hoveredIndex].label}
          </div>
        )}
        <div className="relative" style={{ height: CHART_HEIGHT }}>
          {gridSteps.map((step) => (
            <div
              key={step}
              className="absolute inset-x-0 flex items-center gap-2"
              style={{ bottom: `${step * 100}%` }}
            >
              <span className="w-6 text-right text-[10px] leading-none text-gray-300 dark:text-gray-600">
                {Math.round(scaleMax * step)}
              </span>
              <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
            </div>
          ))}
          <div className="absolute inset-y-0 left-8 right-0 flex items-end gap-[3%]">
            {points.map((point, index) => (
              <div
                key={point.date}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="flex h-full flex-1 cursor-default items-end"
              >
                <div
                  className={`w-full rounded-t transition-colors ${
                    hoveredIndex === index ? 'bg-brand-dark' : 'bg-brand'
                  }`}
                  style={{
                    height: point.count > 0 ? `${(point.count / scaleMax) * 100}%` : '2px',
                    opacity: point.count > 0 ? 1 : 0.15,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="ml-8 mt-2 flex justify-between text-[10px] text-gray-400 dark:text-gray-500">
          <span>{points[0]?.label}</span>
          <span>{points[Math.floor(points.length / 2)]?.label}</span>
          <span>{points[points.length - 1]?.label}</span>
        </div>
      </div>
      <table className="sr-only">
        <caption>Viajes completados por día, últimos 14 días</caption>
        <thead>
          <tr>
            <th>Día</th>
            <th>Viajes completados</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.date}>
              <td>{point.label}</td>
              <td>{point.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(() => {
    getAdminStats()
      .then(setStats)
      .catch((error) =>
        toast.error(
          getApiStatusCode(error) === 429
            ? 'Demasiadas consultas seguidas. Espera unos segundos y presiona "Actualizar".'
            : 'No se pudo cargar el resumen de la plataforma.',
        ),
      )
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  function handleRefresh() {
    setIsLoading(true);
    fetchStats();
  }

  const maxStatusCount = stats
    ? Math.max(1, ...STATUS_ROWS.map((row) => row.getCount(stats)))
    : 1;

  return (
    <AdminLayout>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Resumen general de la plataforma —{' '}
            {new Date().toLocaleDateString('es-HN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {KPI_CARDS.map((card) => {
          const Icon = card.icon;
          const badge = stats && card.getBadge ? card.getBadge(stats) : 0;
          return (
            <Link
              key={card.key}
              to={card.to}
              className="group relative rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-900 dark:ring-white/10"
            >
              {badge > 0 && (
                <span className="absolute right-3 top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-bold text-white">
                  {badge}
                </span>
              )}
              <span
                className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${
                  card.accent === 'success'
                    ? 'bg-success/10 text-success'
                    : 'bg-brand-pale text-brand dark:bg-brand/15'
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {isLoading || !stats ? (
                  <Loader2 className="h-6 w-6 animate-spin text-gray-300 dark:text-gray-600" />
                ) : (
                  card.getValue(stats)
                )}
              </p>
              <p className="mt-0.5 text-sm font-medium text-gray-600 dark:text-gray-300">{card.label}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{card.hint}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 xl:col-span-2 dark:bg-gray-900 dark:ring-white/10">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Viajes completados — últimos 14 días
            </h2>
            {stats && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {stats.tripsCompletedToday} hoy
              </span>
            )}
          </div>
          {isLoading || !stats ? (
            <div className="flex items-center justify-center" style={{ height: CHART_HEIGHT }}>
              <Loader2 className="h-6 w-6 animate-spin text-gray-300 dark:text-gray-600" />
            </div>
          ) : (
            <CompletedTripsChart stats={stats} />
          )}
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 dark:bg-gray-900 dark:ring-white/10">
          <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-200">Viajes por estado</h2>
          {isLoading || !stats ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-300 dark:text-gray-600" />
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {STATUS_ROWS.map((row) => {
                const count = row.getCount(stats);
                return (
                  <li key={row.status}>
                    <Link
                      to={`/admin/trips?status=${row.status}`}
                      className="group block rounded-lg p-1 transition hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-gray-600 group-hover:text-gray-800 dark:text-gray-300 dark:group-hover:text-gray-100">{row.label}</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-100">{count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                        <div
                          className="h-full rounded-full bg-brand transition-all"
                          style={{ width: `${(count / maxStatusCount) * 100}%` }}
                        />
                      </div>
                    </Link>
                  </li>
                );
              })}
              <li className="mt-1 border-t border-gray-100 pt-3 text-right text-xs text-gray-400 dark:border-gray-800 dark:text-gray-500">
                {stats.totalTrips} viajes en total
              </li>
            </ul>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
