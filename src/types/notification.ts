export type NotificationType =
  | 'trip_accepted'
  | 'trip_started'
  | 'trip_completed'
  | 'trip_cancelled'
  | 'withdrawal_resolved'
  | 'driver_verification_updated'
  | 'rating_received';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  relatedTripId: string | null;
  read: boolean;
  createdAt: string;
}
