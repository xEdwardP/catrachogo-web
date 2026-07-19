import { apiClient } from './client';
import type { PaginatedResult } from '../types/pagination';
import type { CreateTripPayload, DriverLocation, FareEstimate, Trip, TripDetail } from '../types/trip';

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

export async function cancelTrip(tripId: string): Promise<Trip> {
  const { data } = await apiClient.patch<Trip>(`/trips/${tripId}/cancel`);
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
