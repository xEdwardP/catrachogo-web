import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Flag, Loader2 } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { AdminIncidentReportDetailModal } from '../components/AdminIncidentReportDetailModal';
import { EmptyTableState } from '../components/EmptyTableState';
import { getAdminIncidentReports, markIncidentReportReviewed } from '../api/admin';
import { INCIDENT_REPORT_CATEGORY_LABELS } from '../utils/incidentReportLabels';
import type { AdminIncidentReportRow, IncidentReportStatus } from '../types/incidentReport';

const STATUS_TABS: { value: IncidentReportStatus; label: string }[] = [
  { value: 'pending', label: 'Pendientes' },
  { value: 'reviewed', label: 'Revisados' },
];

const PAGE_SIZE = 10;

export function AdminIncidentReportsPage() {
  const [status, setStatus] = useState<IncidentReportStatus>('pending');
  const [reports, setReports] = useState<AdminIncidentReportRow[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<AdminIncidentReportRow | null>(null);

  const fetchReports = useCallback((forStatus: IncidentReportStatus, forPage: number) => {
    getAdminIncidentReports(forStatus, forPage, PAGE_SIZE)
      .then((result) => {
        setReports(result.data);
        setTotal(result.total);
      })
      .catch(() => toast.error('No se pudo cargar los reportes.'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchReports(status, page);
  }, [status, page, fetchReports]);

  function handleStatusChange(nextStatus: IncidentReportStatus) {
    setIsLoading(true);
    setPage(1);
    setStatus(nextStatus);
  }

  function goToPage(newPage: number) {
    setIsLoading(true);
    setPage(newPage);
  }

  async function handleMarkReviewed(id: string) {
    setResolvingId(id);
    try {
      await markIncidentReportReviewed(id);
      toast.success('Reporte marcado como revisado.');
      setReports((current) => current.filter((report) => report.id !== id));
      setSelectedReport((current) => (current?.id === id ? null : current));
    } catch {
      toast.error('No se pudo actualizar el reporte. Intenta de nuevo.');
    } finally {
      setResolvingId(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <AdminLayout>
      <h1 className="mb-1 text-2xl font-bold text-gray-800 dark:text-gray-100">Reportes de incidencias</h1>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Reportes enviados por pasajeros sobre un viaje o conductor.</p>

      <div className="mb-4 flex flex-wrap gap-2">
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

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-gray-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 text-xs uppercase text-gray-400 dark:border-gray-800 dark:text-gray-500">
            <tr>
              <th className="px-5 py-3">Categoría</th>
              <th className="px-5 py-3">Descripción</th>
              <th className="px-5 py-3">Viaje</th>
              <th className="px-5 py-3">Reportado por</th>
              <th className="px-5 py-3">Conductor</th>
              <th className="px-5 py-3">Fecha</th>
              {status === 'pending' && <th className="px-5 py-3">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-gray-400 dark:text-gray-500">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            )}
            {!isLoading && reports.length === 0 && (
              <EmptyTableState
                icon={Flag}
                colSpan={7}
                title="No hay reportes en este estado"
                description="Los reportes de pasajeros aparecerán aquí."
              />
            )}
            {!isLoading &&
              reports.map((report) => (
                <tr
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className="cursor-pointer border-b border-gray-50 transition last:border-0 hover:bg-cream/50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                >
                  <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{INCIDENT_REPORT_CATEGORY_LABELS[report.category]}</td>
                  <td className="max-w-[280px] truncate px-5 py-3 text-gray-600 dark:text-gray-300">{report.description}</td>
                  <td className="max-w-[160px] truncate px-5 py-3 text-gray-600 dark:text-gray-300">
                    {report.trip?.destinationAddress ?? '—'}
                  </td>
                  <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{report.reporter.name}</td>
                  <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{report.reportedDriver?.name ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-600 dark:text-gray-300">
                    {new Date(report.createdAt).toLocaleDateString('es-HN')}
                  </td>
                  {status === 'pending' && (
                    <td className="px-5 py-3">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleMarkReviewed(report.id);
                        }}
                        disabled={resolvingId === report.id}
                        className="rounded-lg bg-success px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        Marcar revisado
                      </button>
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

      {selectedReport && (
        <AdminIncidentReportDetailModal
          report={selectedReport}
          isResolving={resolvingId === selectedReport.id}
          onMarkReviewed={() => handleMarkReviewed(selectedReport.id)}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </AdminLayout>
  );
}
