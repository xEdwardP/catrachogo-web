import { apiClient } from './client';
import type {
  AuthUser,
  GoogleAuthResponse,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
} from '../types/auth';

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', { email, password });
  return data;
}

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  const { data } = await apiClient.post<RegisterResponse>('/auth/register', payload);
  return data;
}

export async function loginWithGoogle(idToken: string): Promise<GoogleAuthResponse> {
  const { data } = await apiClient.post<GoogleAuthResponse>('/auth/google', { idToken });
  return data;
}

export async function getProfile(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>('/auth/profile');
  return data;
}

export async function updatePhone(phone: string): Promise<{ phone: string }> {
  const { data } = await apiClient.patch<{ phone: string }>('/auth/phone', { phone });
  return data;
}
