import { apiClient } from './client';
import type { FareZone } from '../types/fareZone';

export async function getFareZones(): Promise<FareZone[]> {
  const { data } = await apiClient.get<FareZone[]>('/fare-zones');
  return data;
}

export type FareZonePayload = Omit<FareZone, 'id'>;

export async function createFareZone(payload: FareZonePayload): Promise<FareZone> {
  const { data } = await apiClient.post<FareZone>('/admin/fare-zones', payload);
  return data;
}

export async function updateFareZone(id: string, payload: Partial<FareZonePayload>): Promise<FareZone> {
  const { data } = await apiClient.patch<FareZone>(`/admin/fare-zones/${id}`, payload);
  return data;
}
