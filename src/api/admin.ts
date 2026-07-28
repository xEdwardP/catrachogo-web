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

export async function getAdminDrivers(
  status?: VerificationStatus,
  page = 1,
  limit = 20,
): Promise<PaginatedResult<AdminDriverRow>> {
  const { data } = await apiClient.get<PaginatedResult<AdminDriverRow>>('/admin/drivers', {
    params: { status, page, limit },
  });
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

export async function getAdminWithdrawals(
  status?: WithdrawalStatus,
  page = 1,
  limit = 20,
): Promise<PaginatedResult<AdminWithdrawalRow>> {
  const { data } = await apiClient.get<PaginatedResult<AdminWithdrawalRow>>('/admin/withdrawals', {
    params: { status, page, limit },
  });
  return data;
}

export async function resolveWithdrawal(
  requestId: string,
  status: 'completed' | 'rejected',
): Promise<void> {
  await apiClient.patch(`/admin/withdrawals/${requestId}`, { status });
}

export async function getAdminIncidentReports(
  status?: IncidentReportStatus,
  page = 1,
  limit = 20,
): Promise<PaginatedResult<AdminIncidentReportRow>> {
  const { data } = await apiClient.get<PaginatedResult<AdminIncidentReportRow>>('/admin/incident-reports', {
    params: { status, page, limit },
  });
  return data;
}

export async function markIncidentReportReviewed(id: string): Promise<void> {
  await apiClient.patch(`/admin/incident-reports/${id}/review`);
}
