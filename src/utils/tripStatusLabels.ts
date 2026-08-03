import type { TripStatus } from '../types/trip';

export const TRIP_STATUS_LABELS: Record<TripStatus, string> = {
  pending: 'Pendiente',
  accepted: 'Aceptado',
  in_progress: 'En curso',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

export const TRIP_STATUS_COLORS: Record<TripStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  accepted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  completed: 'bg-success/10 text-success dark:bg-success/20',
  cancelled: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};
