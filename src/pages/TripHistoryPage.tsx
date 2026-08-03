import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, CarFront, Flag } from 'lucide-react';
import { getTripHistory } from '../api/trips';
import { createIncidentReport } from '../api/incidentReports';
import { translateCreateIncidentReportError } from '../api/incidentReportErrorMessages';
import { ReportIncidentModal } from '../components/ReportIncidentModal';
import { useAuth } from '../hooks/useAuth';
import { homePathForRole } from '../utils/roleRoutes';
import { TRIP_STATUS_COLORS, TRIP_STATUS_LABELS } from '../utils/tripStatusLabels';
import type { Trip } from '../types/trip';
import type { IncidentReportCategory } from '../types/incidentReport';

const PAGE_SIZE = 10;

export function TripHistoryPage() {
  const { user } = useAuth();
  const tripDetailBasePath = user?.role === 'driver' ? '/driver/trips' : '/passenger/trips';
  const [trips, setTrips] = useState<Trip[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [reportingTripId, setReportingTripId] = useState<string | null>(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

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

  async function handleSubmitReport(payload: { category: IncidentReportCategory; description: string }) {
    if (!reportingTripId) return;
    setIsSubmittingReport(true);
    try {
      await createIncidentReport({ tripId: reportingTripId, ...payload });
      toast.success('Reporte enviado. Gracias por avisarnos.');
      setReportingTripId(null);
    } catch (error) {
      toast.error(translateCreateIncidentReportError(error));
    } finally {
      setIsSubmittingReport(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream p-4 lg:p-8 dark:bg-gray-950">
      <div className="mx-auto max-w-md lg:max-w-3xl">
        <Link
          to={user ? homePathForRole(user.role) : '/'}
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
        <h1 className="mb-4 text-xl font-bold text-gray-800 lg:mb-6 dark:text-gray-100">Historial de viajes</h1>

        <div className="rounded-2xl bg-white p-4 shadow-sm lg:p-6 dark:bg-gray-900">
          {isLoading ? (
            <p className="text-sm text-gray-400 dark:text-gray-500">Cargando...</p>
          ) : trips.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-pale text-brand dark:bg-brand/15">
                <CarFront className="h-6 w-6" />
              </span>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Todavía no tienes viajes</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Cuando completes tu primer viaje aparecerá aquí.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {trips.map((trip) => (
                <li
                  key={trip.id}
                  className="border-b border-gray-100 pb-3 last:border-0 lg:flex lg:items-center lg:gap-4 lg:pb-2.5 dark:border-gray-800"
                >
                  <Link
                    to={`${tripDetailBasePath}/${trip.id}`}
                    className="-mx-2 block min-w-0 rounded-lg px-2 py-1 transition hover:bg-cream/70 lg:flex lg:min-w-0 lg:flex-1 lg:items-center lg:justify-between lg:gap-4 dark:hover:bg-gray-800"
                  >
                    <div className="mb-1 flex items-center justify-between lg:mb-0 lg:w-44 lg:shrink-0 lg:gap-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${TRIP_STATUS_COLORS[trip.status]}`}
                      >
                        {TRIP_STATUS_LABELS[trip.status]}
                      </span>
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">L. {trip.fare.toFixed(2)}</span>
                    </div>
                    {trip.requestedAt && (
                      <p className="text-xs text-gray-400 lg:w-40 lg:shrink-0 lg:text-right dark:text-gray-500">
                        {new Date(trip.requestedAt).toLocaleString('es-HN')}
                      </p>
                    )}
                  </Link>
                  {user?.role === 'passenger' && trip.driverId && (
                    <button
                      type="button"
                      onClick={() => setReportingTripId(trip.id)}
                      className="mt-1 flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-red-500 lg:mt-0 lg:shrink-0 dark:text-gray-500"
                    >
                      <Flag className="h-3 w-3" /> Reportar
                    </button>
                  )}
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
                className="text-gray-600 disabled:opacity-40 dark:text-gray-300"
              >
                Anterior
              </button>
              <span className="text-gray-400 dark:text-gray-500">
                Página {page} de {totalPages}
              </span>
              <button
                type="button"
                onClick={() => goToPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="text-gray-600 disabled:opacity-40 dark:text-gray-300"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>

      {reportingTripId && (
        <ReportIncidentModal
          isSubmitting={isSubmittingReport}
          onSubmit={handleSubmitReport}
          onDismiss={() => setReportingTripId(null)}
        />
      )}
    </div>
  );
}
