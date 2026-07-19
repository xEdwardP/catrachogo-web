import { getApiErrorMessage, getApiStatusCode } from './client';

export function translateEstimateError(error: unknown): string {
  const statusCode = getApiStatusCode(error);
  if (statusCode === 400) {
    return 'Ese destino está fuera del área de cobertura en Honduras.';
  }
  return 'No se pudo calcular la tarifa. Intenta de nuevo.';
}

export function translateCreateTripError(error: unknown): string {
  const statusCode = getApiStatusCode(error);
  const rawMessage = getApiErrorMessage(error, '').toLowerCase();

  if (statusCode === 402) {
    return 'Saldo insuficiente para este viaje. Recarga tu wallet para continuar.';
  }
  if (statusCode === 400 && rawMessage.includes('phone')) {
    return 'Necesitas un número de teléfono registrado para pedir un viaje.';
  }
  if (statusCode === 400) {
    return 'Ese destino está fuera del área de cobertura en Honduras.';
  }
  return 'No se pudo solicitar el viaje. Intenta de nuevo.';
}

export function translateCancelTripError(error: unknown): string {
  const statusCode = getApiStatusCode(error);
  if (statusCode === 400) {
    return 'Este viaje ya no se puede cancelar.';
  }
  if (statusCode === 403) {
    return 'No tienes permiso para cancelar este viaje.';
  }
  return 'No se pudo cancelar el viaje. Intenta de nuevo.';
}
