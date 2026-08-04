import { X } from 'lucide-react';
import { CANCELLATION_REASON_LABELS } from '../utils/cancellationReasonLabels';
import { TRIP_STATUS_COLORS, TRIP_STATUS_LABELS } from '../utils/tripStatusLabels';
import type { Trip } from '../types/trip';

interface TripDetailModalProps {
  trip: Trip;
  onClose: () => void;
}

export function TripDetailModal({ trip, onClose }: TripDetailModalProps) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Detalle del viaje</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-xl bg-cream p-4 text-sm dark:bg-gray-800">
          <div>
            <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Estado</p>
            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${TRIP_STATUS_COLORS[trip.status]}`}>
              {TRIP_STATUS_LABELS[trip.status]}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Tarifa</p>
            <p className="font-semibold text-gray-800 dark:text-gray-100">L. {trip.fare.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Distancia</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{trip.distanceKm.toFixed(1)} km</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Calificado</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{trip.ratedByMe ? 'Sí' : 'No'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">Solicitado</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">
              {trip.requestedAt ? new Date(trip.requestedAt).toLocaleString('es-HN') : '—'}
            </p>
          </div>
          {trip.completedAt && (
            <div className="col-span-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Completado</p>
              <p className="font-medium text-gray-800 dark:text-gray-100">
                {new Date(trip.completedAt).toLocaleString('es-HN')}
              </p>
            </div>
          )}
          {trip.status === 'cancelled' && (
            <div className="col-span-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Motivo de cancelación</p>
              <p className="font-medium text-gray-800 dark:text-gray-100">
                {trip.cancelReason ? (CANCELLATION_REASON_LABELS[trip.cancelReason] ?? trip.cancelReason) : '—'}
              </p>
            </div>
          )}
          {trip.status === 'cancelled' && trip.cancellationFee != null && trip.cancellationFee > 0 && (
            <div className="col-span-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Tarifa de cancelación</p>
              <p className="font-medium text-gray-800 dark:text-gray-100">L. {trip.cancellationFee.toFixed(2)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
