import axios from 'axios';
import { clearStoredToken, getStoredToken } from './tokenStorage';
import { emitSessionExpired } from './sessionEvents';

export const apiClient = axios.create({
  baseURL: import.meta.env.DEV ? '/backend-api' : import.meta.env.VITE_API_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && error.config?.headers?.Authorization) {
      clearStoredToken();
      emitSessionExpired();
    }
    return Promise.reject(error);
  },
);

export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error: string;
}

export function getApiStatusCode(error: unknown): number | undefined {
  if (axios.isAxiosError(error)) {
    return error.response?.status;
  }
  return undefined;
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Ocurrió un error inesperado. Intenta de nuevo.',
): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiErrorBody | undefined;
    if (body?.message) {
      return Array.isArray(body.message) ? body.message.join(' ') : body.message;
    }
  }
  return fallback;
}
