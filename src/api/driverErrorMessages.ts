import { getApiStatusCode } from './client';

export function translateCompleteDriverProfileError(error: unknown): string {
  const statusCode = getApiStatusCode(error);
  if (statusCode === 409) {
    return 'Ya completaste tu perfil de conductor.';
  }
  if (statusCode === 400) {
    return 'Revisa que todos los datos y documentos sean válidos.';
  }
  return 'No se pudo completar tu perfil. Intenta de nuevo.';
}

export function translateAvailabilityError(error: unknown): string {
  const statusCode = getApiStatusCode(error);
  if (statusCode === 403) {
    return 'Tu cuenta todavía está en revisión. Te avisaremos cuando tus documentos sean aprobados.';
  }
  return 'No se pudo actualizar tu disponibilidad. Intenta de nuevo.';
}

export function translateAcceptTripError(error: unknown): string {
  const statusCode = getApiStatusCode(error);
  if (statusCode === 409) {
    return 'Este viaje ya fue tomado por otro conductor.';
  }
  return 'No se pudo aceptar el viaje. Intenta de nuevo.';
}
