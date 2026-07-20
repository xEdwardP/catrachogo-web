export type VehicleType = 'car' | 'motorcycle';

export interface DriverVehicle {
  id: string;
  driverId: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  plate: string;
}

export interface DriverPublicProfile {
  id: string;
  userId: string;
  name: string;
  profilePhotoUrl: string | null;
  averageRating: number;
  vehicle: DriverVehicle | null;
}

export interface CompleteDriverProfilePayload {
  vehicleType: VehicleType;
  licenseNumber: string;
  vehicle: {
    brand: string;
    model: string;
    year: number;
    color: string;
    plate: string;
  };
  idFrontUrl: string;
  idBackUrl: string;
  vehicleRegistrationUrl: string;
  selfieWithIdUrl: string;
  profilePhotoUrl: string;
}

export interface DriverSummary {
  earningsToday: number;
  tripsToday: number;
  averageRating: number;
}

export interface PendingTripRequest {
  id: string;
  passengerName: string;
  originAddress: string;
  distanceKm: number;
  fare: number;
}
