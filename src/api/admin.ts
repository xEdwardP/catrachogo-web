import { apiClient } from './client';
import type { PaginatedResult } from '../types/pagination';
import type {
  AdminDashboardStats,
  AdminDriverRow,
  AdminWithdrawalRow,
  VerificationStatus,
  WithdrawalStatus,
} from '../types/admin';
import type { Trip } from '../types/trip';
import type { AdminIncidentReportRow, IncidentReportStatus } from '../types/incidentReport';

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const { data } = await apiClient.get<AdminDashboardStats>('/admin/stats');
  return data;
}

export async function getAdminDrivers(status?: VerificationStatus): Promise<AdminDriverRow[]> {
  const { data } = await apiClient.get<AdminDriverRow[]>('/admin/drivers', { params: { status } });
  return data;
}

export async function updateDriverVerification(
  driverId: string,
  verificationStatus: 'approved' | 'rejected',
): Promise<void> {
  await apiClient.patch(`/admin/drivers/${driverId}/verification`, { verificationStatus });
}

export async function getAdminTrips(
  status?: string,
  page = 1,
  limit = 20,
): Promise<PaginatedResult<Trip>> {
  const { data } = await apiClient.get<PaginatedResult<Trip>>('/admin/trips', {
    params: { status, page, limit },
  });
  return data;
}

export async function getAdminWithdrawals(status?: WithdrawalStatus): Promise<AdminWithdrawalRow[]> {
  const { data } = await apiClient.get<AdminWithdrawalRow[]>('/admin/withdrawals', { params: { status } });
  return data;
}

export async function resolveWithdrawal(
  requestId: string,
  status: 'completed' | 'rejected',
): Promise<void> {
  await apiClient.patch(`/admin/withdrawals/${requestId}`, { status });
}

export async function getAdminIncidentReports(status?: IncidentReportStatus): Promise<AdminIncidentReportRow[]> {
  const { data } = await apiClient.get<AdminIncidentReportRow[]>('/admin/incident-reports', {
    params: { status },
  });
  return data;
}

export async function markIncidentReportReviewed(id: string): Promise<void> {
  await apiClient.patch(`/admin/incident-reports/${id}/review`);
}
