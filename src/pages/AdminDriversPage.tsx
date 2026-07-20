import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { AdminDriverDetailModal } from '../components/AdminDriverDetailModal';
import { getAdminDrivers, updateDriverVerification } from '../api/admin';
import { translateDriverVerificationError } from '../api/adminErrorMessages';
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

export function AdminDriversPage() {
  const [status, setStatus] = useState<VerificationStatus>('pending');
  const [drivers, setDrivers] = useState<AdminDriverRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<AdminDriverRow | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  const fetchDrivers = useCallback((forStatus: VerificationStatus) => {
    getAdminDrivers(forStatus)
      .then(setDrivers)
      .catch(() => toast.error('No se pudo cargar la lista de conductores.'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchDrivers(status);
  }, [status, fetchDrivers]);

  function handleStatusChange(nextStatus: VerificationStatus) {
    setIsLoading(true);
    setStatus(nextStatus);
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

  return (
    <AdminLayout>
      <h1 className="mb-1 text-2xl font-bold text-gray-800">Conductores</h1>
      <p className="mb-6 text-sm text-gray-500">
        {isLoading ? 'Cargando...' : `${drivers.length} conductores ${STATUS_TABS.find((t) => t.value === status)?.label.toLowerCase()}`}
      </p>

      <div className="mb-4 flex gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => handleStatusChange(tab.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              status === tab.value ? 'bg-[#E8532E] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
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
              <th className="px-5 py-3">Vehículo</th>
              <th className="px-5 py-3">Placa</th>
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
            {!isLoading && drivers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                  No hay conductores en este estado.
                </td>
              </tr>
            )}
            {!isLoading && drivers.map((driver) => (
              <tr
                key={driver.id}
                onClick={() => setSelectedDriver(driver)}
                className="cursor-pointer border-b border-gray-50 last:border-0 hover:bg-gray-50"
              >
                <td className="px-5 py-3 font-medium text-gray-800">{driver.user.name}</td>
                <td className="px-5 py-3 text-gray-600">
                  {VEHICLE_TYPE_LABELS[driver.vehicleType]}
                  {driver.vehicles[0] && ` · ${driver.vehicles[0].brand} ${driver.vehicles[0].model}`}
                </td>
                <td className="px-5 py-3 text-gray-600">{driver.vehicles[0]?.plate ?? '—'}</td>
                <td className="px-5 py-3 text-gray-600">
                  {new Date(driver.user.createdAt).toLocaleDateString('es-HN')}
                </td>
                {status === 'pending' && (
                  <td className="px-5 py-3">
                    <div className="flex gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleResolve(driver.id, 'rejected')}
                        disabled={isResolving}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 disabled:opacity-50"
                      >
                        Rechazar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResolve(driver.id, 'approved')}
                        disabled={isResolving}
                        className="rounded-lg bg-[#2DBE87] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
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
