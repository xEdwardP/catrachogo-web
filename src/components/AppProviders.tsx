import type { ReactNode } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export function AppProviders({ children }: { children: ReactNode }) {
  if (!googleClientId) {
    return children;
  }
  return <GoogleOAuthProvider clientId={googleClientId}>{children}</GoogleOAuthProvider>;
}
