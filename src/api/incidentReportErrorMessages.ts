import { getApiStatusCode } from './client';

export function translateCreateIncidentReportError(error: unknown): string {
  const statusCode = getApiStatusCode(error);
  if (statusCode === 403) {
    return 'No tienes permiso para reportar este viaje.';
  }
  if (statusCode === 400) {
    return 'Revisa la categoría y la descripción del reporte.';
  }
  return 'No se pudo enviar el reporte. Intenta de nuevo.';
}
