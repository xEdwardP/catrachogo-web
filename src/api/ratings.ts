import { apiClient } from './client';
import type { CreateRatingPayload, Rating } from '../types/rating';

export async function createRating(payload: CreateRatingPayload): Promise<Rating> {
  const { data } = await apiClient.post<Rating>('/ratings', payload);
  return data;
}
