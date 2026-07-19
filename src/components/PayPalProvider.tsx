import type { ReactNode } from 'react';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

export function PayPalProvider({ children }: { children: ReactNode }) {
  if (!paypalClientId) {
    return children;
  }
  return (
    <PayPalScriptProvider options={{ clientId: paypalClientId, currency: 'USD' }}>
      {children}
    </PayPalScriptProvider>
  );
}
