import { createContext } from 'react';
import type { AuthUser, RegisterPayload } from '../types/auth';

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithPassword: (email: string, password: string) => Promise<AuthUser>;
  registerAccount: (payload: RegisterPayload) => Promise<AuthUser>;
  loginWithGoogleToken: (idToken: string) => Promise<AuthUser>;
  completePhone: (phone: string) => Promise<AuthUser>;
  updateName: (name: string) => Promise<AuthUser>;
  updateProfilePhoto: (profilePhotoUrl: string) => Promise<AuthUser>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
