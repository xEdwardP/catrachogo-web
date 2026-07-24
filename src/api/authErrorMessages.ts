import { getApiErrorMessage, getApiStatusCode } from './client';

export function translateLoginError(error: unknown): string {
  const statusCode = getApiStatusCode(error);
  const rawMessage = getApiErrorMessage(error, '').toLowerCase();

  if (statusCode === 429) {
    return 'Demasiados intentos. Espera un minuto antes de volver a intentar.';
  }
  if (rawMessage.includes('google')) {
    return 'Esta cuenta se creó con Google. Usa el botón "Continuar con Google" para iniciar sesión.';
  }
  if (statusCode === 401) {
    return 'Correo o contraseña incorrectos.';
  }
  return 'No se pudo iniciar sesión. Intenta de nuevo.';
}

export function translateRegisterError(error: unknown): string {
  const statusCode = getApiStatusCode(error);

  if (statusCode === 409) {
    return 'Ya existe una cuenta registrada con ese correo.';
  }
  if (statusCode === 429) {
    return 'Demasiados intentos. Espera un minuto antes de volver a intentar.';
  }
  if (statusCode === 400) {
    return 'Revisa los datos del formulario: correo válido, teléfono de 8 a 15 dígitos y contraseña de al menos 8 caracteres.';
  }
  return 'No se pudo crear la cuenta. Intenta de nuevo.';
}

export function translateGoogleLoginError(): string {
  return 'No se pudo iniciar sesión con Google. Intenta de nuevo.';
}

export function translatePhoneUpdateError(error: unknown): string {
  const statusCode = getApiStatusCode(error);

  if (statusCode === 400) {
    return 'El número de teléfono no es válido. Usa entre 8 y 15 dígitos, con "+" opcional al inicio.';
  }
  if (statusCode === 409) {
    return 'Ese número de teléfono ya está en uso por otra cuenta.';
  }
  return 'No se pudo guardar el teléfono. Intenta de nuevo.';
}

export function translateNameUpdateError(error: unknown): string {
  const statusCode = getApiStatusCode(error);

  if (statusCode === 400) {
    return 'El nombre no es válido.';
  }
  return 'No se pudo guardar el nombre. Intenta de nuevo.';
}
