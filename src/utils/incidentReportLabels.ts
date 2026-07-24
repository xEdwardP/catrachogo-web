import type { IncidentReportCategory } from '../types/incidentReport';

export const INCIDENT_REPORT_CATEGORY_LABELS: Record<IncidentReportCategory, string> = {
  safety: 'Seguridad',
  driver_behavior: 'Comportamiento del conductor',
  vehicle_condition: 'Estado del vehículo',
  payment: 'Cobro incorrecto',
  other: 'Otro',
};
