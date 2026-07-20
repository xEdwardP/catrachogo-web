import { getApiStatusCode } from './client';

export function translateDriverVerificationError(): string {
  return 'No se pudo actualizar el estado del conductor. Intenta de nuevo.';
}

export function translateResolveWithdrawalError(error: unknown): string {
  const statusCode = getApiStatusCode(error);
  if (statusCode === 400) {
    return 'Esta solicitud ya fue resuelta.';
  }
  if (statusCode === 404) {
    return 'Esta solicitud ya no existe.';
  }
  return 'No se pudo actualizar la solicitud. Intenta de nuevo.';
}

export function translateFareZoneError(error: unknown): string {
  const statusCode = getApiStatusCode(error);
  if (statusCode === 400) {
    return 'Revisa que el nombre y los valores numéricos de la zona sean válidos.';
  }
  if (statusCode === 404) {
    return 'Esta zona ya no existe.';
  }
  return 'No se pudo guardar la zona. Intenta de nuevo.';
}
