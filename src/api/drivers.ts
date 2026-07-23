import { apiClient } from './client';
import type {
  CompleteDriverProfilePayload,
  DriverPublicProfile,
  DriverSummary,
  PendingTripRequest,
} from '../types/driver';

export async function getDriverPublicProfile(driverId: string): Promise<DriverPublicProfile> {
  const { data } = await apiClient.get<DriverPublicProfile>(`/drivers/${driverId}`);
  return data;
}

export async function completeDriverProfile(payload: CompleteDriverProfilePayload): Promise<void> {
  await apiClient.post('/drivers/complete-profile', payload);
}

export async function updateAvailability(available: boolean): Promise<{ available: boolean }> {
  const { data } = await apiClient.patch<{ available: boolean }>('/drivers/availability', { available });
  return data;
}

export async function getPendingRequest(): Promise<PendingTripRequest | null> {
  const { data } = await apiClient.get<PendingTripRequest | null>('/drivers/pending-requests');
  return data ?? null;
}

export async function getDriverSummary(): Promise<DriverSummary> {
  const { data } = await apiClient.get<DriverSummary>('/drivers/summary');
  return data;
}
