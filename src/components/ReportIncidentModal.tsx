import { useState } from 'react';
import { X } from 'lucide-react';
import { INCIDENT_REPORT_CATEGORY_LABELS } from '../utils/incidentReportLabels';
import type { IncidentReportCategory } from '../types/incidentReport';

const CATEGORY_OPTIONS: IncidentReportCategory[] = [
  'safety',
  'driver_behavior',
  'vehicle_condition',
  'payment',
  'other',
];

interface ReportIncidentModalProps {
  isSubmitting: boolean;
  onSubmit: (payload: { category: IncidentReportCategory; description: string }) => void;
  onDismiss: () => void;
}

export function ReportIncidentModal({ isSubmitting, onSubmit, onDismiss }: ReportIncidentModalProps) {
  const [category, setCategory] = useState<IncidentReportCategory>('safety');
  const [description, setDescription] = useState('');

  const canSubmit = description.trim().length >= 10;

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit({ category, description: description.trim() });
  }

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

        <h2 className="mb-1 text-lg font-semibold text-gray-800 dark:text-gray-100">Reportar un problema</h2>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Tu reporte queda en cola para revisión de administración. No se le notifica al conductor.
        </p>

        <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">CATEGORÍA</p>
        <div className="mb-4 flex flex-col gap-2">
          {CATEGORY_OPTIONS.map((value) => (
            <label
              key={value}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 has-[:checked]:border-brand has-[:checked]:bg-brand-pale dark:border-gray-700 dark:text-gray-200 dark:has-[:checked]:bg-brand/15"
            >
              <input
                type="radio"
                name="incident-category"
                value={value}
                checked={category === value}
                onChange={() => setCategory(value)}
                className="accent-brand"
              />
              {INCIDENT_REPORT_CATEGORY_LABELS[value]}
            </label>
          ))}
        </div>

        <div className="mb-5">
          <label htmlFor="incident-description" className="mb-1 block text-xs font-semibold text-gray-500 dark:text-gray-400">
            DESCRIPCIÓN
          </label>
          <textarea
            id="incident-description"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Cuéntanos qué pasó..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onDismiss}
            disabled={isSubmitting}
            className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:text-gray-200"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="flex-1 rounded-lg bg-brand py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar reporte'}
          </button>
        </div>
      </div>
    </div>
  );
}
