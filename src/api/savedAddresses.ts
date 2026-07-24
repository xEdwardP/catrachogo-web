import { apiClient } from './client';
import type { CreateSavedAddressPayload, SavedAddress } from '../types/savedAddress';

export async function getSavedAddresses(): Promise<SavedAddress[]> {
  const { data } = await apiClient.get<SavedAddress[]>('/saved-addresses');
  return data;
}

export async function createSavedAddress(payload: CreateSavedAddressPayload): Promise<SavedAddress> {
  const { data } = await apiClient.post<SavedAddress>('/saved-addresses', payload);
  return data;
}

export async function deleteSavedAddress(id: string): Promise<void> {
  await apiClient.delete(`/saved-addresses/${id}`);
}
