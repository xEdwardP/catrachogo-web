import type { VehicleType } from './driver';

export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type WithdrawalStatus = 'pending' | 'completed' | 'rejected';

export interface AdminDriverRow {
  id: string;
  userId: string;
  vehicleType: VehicleType;
  licenseNumber: string;
  verificationStatus: VerificationStatus;
  averageRating: string | number | null;
  available: boolean;
  approvedAt: string | null;
  idFrontUrl: string;
  idBackUrl: string;
  vehicleRegistrationUrl: string;
  selfieWithIdUrl: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    profilePhotoUrl: string | null;
    createdAt: string;
  };
  vehicles: {
    id: string;
    brand: string;
    model: string;
    year: number;
    color: string;
    plate: string;
  }[];
}

export interface AdminWithdrawalRow {
  id: string;
  driverId: string;
  paypalEmail: string;
  amount: string | number;
  status: WithdrawalStatus;
  requestedAt: string;
  resolvedAt: string | null;
  driver: {
    id: string;
    user: {
      id: string;
      name: string;
    };
  };
}
