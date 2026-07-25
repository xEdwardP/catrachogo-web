import { apiClient } from './client';
import type { PaginatedResult } from '../types/pagination';
import type { CancellationReason, CreateTripPayload, DriverLocation, FareEstimate, Trip, TripDetail } from '../types/trip';

export async function estimateFare(payload: {
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
}): Promise<FareEstimate> {
  const { data } = await apiClient.post<FareEstimate>('/trips/estimate', payload);
  return data;
}

export async function createTrip(payload: CreateTripPayload): Promise<Trip> {
  const { data } = await apiClient.post<Trip>('/trips', payload);
  return data;
}

export async function getTripDetail(tripId: string): Promise<TripDetail> {
  const { data } = await apiClient.get<TripDetail>(`/trips/${tripId}`);
  return data;
}

export async function cancelTrip(tripId: string, reason: CancellationReason): Promise<Trip> {
  const { data } = await apiClient.patch<Trip>(`/trips/${tripId}/cancel`, { reason });
  return data;
}

export async function acceptTrip(tripId: string): Promise<Trip> {
  const { data } = await apiClient.patch<Trip>(`/trips/${tripId}/accept`);
  return data;
}

export async function rejectTrip(tripId: string): Promise<void> {
  await apiClient.patch(`/trips/${tripId}/reject`);
}

export async function startTrip(tripId: string): Promise<Trip> {
  const { data } = await apiClient.patch<Trip>(`/trips/${tripId}/start`);
  return data;
}

export async function markDriverArrived(tripId: string): Promise<Trip> {
  const { data } = await apiClient.patch<Trip>(`/trips/${tripId}/arrived`);
  return data;
}

export async function reportNoShow(tripId: string): Promise<Trip> {
  const { data } = await apiClient.patch<Trip>(`/trips/${tripId}/no-show`);
  return data;
}

export async function completeTrip(tripId: string): Promise<Trip> {
  const { data } = await apiClient.patch<Trip>(`/trips/${tripId}/complete`);
  return data;
}

export async function endTripEarly(tripId: string): Promise<Trip> {
  const { data } = await apiClient.patch<Trip>(`/trips/${tripId}/complete-early`);
  return data;
}

export async function getTripHistory(page = 1, limit = 20): Promise<PaginatedResult<Trip>> {
  const { data } = await apiClient.get<PaginatedResult<Trip>>('/trips/history', { params: { page, limit } });
  return data;
}

export async function getDriverLocation(tripId: string): Promise<DriverLocation | null> {
  const { data } = await apiClient.get<DriverLocation | null>(`/trips/${tripId}/driver-location`);
  return data ?? null;
}
