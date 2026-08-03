import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowDown, ArrowUp, ArrowUpDown, Loader2, Search, Users } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { AdminDriverDetailModal } from '../components/AdminDriverDetailModal';
import { EmptyTableState } from '../components/EmptyTableState';
import { getAdminDrivers, updateDriverVerification } from '../api/admin';
import { translateDriverVerificationError } from '../api/adminErrorMessages';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import type { AdminDriverRow, VerificationStatus } from '../types/admin';

const STATUS_TABS: { value: VerificationStatus; label: string }[] = [
  { value: 'pending', label: 'Pendientes' },
  { value: 'approved', label: 'Aprobados' },
  { value: 'rejected', label: 'Rechazados' },
];

const VEHICLE_TYPE_LABELS: Record<string, string> = {
  car: 'Carro',
  motorcycle: 'Motocicleta',
};

const PAGE_SIZE = 10;

type SortField = 'name' | 'date';
type SortDirection = 'asc' | 'desc';

function parseStatusParam(value: string | null): VerificationStatus {
  return value && STATUS_TABS.some((tab) => tab.value === value)
    ? (value as VerificationStatus)
    : 'pending';
}

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
        className={`flex items-center gap-1 transition ${isActive ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'}`}
      >
        {label}
        <Icon className="h-3 w-3" />
      </button>
    </th>
  );
}

export function AdminDriversPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = parseStatusParam(searchParams.get('status'));
  const [drivers, setDrivers] = useState<AdminDriverRow[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<AdminDriverRow | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const debouncedSearch = useDebouncedValue(search, 350);

  const fetchDrivers = useCallback((forStatus: VerificationStatus, forPage: number, forSearch: string) => {
    getAdminDrivers(forStatus, forPage, PAGE_SIZE, forSearch)
      .then((result) => {
        setDrivers(result.data);
        setTotal(result.total);
      })
      .catch(() => toast.error('No se pudo cargar la lista de conductores.'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchDrivers(status, page, debouncedSearch);
  }, [status, page, debouncedSearch, fetchDrivers]);

  function handleStatusChange(nextStatus: VerificationStatus) {
    setIsLoading(true);
    setSearch('');
    setPage(1);
    setSearchParams({ status: nextStatus }, { replace: true });
  }

  function handleSearchChange(value: string) {
    setIsLoading(true);
    setSearch(value);
    setPage(1);
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

  async function handleResolve(driverId: string, verificationStatus: 'approved' | 'rejected') {
    setIsResolving(true);
    try {
      await updateDriverVerification(driverId, verificationStatus);
      toast.success(
        verificationStatus === 'approved' ? 'Conductor aprobado.' : 'Conductor rechazado.',
      );
      setSelectedDriver(null);
      setDrivers((current) => current.filter((driver) => driver.id !== driverId));
    } catch {
      toast.error(translateDriverVerificationError());
    } finally {
      setIsResolving(false);
    }
  }

  const isSearching = search.trim().length > 0;

  const visibleDrivers = useMemo(() => {
    return [...drivers].sort((a, b) => {
      const comparison =
        sortField === 'name'
          ? a.user.name.localeCompare(b.user.name)
          : new Date(a.user.createdAt).getTime() - new Date(b.user.createdAt).getTime();
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [drivers, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <AdminLayout>
      <h1 className="mb-1 text-2xl font-bold text-gray-800 dark:text-gray-100">Conductores</h1>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        {isLoading
          ? 'Cargando...'
          : isSearching
            ? `${total} resultados`
            : `${total} conductores ${STATUS_TABS.find((t) => t.value === status)?.label.toLowerCase()}`}
      </p>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => handleStatusChange(tab.value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                status === tab.value ? 'bg-brand text-white' : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="search"
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Buscar por nombre o placa"
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-gray-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 text-xs uppercase text-gray-400 dark:border-gray-800 dark:text-gray-500">
            <tr>
              <SortableHeader
                label="Conductor"
                field="name"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <th className="px-5 py-3">Vehículo</th>
              <th className="px-5 py-3">Placa</th>
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
                <td colSpan={5} className="px-5 py-8 text-center text-gray-400 dark:text-gray-500">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            )}
            {!isLoading && visibleDrivers.length === 0 && isSearching && (
              <EmptyTableState
                icon={Search}
                colSpan={5}
                title="Sin resultados"
                description="Ningún conductor coincide con tu búsqueda."
              />
            )}
            {!isLoading && visibleDrivers.length === 0 && !isSearching && (
              <EmptyTableState
                icon={Users}
                colSpan={5}
                title="No hay conductores en este estado"
                description="Cuando haya movimiento en esta categoría, aparecerá aquí."
              />
            )}
            {!isLoading && visibleDrivers.map((driver) => (
              <tr
                key={driver.id}
                onClick={() => setSelectedDriver(driver)}
                className="cursor-pointer border-b border-gray-50 transition last:border-0 hover:bg-cream/50 dark:border-gray-800 dark:hover:bg-gray-800/50"
              >
                <td className="px-5 py-3 font-medium text-gray-800 dark:text-gray-100">{driver.user.name}</td>
                <td className="px-5 py-3 text-gray-600 dark:text-gray-300">
                  {VEHICLE_TYPE_LABELS[driver.vehicleType]}
                  {driver.vehicles[0] && ` · ${driver.vehicles[0].brand} ${driver.vehicles[0].model}`}
                </td>
                <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{driver.vehicles[0]?.plate ?? '—'}</td>
                <td className="px-5 py-3 text-gray-600 dark:text-gray-300">
                  {new Date(driver.user.createdAt).toLocaleDateString('es-HN')}
                </td>
                {status === 'pending' && (
                  <td className="px-5 py-3">
                    <div className="flex gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleResolve(driver.id, 'rejected')}
                        disabled={isResolving}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200"
                      >
                        Rechazar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResolve(driver.id, 'approved')}
                        disabled={isResolving}
                        className="rounded-lg bg-success px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        Aprobar
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3 text-sm dark:border-gray-800">
            <button
              type="button"
              onClick={() => goToPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="text-gray-600 disabled:opacity-40 dark:text-gray-300"
            >
              Anterior
            </button>
            <span className="text-gray-400 dark:text-gray-500">
              Página {page} de {totalPages}
            </span>
            <button
              type="button"
              onClick={() => goToPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="text-gray-600 disabled:opacity-40 dark:text-gray-300"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {selectedDriver && (
        <AdminDriverDetailModal
          driver={selectedDriver}
          isResolving={isResolving}
          onApprove={() => handleResolve(selectedDriver.id, 'approved')}
          onReject={() => handleResolve(selectedDriver.id, 'rejected')}
          onClose={() => setSelectedDriver(null)}
        />
      )}
    </AdminLayout>
  );
}
