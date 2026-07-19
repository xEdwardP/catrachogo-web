import { apiClient } from './client';
import type { DriverPublicProfile } from '../types/driver';

export async function getDriverPublicProfile(driverId: string): Promise<DriverPublicProfile> {
  const { data } = await apiClient.get<DriverPublicProfile>(`/drivers/${driverId}`);
  return data;
}
