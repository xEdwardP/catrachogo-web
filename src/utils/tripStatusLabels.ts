import type { TripStatus } from '../types/trip';

export const TRIP_STATUS_LABELS: Record<TripStatus, string> = {
  pending: 'Pendiente',
  accepted: 'Aceptado',
  in_progress: 'En curso',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

export const TRIP_STATUS_COLORS: Record<TripStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-success/10 text-success',
  cancelled: 'bg-gray-100 text-gray-500',
};
