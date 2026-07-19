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
