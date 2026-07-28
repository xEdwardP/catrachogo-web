import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ArrowDown, ArrowUp, ArrowUpDown, Loader2, Search, Wallet } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { AdminWithdrawalDetailModal } from '../components/AdminWithdrawalDetailModal';
import { EmptyTableState } from '../components/EmptyTableState';
import { getAdminWithdrawals, resolveWithdrawal } from '../api/admin';
import { translateResolveWithdrawalError } from '../api/adminErrorMessages';
import type { AdminWithdrawalRow, WithdrawalStatus } from '../types/admin';

const STATUS_TABS: { value: WithdrawalStatus; label: string }[] = [
  { value: 'pending', label: 'Pendientes' },
  { value: 'completed', label: 'Completados' },
  { value: 'rejected', label: 'Rechazados' },
];

type SortField = 'amount' | 'date';
type SortDirection = 'asc' | 'desc';

const PAGE_SIZE = 20;

function SortableHeader({
  label,
  field,
  activeField,
  direction,
  onSort,
}: {
  label: string;
  field: SortField;
  activeField: SortField;
  direction: SortDirection;
  onSort: (field: SortField) => void;
}) {
  const isActive = activeField === field;
  const Icon = isActive ? (direction === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <th className="px-5 py-3">
      <button
        type="button"
        onClick={() => onSort(field)}
        className={`flex items-center gap-1 transition ${isActive ? 'text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}
      >
        {label}
        <Icon className="h-3 w-3" />
      </button>
    </th>
  );
}

export function AdminWithdrawalsPage() {
  const [status, setStatus] = useState<WithdrawalStatus>('pending');
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawalRow[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<AdminWithdrawalRow | null>(null);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const fetchWithdrawals = useCallback((forStatus: WithdrawalStatus, forPage: number) => {
    getAdminWithdrawals(forStatus, forPage, PAGE_SIZE)
      .then((result) => {
        setWithdrawals(result.data);
        setTotal(result.total);
      })
      .catch(() => toast.error('No se pudo cargar las solicitudes de retiro.'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchWithdrawals(status, page);
  }, [status, page, fetchWithdrawals]);

  function handleStatusChange(nextStatus: WithdrawalStatus) {
    setIsLoading(true);
    setSearch('');
    setPage(1);
    setStatus(nextStatus);
  }

  function goToPage(newPage: number) {
    setIsLoading(true);
    setPage(newPage);
  }

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }

  async function handleResolve(requestId: string, nextStatus: 'completed' | 'rejected') {
    setResolvingId(requestId);
    try {
      await resolveWithdrawal(requestId, nextStatus);
      toast.success(
        nextStatus === 'completed' ? 'Retiro marcado como completado.' : 'Retiro rechazado, saldo revertido.',
      );
      setWithdrawals((current) => current.filter((item) => item.id !== requestId));
      setSelectedWithdrawal((current) => (current?.id === requestId ? null : current));
    } catch (error) {
      toast.error(translateResolveWithdrawalError(error));
    } finally {
      setResolvingId(null);
    }
  }

  const visibleWithdrawals = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = query
      ? withdrawals.filter(
          (withdrawal) =>
            withdrawal.driver.user.name.toLowerCase().includes(query) ||
            withdrawal.paypalEmail.toLowerCase().includes(query),
        )
      : withdrawals;

    return [...filtered].sort((a, b) => {
      const comparison =
        sortField === 'amount'
          ? Number(a.amount) - Number(b.amount)
          : new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime();
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [withdrawals, search, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <AdminLayout>
      <h1 className="mb-1 text-2xl font-bold text-gray-800">Solicitudes de retiro</h1>
      <p className="mb-6 text-sm text-gray-500">
        Envíos manuales vía PayPal — marca como completado después de transferir directamente.
      </p>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
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
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por conductor o correo"
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 text-xs uppercase text-gray-400">
            <tr>
              <th className="px-5 py-3">Conductor</th>
              <th className="px-5 py-3">Correo PayPal</th>
              <SortableHeader
                label="Monto"
                field="amount"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <SortableHeader
                label="Fecha"
                field="date"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
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
            {!isLoading && visibleWithdrawals.length === 0 && withdrawals.length > 0 && (
              <EmptyTableState
                icon={Search}
                colSpan={5}
                title="Sin resultados"
                description="Ninguna solicitud coincide con tu búsqueda."
              />
            )}
            {!isLoading && withdrawals.length === 0 && (
              <EmptyTableState
                icon={Wallet}
                colSpan={5}
                title="No hay solicitudes en este estado"
                description="Las solicitudes de retiro de los conductores aparecerán aquí."
              />
            )}
            {!isLoading && visibleWithdrawals.map((withdrawal) => (
              <tr
                key={withdrawal.id}
                onClick={() => setSelectedWithdrawal(withdrawal)}
                className="cursor-pointer border-b border-gray-50 transition last:border-0 hover:bg-cream/50"
              >
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
                        onClick={(event) => {
                          event.stopPropagation();
                          handleResolve(withdrawal.id, 'rejected');
                        }}
                        disabled={resolvingId === withdrawal.id}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 disabled:opacity-50"
                      >
                        Rechazar
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleResolve(withdrawal.id, 'completed');
                        }}
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3 text-sm">
            <button
              type="button"
              onClick={() => goToPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="text-gray-600 disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="text-gray-400">
              Página {page} de {totalPages}
            </span>
            <button
              type="button"
              onClick={() => goToPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="text-gray-600 disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {selectedWithdrawal && (
        <AdminWithdrawalDetailModal
          withdrawal={selectedWithdrawal}
          isResolving={resolvingId === selectedWithdrawal.id}
          onResolve={(nextStatus) => handleResolve(selectedWithdrawal.id, nextStatus)}
          onClose={() => setSelectedWithdrawal(null)}
        />
      )}
    </AdminLayout>
  );
}
