import { AlertTriangle, X } from 'lucide-react';
import { CANCELLATION_FEE_AMOUNT } from '../utils/cancellationFee';

interface CancelTripConfirmModalProps {
  isSubmitting: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}

export function CancelTripConfirmModal({ isSubmitting, onConfirm, onDismiss }: CancelTripConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Cerrar"
          className="float-right text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-brand-pale">
          <AlertTriangle className="h-5 w-5 text-brand" />
        </div>

        <h2 className="mb-1 text-lg font-semibold text-gray-800">¿Cancelar este viaje?</h2>
        <p className="mb-5 text-sm text-gray-500">
          El conductor ya va en camino a recogerte. Si cancelas ahora, se aplicará un cargo de{' '}
          <span className="font-semibold text-gray-700">L. {CANCELLATION_FEE_AMOUNT.toFixed(2)}</span> a tu wallet
          como compensación para el conductor.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onDismiss}
            disabled={isSubmitting}
            className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Mantener viaje
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 rounded-lg bg-brand py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Cancelando...' : 'Sí, cancelar'}
          </button>
        </div>
      </div>
    </div>
  );
}
