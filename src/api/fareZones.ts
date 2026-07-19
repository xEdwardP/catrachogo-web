import { apiClient } from './client';
import type { FareZone } from '../types/fareZone';

export async function getFareZones(): Promise<FareZone[]> {
  const { data } = await apiClient.get<FareZone[]>('/fare-zones');
  return data;
}
