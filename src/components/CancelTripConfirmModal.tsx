import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { CANCELLATION_FEE_AMOUNT } from '../utils/cancellationFee';
import { CANCELLATION_REASON_LABELS, PASSENGER_CANCELLATION_REASONS } from '../utils/cancellationReasonLabels';
import type { CancellationReason } from '../types/trip';

interface CancelTripConfirmModalProps {
  isSubmitting: boolean;
  chargesFee: boolean;
  onConfirm: (reason: CancellationReason) => void;
  onDismiss: () => void;
}

export function CancelTripConfirmModal({ isSubmitting, chargesFee, onConfirm, onDismiss }: CancelTripConfirmModalProps) {
  const [reason, setReason] = useState<CancellationReason | null>(null);

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-900">
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Cerrar"
          className="float-right text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-brand-pale dark:bg-brand/15">
          <AlertTriangle className="h-5 w-5 text-brand" />
        </div>

        <h2 className="mb-1 text-lg font-semibold text-gray-800 dark:text-gray-100">¿Cancelar este viaje?</h2>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          {chargesFee ? (
            <>
              El conductor ya va en camino a recogerte. Si cancelas ahora, se aplicará un cargo de{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-200">L. {CANCELLATION_FEE_AMOUNT.toFixed(2)}</span> a tu
              wallet como compensación para el conductor.
            </>
          ) : (
            'Todavía no se te ha asignado un conductor, así que esta cancelación es gratuita.'
          )}
        </p>

        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">¿Por qué cancelas? (opcional)</p>
          <button
            type="button"
            onClick={() => onConfirm('other')}
            disabled={isSubmitting}
            className="text-xs font-medium text-gray-400 underline hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-60 dark:text-gray-500 dark:hover:text-gray-300"
          >
            Omitir
          </button>
        </div>
        <div className="mb-5 flex flex-col gap-2">
          {PASSENGER_CANCELLATION_REASONS.map((value) => (
            <label
              key={value}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 has-[:checked]:border-brand has-[:checked]:bg-brand-pale dark:border-gray-700 dark:text-gray-200 dark:has-[:checked]:bg-brand/15"
            >
              <input
                type="radio"
                name="cancellation-reason"
                value={value}
                checked={reason === value}
                onChange={() => setReason(value)}
                className="accent-brand"
              />
              {CANCELLATION_REASON_LABELS[value]}
            </label>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onDismiss}
            disabled={isSubmitting}
            className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:text-gray-200"
          >
            Mantener viaje
          </button>
          <button
            type="button"
            onClick={() => reason && onConfirm(reason)}
            disabled={isSubmitting || !reason}
            className="flex-1 rounded-lg bg-brand py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Cancelando...' : 'Sí, cancelar'}
          </button>
        </div>
      </div>
    </div>
  );
}
