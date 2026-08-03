import { X } from 'lucide-react';
import type { AdminDriverRow } from '../types/admin';

const VEHICLE_TYPE_LABELS: Record<string, string> = {
  car: 'Carro',
  motorcycle: 'Motocicleta',
};

interface AdminDriverDetailModalProps {
  driver: AdminDriverRow;
  isResolving: boolean;
  onApprove: () => void;
  onReject: () => void;
  onClose: () => void;
}

export function AdminDriverDetailModal({
  driver,
  isResolving,
  onApprove,
  onReject,
  onClose,
}: AdminDriverDetailModalProps) {
  const vehicle = driver.vehicles[0];

  const documents = [
    { label: 'Identidad (frente)', url: driver.idFrontUrl },
    { label: 'Identidad (reverso)', url: driver.idBackUrl },
    { label: 'Tarjeta de circulación', url: driver.vehicleRegistrationUrl },
    { label: 'Selfie con identidad', url: driver.selfieWithIdUrl },
  ];

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {driver.user.profilePhotoUrl ? (
              <img
                src={driver.user.profilePhotoUrl}
                alt={driver.user.name}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-lg font-semibold text-gray-400 dark:bg-gray-800 dark:text-gray-500">
                {driver.user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{driver.user.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{driver.user.email}</p>
              {driver.user.phone && <p className="text-sm text-gray-500 dark:text-gray-400">{driver.user.phone}</p>}
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3 rounded-xl bg-cream p-4 text-sm sm:grid-cols-4 dark:bg-gray-800">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Vehículo</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{VEHICLE_TYPE_LABELS[driver.vehicleType]}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Marca / modelo</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">
              {vehicle ? `${vehicle.brand} ${vehicle.model}` : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Placa</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{vehicle?.plate ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Licencia</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{driver.licenseNumber}</p>
          </div>
        </div>

        <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Documentos</p>
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {documents.map((doc) => (
            <a key={doc.label} href={doc.url} target="_blank" rel="noreferrer" className="block">
              <img
                src={doc.url}
                alt={doc.label}
                className="mb-1 h-24 w-full rounded-lg border border-gray-200 object-cover dark:border-gray-700"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">{doc.label}</p>
            </a>
          ))}
        </div>

        {driver.verificationStatus === 'pending' ? (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onReject}
              disabled={isResolving}
              className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-200"
            >
              Rechazar
            </button>
            <button
              type="button"
              onClick={onApprove}
              disabled={isResolving}
              className="flex-1 rounded-lg bg-success py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Aprobar
            </button>
          </div>
        ) : (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Este conductor ya fue {driver.verificationStatus === 'approved' ? 'aprobado' : 'rechazado'}.
          </p>
        )}
      </div>
    </div>
  );
}
