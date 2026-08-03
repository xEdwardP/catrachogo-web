import { X } from 'lucide-react';
import { INCIDENT_REPORT_CATEGORY_LABELS } from '../utils/incidentReportLabels';
import type { AdminIncidentReportRow } from '../types/incidentReport';

interface AdminIncidentReportDetailModalProps {
  report: AdminIncidentReportRow;
  isResolving: boolean;
  onMarkReviewed: () => void;
  onClose: () => void;
}

export function AdminIncidentReportDetailModal({
  report,
  isResolving,
  onMarkReviewed,
  onClose,
}: AdminIncidentReportDetailModalProps) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {INCIDENT_REPORT_CATEGORY_LABELS[report.category]}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(report.createdAt).toLocaleString('es-HN')}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-5 rounded-xl bg-cream p-4 dark:bg-gray-800">
          <p className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">DESCRIPCIÓN</p>
          <p className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-100">{report.description}</p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Reportado por</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{report.reporter.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Conductor reportado</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{report.reportedDriver?.name ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Viaje</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{report.trip?.destinationAddress ?? '—'}</p>
          </div>
        </div>

        {report.status === 'pending' ? (
          <button
            type="button"
            onClick={onMarkReviewed}
            disabled={isResolving}
            className="w-full rounded-lg bg-success py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Marcar revisado
          </button>
        ) : (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">Este reporte ya fue revisado.</p>
        )}
      </div>
    </div>
  );
}
