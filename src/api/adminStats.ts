import { getAdminDashboardStats } from './admin';

export interface DailyCompletedPoint {
  date: string;
  label: string;
  count: number;
}

export interface AdminStats {
  activeTrips: number;
  pendingTrips: number;
  acceptedTrips: number;
  inProgressTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  totalTrips: number;
  tripsCompletedToday: number;
  revenueToday: number;
  availableDrivers: number;
  pendingDrivers: number;
  pendingWithdrawals: number;
  dailyCompleted: DailyCompletedPoint[];
}

function parseDateOnly(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export async function getAdminStats(): Promise<AdminStats> {
  const raw = await getAdminDashboardStats();
  const { pending, accepted, in_progress: inProgress, completed, cancelled } = raw.tripsByStatus;

  return {
    activeTrips: pending + accepted + inProgress,
    pendingTrips: pending,
    acceptedTrips: accepted,
    inProgressTrips: inProgress,
    completedTrips: completed,
    cancelledTrips: cancelled,
    totalTrips: pending + accepted + inProgress + completed + cancelled,
    tripsCompletedToday: raw.tripsCompletedToday,
    revenueToday: raw.revenueToday,
    availableDrivers: raw.availableDrivers,
    pendingDrivers: raw.pendingDrivers,
    pendingWithdrawals: raw.pendingWithdrawals,
    dailyCompleted: raw.dailyCompleted.map((point) => ({
      date: point.date,
      label: parseDateOnly(point.date).toLocaleDateString('es-HN', { day: 'numeric', month: 'short' }),
      count: point.tripsCompleted,
    })),
  };
}
