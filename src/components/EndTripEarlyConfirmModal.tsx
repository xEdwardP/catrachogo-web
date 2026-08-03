import { AlertTriangle, X } from 'lucide-react';

interface EndTripEarlyConfirmModalProps {
  isSubmitting: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}

export function EndTripEarlyConfirmModal({ isSubmitting, onConfirm, onDismiss }: EndTripEarlyConfirmModalProps) {
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

        <h2 className="mb-1 text-lg font-semibold text-gray-800 dark:text-gray-100">¿Finalizar el viaje aquí?</h2>
        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
          Se te cobrará una tarifa proporcional a la distancia recorrida hasta este punto, no la tarifa completa del
          viaje original.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onDismiss}
            disabled={isSubmitting}
            className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:text-gray-200"
          >
            Continuar viaje
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 rounded-lg bg-brand py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Finalizando...' : 'Sí, finalizar'}
          </button>
        </div>
      </div>
    </div>
  );
}
