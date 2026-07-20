import { getApiErrorMessage, getApiStatusCode } from './client';

export function translateCreateRatingError(error: unknown): string {
  const statusCode = getApiStatusCode(error);
  const rawMessage = getApiErrorMessage(error, '').toLowerCase();

  if (statusCode === 409) {
    return 'Ya calificaste este viaje.';
  }
  if (statusCode === 403) {
    return 'No puedes calificar un viaje en el que no participaste.';
  }
  if (statusCode === 400 && rawMessage.includes('completed')) {
    return 'Solo puedes calificar viajes ya completados.';
  }
  return 'No se pudo enviar la calificación. Intenta de nuevo.';
}
