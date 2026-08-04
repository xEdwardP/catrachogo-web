import { PayPalButtons } from '@paypal/react-paypal-js';
import { toast } from 'sonner';
import { confirmTopup, createTopupOrder } from '../api/wallet';
import { translateTopupConfirmError } from '../api/walletErrorMessages';

interface PayPalTopupButtonsProps {
  amount: number;
  onSuccess: (newBalance: number) => void;
}

export function PayPalTopupButtons({ amount, onSuccess }: PayPalTopupButtonsProps) {
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  if (!paypalClientId) {
    return (
      <button
        type="button"
        disabled
        title="Falta configurar VITE_PAYPAL_CLIENT_ID"
        className="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-50 py-2.5 text-sm text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500"
      >
        Recargar con PayPal (no configurado)
      </button>
    );
  }

  return (
    <>
      <PayPalButtons
        style={{ layout: 'horizontal', color: 'blue', label: 'pay', tagline: false }}
        forceReRender={[amount]}
        disabled={!amount || amount <= 0}
        createOrder={async () => {
          const { orderId } = await createTopupOrder(amount);
          return orderId;
        }}
        onApprove={async (data) => {
          try {
            const result = await confirmTopup(data.orderID);
            onSuccess(result.balance);
            toast.success('¡Recarga exitosa!');
          } catch {
            toast.error(translateTopupConfirmError());
          }
        }}
        onError={() => {
          toast.error('Ocurrió un error con PayPal. Intenta de nuevo.');
        }}
      />
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        La forma rápida y segura de pagar.
      </p>
    </>
  );
}
