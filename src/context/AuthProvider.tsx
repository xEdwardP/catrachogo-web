import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import {
  getProfile,
  login as loginRequest,
  loginWithGoogle as loginWithGoogleRequest,
  register as registerRequest,
  updateName as updateNameRequest,
  updatePhone as updatePhoneRequest,
  updateProfilePhoto as updateProfilePhotoRequest,
} from '../api/auth';
import { clearStoredToken, getStoredToken, setStoredToken } from '../api/tokenStorage';
import { onSessionExpired } from '../api/sessionEvents';
import type { AuthUser, RegisterPayload } from '../types/auth';
import { AuthContext } from './AuthContext';
import type { AuthContextValue } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(() => getStoredToken() !== null);

  useEffect(() => {
    if (!getStoredToken()) {
      return;
    }
    getProfile()
      .then(setUser)
      .catch(() => {
        clearStoredToken();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    return onSessionExpired(() => {
      setUser(null);
      toast.error('Tu sesión expiró. Inicia sesión de nuevo.');
    });
  }, []);

  async function loginWithPassword(email: string, password: string): Promise<AuthUser> {
    const { token } = await loginRequest(email, password);
    setStoredToken(token);
    const profile = await getProfile();
    setUser(profile);
    return profile;
  }

  async function registerAccount(payload: RegisterPayload): Promise<AuthUser> {
    const { token } = await registerRequest(payload);
    setStoredToken(token);
    const profile = await getProfile();
    setUser(profile);
    return profile;
  }

  async function loginWithGoogleToken(idToken: string): Promise<AuthUser> {
    const { token } = await loginWithGoogleRequest(idToken);
    setStoredToken(token);
    const profile = await getProfile();
    setUser(profile);
    return profile;
  }

  async function completePhone(phone: string): Promise<AuthUser> {
    await updatePhoneRequest(phone);
    const profile = await getProfile();
    setUser(profile);
    return profile;
  }

  async function updateName(name: string): Promise<AuthUser> {
    await updateNameRequest(name);
    const profile = await getProfile();
    setUser(profile);
    return profile;
  }

  async function updateProfilePhoto(profilePhotoUrl: string): Promise<AuthUser> {
    await updateProfilePhotoRequest(profilePhotoUrl);
    const profile = await getProfile();
    setUser(profile);
    return profile;
  }

  function logout() {
    clearStoredToken();
    setUser(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      loginWithPassword,
      registerAccount,
      loginWithGoogleToken,
      completePhone,
      updateName,
      updateProfilePhoto,
      logout,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
