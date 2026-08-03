import { X } from 'lucide-react';
import type { AdminWithdrawalRow } from '../types/admin';

const STATUS_LABELS: Record<AdminWithdrawalRow['status'], string> = {
  pending: 'Pendiente',
  completed: 'Completado',
  rejected: 'Rechazado',
};

interface AdminWithdrawalDetailModalProps {
  withdrawal: AdminWithdrawalRow;
  isResolving: boolean;
  onResolve: (status: 'completed' | 'rejected') => void;
  onClose: () => void;
}

export function AdminWithdrawalDetailModal({
  withdrawal,
  isResolving,
  onResolve,
  onClose,
}: AdminWithdrawalDetailModalProps) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{withdrawal.driver.user.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{withdrawal.paypalEmail}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 rounded-xl bg-cream p-4 text-sm dark:bg-gray-800">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Monto</p>
            <p className="font-semibold text-gray-800 dark:text-gray-100">L. {Number(withdrawal.amount).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Estado</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{STATUS_LABELS[withdrawal.status]}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Fecha solicitada</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">
              {new Date(withdrawal.requestedAt).toLocaleString('es-HN')}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Fecha resuelta</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">
              {withdrawal.resolvedAt ? new Date(withdrawal.resolvedAt).toLocaleString('es-HN') : '—'}
            </p>
          </div>
        </div>

        {withdrawal.status === 'pending' ? (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onResolve('rejected')}
              disabled={isResolving}
              className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-200"
            >
              Rechazar
            </button>
            <button
              type="button"
              onClick={() => onResolve('completed')}
              disabled={isResolving}
              className="flex-1 rounded-lg bg-success py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Marcar completado
            </button>
          </div>
        ) : (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Este retiro ya fue {withdrawal.status === 'completed' ? 'completado' : 'rechazado'}.
          </p>
        )}
      </div>
    </div>
  );
}
