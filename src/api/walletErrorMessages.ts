import { getApiStatusCode } from './client';

export function translateTopupConfirmError(): string {
  return 'No se pudo confirmar el pago con PayPal. Si el cargo se realizó, contáctanos.';
}

export function translateWithdrawalError(error: unknown): string {
  const statusCode = getApiStatusCode(error);
  if (statusCode === 400) {
    return 'Saldo insuficiente para este retiro.';
  }
  return 'No se pudo solicitar el retiro. Intenta de nuevo.';
}
