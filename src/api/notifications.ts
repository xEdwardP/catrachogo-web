import { apiClient } from './client';
import type { PaginatedResult } from '../types/pagination';
import type { AppNotification } from '../types/notification';

export async function getNotifications(page = 1, limit = 20): Promise<PaginatedResult<AppNotification>> {
  const { data } = await apiClient.get<PaginatedResult<AppNotification>>('/notifications', {
    params: { page, limit },
  });
  return data;
}

export async function getUnreadNotificationsCount(): Promise<number> {
  const { data } = await apiClient.get<{ count: number }>('/notifications/unread-count');
  return data.count;
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiClient.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.patch('/notifications/read-all');
}
