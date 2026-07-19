import { apiClient } from './client';
import type { PaginatedResult } from '../types/pagination';
import type { WalletTransaction } from '../types/wallet';

export async function getWalletBalance(): Promise<{ balance: number }> {
  const { data } = await apiClient.get<{ balance: number }>('/wallet');
  return data;
}

export async function getWalletTransactions(
  page = 1,
  limit = 20,
): Promise<PaginatedResult<WalletTransaction>> {
  const { data } = await apiClient.get('/wallet/transactions', { params: { page, limit } });
  return data;
}

export async function createTopupOrder(amount: number): Promise<{ orderId: string }> {
  const { data } = await apiClient.post<{ orderId: string }>('/wallet/topup/create-order', { amount });
  return data;
}

export async function confirmTopup(orderId: string): Promise<{ balance: number }> {
  const { data } = await apiClient.post<{ balance: number }>('/wallet/topup/confirm', { orderId });
  return data;
}

export async function requestWithdrawal(paypalEmail: string, amount: number): Promise<void> {
  await apiClient.post('/wallet/withdrawal', { paypalEmail, amount });
}
