export type UserRole = 'passenger' | 'driver' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  createdAt?: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    role: UserRole;
  };
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'passenger' | 'driver';
}

export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  token: string;
}

export interface GoogleAuthResponse {
  token: string;
}
