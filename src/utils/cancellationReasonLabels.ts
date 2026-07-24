import type { CancellationReason } from '../types/trip';

export const CANCELLATION_REASON_LABELS: Record<CancellationReason, string> = {
  changed_plans: 'Cambié de planes',
  found_other_ride: 'Encontré otro medio',
  took_too_long: 'Tardó mucho',
  other: 'Otro',
  no_show: 'El pasajero no llegó (reportado por el conductor)',
};

export const PASSENGER_CANCELLATION_REASONS: CancellationReason[] = [
  'changed_plans',
  'found_other_ride',
  'took_too_long',
  'other',
];
