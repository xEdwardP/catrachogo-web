import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { getTripHistory } from '../api/trips';
import { useAuth } from '../hooks/useAuth';
import { homePathForRole } from '../utils/roleRoutes';
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
  completed: 'bg-[#2DBE87]/10 text-[#2DBE87]',
  cancelled: 'bg-gray-100 text-gray-500',
};

const PAGE_SIZE = 20;

export function TripHistoryPage() {
  const { user } = useAuth();
  const tripDetailBasePath = user?.role === 'driver' ? '/driver/trips' : '/passenger/trips';
  const [trips, setTrips] = useState<Trip[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getTripHistory(page, PAGE_SIZE)
      .then((result) => {
        setTrips(result.data);
        setTotal(result.total);
      })
      .catch(() => toast.error('No se pudo cargar el historial de viajes.'))
      .finally(() => setIsLoading(false));
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function goToPage(newPage: number) {
    setIsLoading(true);
    setPage(newPage);
  }

  return (
    <div className="min-h-screen bg-[#F6F1EC] p-4">
      <div className="mx-auto max-w-md">
        <Link
          to={user ? homePathForRole(user.role) : '/'}
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
        <h1 className="mb-4 text-xl font-bold text-gray-800">Historial de viajes</h1>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          {isLoading ? (
            <p className="text-sm text-gray-400">Cargando...</p>
          ) : trips.length === 0 ? (
            <p className="text-sm text-gray-400">Todavía no tienes viajes.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {trips.map((trip) => (
                <li key={trip.id} className="border-b border-gray-100 pb-3 last:border-0">
                  <Link to={`${tripDetailBasePath}/${trip.id}`} className="block">
                    <div className="mb-1 flex items-center justify-between">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[trip.status]}`}
                      >
                        {STATUS_LABELS[trip.status]}
                      </span>
                      <span className="text-sm font-semibold text-gray-800">L. {trip.fare.toFixed(2)}</span>
                    </div>
                    <p className="truncate text-sm text-gray-600">{trip.destinationAddress}</p>
                    {trip.requestedAt && (
                      <p className="text-xs text-gray-400">
                        {new Date(trip.requestedAt).toLocaleString('es-HN')}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm">
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
      </div>
    </div>
  );
}
