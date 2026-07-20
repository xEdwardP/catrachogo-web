import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { getAdminTrips } from '../api/admin';
import type { Trip, TripStatus } from '../types/trip';

const STATUS_LABELS: Record<TripStatus, string> = {
  pending: 'Pendiente',
  accepted: 'Aceptado',
  in_progress: 'En curso',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

const STATUS_COLORS: Record<TripStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-success/10 text-success',
  cancelled: 'bg-gray-100 text-gray-500',
};

const PAGE_SIZE = 20;

function parseStatusParam(value: string | null): TripStatus | '' {
  return value && value in STATUS_LABELS ? (value as TripStatus) : '';
}

export function AdminTripsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = parseStatusParam(searchParams.get('status'));
  const [trips, setTrips] = useState<Trip[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTrips = useCallback((forStatus: TripStatus | '', forPage: number) => {
    getAdminTrips(forStatus || undefined, forPage, PAGE_SIZE)
      .then((result) => {
        setTrips(result.data);
        setTotal(result.total);
      })
      .catch(() => toast.error('No se pudo cargar la lista de viajes.'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchTrips(status, page);
  }, [status, page, fetchTrips]);

  function handleStatusChange(nextStatus: TripStatus | '') {
    setIsLoading(true);
    setPage(1);
    setSearchParams(nextStatus ? { status: nextStatus } : {}, { replace: true });
  }

  function goToPage(newPage: number) {
    setIsLoading(true);
    setPage(newPage);
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <AdminLayout>
      <h1 className="mb-1 text-2xl font-bold text-gray-800">Viajes</h1>
      <p className="mb-6 text-sm text-gray-500">{isLoading ? 'Cargando...' : `${total} viajes en total`}</p>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => handleStatusChange('')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            status === '' ? 'bg-brand text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Todos
        </button>
        {(Object.keys(STATUS_LABELS) as TripStatus[]).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => handleStatusChange(value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              status === value ? 'bg-brand text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {STATUS_LABELS[value]}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 text-xs uppercase text-gray-400">
            <tr>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3">Origen</th>
              <th className="px-5 py-3">Destino</th>
              <th className="px-5 py-3">Tarifa</th>
              <th className="px-5 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            )}
            {!isLoading && trips.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                  No hay viajes con este filtro.
                </td>
              </tr>
            )}
            {!isLoading && trips.map((trip) => (
              <tr key={trip.id} className="border-b border-gray-50 transition last:border-0 hover:bg-cream/50">
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[trip.status]}`}>
                    {STATUS_LABELS[trip.status]}
                  </span>
                </td>
                <td className="max-w-[200px] truncate px-5 py-3 text-gray-600">{trip.originAddress}</td>
                <td className="max-w-[200px] truncate px-5 py-3 text-gray-600">{trip.destinationAddress}</td>
                <td className="px-5 py-3 font-semibold text-gray-800">L. {trip.fare.toFixed(2)}</td>
                <td className="px-5 py-3 text-gray-600">
                  {trip.requestedAt ? new Date(trip.requestedAt).toLocaleString('es-HN') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3 text-sm">
            <button
              type="button"
              onClick={() => goToPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="text-gray-600 disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="text-gray-400">
              Página {page} de {totalPages}
            </span>
            <button
              type="button"
              onClick={() => goToPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="text-gray-600 disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
