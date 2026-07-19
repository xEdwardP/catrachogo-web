import type { DriverVehicle } from './driver';

export type TripStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export interface FareEstimate {
  distanceKm: number;
  fare: number;
}

export interface CreateTripPayload {
  originLat: number;
  originLng: number;
  originAddress: string;
  destinationLat: number;
  destinationLng: number;
  destinationAddress: string;
}

export interface Trip {
  id: string;
  status: TripStatus;
  fare: number;
  distanceKm: number;
  originAddress?: string;
  destinationAddress?: string;
  originLat?: number;
  originLng?: number;
  destinationLat?: number;
  destinationLng?: number;
  driverId?: string | null;
  passengerId?: string;
  requestedAt?: string;
  startedAt?: string | null;
  completedAt?: string | null;
  ratedByMe?: boolean;
}

export interface TripDriverInfo {
  id: string;
  userId: string;
  name: string;
  profilePhotoUrl: string | null;
  averageRating: number;
  vehicle: DriverVehicle | null;
}

export interface TripDetail {
  id: string;
  status: TripStatus;
  fare: number;
  distanceKm: number;
  originAddress: string;
  originLat: number;
  originLng: number;
  destinationAddress: string;
  destinationLat: number;
  destinationLng: number;
  driverId: string | null;
  ratedByMe: boolean;
  driverPhone?: string | null;
  passengerPhone?: string | null;
  driver?: TripDriverInfo;
}

export interface DriverLocation {
  lat: number;
  lng: number;
  recordedAt: string;
}
