import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { getAdminWithdrawals, resolveWithdrawal } from '../api/admin';
import { translateResolveWithdrawalError } from '../api/adminErrorMessages';
import type { AdminWithdrawalRow, WithdrawalStatus } from '../types/admin';

const STATUS_TABS: { value: WithdrawalStatus; label: string }[] = [
  { value: 'pending', label: 'Pendientes' },
  { value: 'completed', label: 'Completados' },
  { value: 'rejected', label: 'Rechazados' },
];

export function AdminWithdrawalsPage() {
  const [status, setStatus] = useState<WithdrawalStatus>('pending');
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawalRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const fetchWithdrawals = useCallback((forStatus: WithdrawalStatus) => {
    getAdminWithdrawals(forStatus)
      .then(setWithdrawals)
      .catch(() => toast.error('No se pudo cargar las solicitudes de retiro.'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchWithdrawals(status);
  }, [status, fetchWithdrawals]);

  function handleStatusChange(nextStatus: WithdrawalStatus) {
    setIsLoading(true);
    setStatus(nextStatus);
  }

  async function handleResolve(requestId: string, nextStatus: 'completed' | 'rejected') {
    setResolvingId(requestId);
    try {
      await resolveWithdrawal(requestId, nextStatus);
      toast.success(
        nextStatus === 'completed' ? 'Retiro marcado como completado.' : 'Retiro rechazado, saldo revertido.',
      );
      setWithdrawals((current) => current.filter((item) => item.id !== requestId));
    } catch (error) {
      toast.error(translateResolveWithdrawalError(error));
    } finally {
      setResolvingId(null);
    }
  }

  return (
    <AdminLayout>
      <h1 className="mb-1 text-2xl font-bold text-gray-800">Solicitudes de retiro</h1>
      <p className="mb-6 text-sm text-gray-500">
        Envíos manuales vía PayPal — marca como completado después de transferir directamente.
      </p>

      <div className="mb-4 flex gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => handleStatusChange(tab.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              status === tab.value ? 'bg-brand text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 text-xs uppercase text-gray-400">
            <tr>
              <th className="px-5 py-3">Conductor</th>
              <th className="px-5 py-3">Correo PayPal</th>
              <th className="px-5 py-3">Monto</th>
              <th className="px-5 py-3">Fecha</th>
              {status === 'pending' && <th className="px-5 py-3">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            )}
            {!isLoading && withdrawals.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                  No hay solicitudes en este estado.
                </td>
              </tr>
            )}
            {!isLoading && withdrawals.map((withdrawal) => (
              <tr key={withdrawal.id} className="border-b border-gray-50 transition last:border-0 hover:bg-cream/50">
                <td className="px-5 py-3 font-medium text-gray-800">{withdrawal.driver.user.name}</td>
                <td className="px-5 py-3 text-gray-600">{withdrawal.paypalEmail}</td>
                <td className="px-5 py-3 font-semibold text-gray-800">
                  L. {Number(withdrawal.amount).toFixed(2)}
                </td>
                <td className="px-5 py-3 text-gray-600">
                  {new Date(withdrawal.requestedAt).toLocaleDateString('es-HN')}
                </td>
                {status === 'pending' && (
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleResolve(withdrawal.id, 'rejected')}
                        disabled={resolvingId === withdrawal.id}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 disabled:opacity-50"
                      >
                        Rechazar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResolve(withdrawal.id, 'completed')}
                        disabled={resolvingId === withdrawal.id}
                        className="rounded-lg bg-success px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        Marcar completado
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
