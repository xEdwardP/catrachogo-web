import { getAdminDrivers, getAdminTrips, getAdminWithdrawals } from './admin';
import type { Trip } from '../types/trip';

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

const DAILY_WINDOW_DAYS = 14;
const COMPLETED_SAMPLE_SIZE = 100;

function localDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function buildDailySeries(completedTrips: Trip[]): DailyCompletedPoint[] {
  const countsByDay = new Map<string, number>();
  for (const trip of completedTrips) {
    const completedAt = trip.completedAt ?? trip.requestedAt;
    if (!completedAt) continue;
    const key = localDateKey(new Date(completedAt));
    countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1);
  }

  const series: DailyCompletedPoint[] = [];
  const today = new Date();
  for (let offset = DAILY_WINDOW_DAYS - 1; offset >= 0; offset -= 1) {
    const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset);
    const key = localDateKey(day);
    series.push({
      date: key,
      label: day.toLocaleDateString('es-HN', { day: 'numeric', month: 'short' }),
      count: countsByDay.get(key) ?? 0,
    });
  }
  return series;
}

export async function getAdminStats(): Promise<AdminStats> {
  const [pending, accepted, inProgress, cancelled, completed, drivers, pendingWithdrawals] =
    await Promise.all([
      getAdminTrips('pending', 1, 1),
      getAdminTrips('accepted', 1, 1),
      getAdminTrips('in_progress', 1, 1),
      getAdminTrips('cancelled', 1, 1),
      getAdminTrips('completed', 1, COMPLETED_SAMPLE_SIZE),
      getAdminDrivers(),
      getAdminWithdrawals('pending'),
    ]);

  const todayKey = localDateKey(new Date());
  const completedToday = completed.data.filter((trip) => {
    const completedAt = trip.completedAt ?? trip.requestedAt;
    return completedAt ? localDateKey(new Date(completedAt)) === todayKey : false;
  });

  return {
    activeTrips: pending.total + accepted.total + inProgress.total,
    pendingTrips: pending.total,
    acceptedTrips: accepted.total,
    inProgressTrips: inProgress.total,
    completedTrips: completed.total,
    cancelledTrips: cancelled.total,
    totalTrips:
      pending.total + accepted.total + inProgress.total + completed.total + cancelled.total,
    tripsCompletedToday: completedToday.length,
    revenueToday: completedToday.reduce((sum, trip) => sum + trip.fare, 0),
    availableDrivers: drivers.filter((driver) => driver.available).length,
    pendingDrivers: drivers.filter((driver) => driver.verificationStatus === 'pending').length,
    pendingWithdrawals: pendingWithdrawals.length,
    dailyCompleted: buildDailySeries(completed.data),
  };
}
