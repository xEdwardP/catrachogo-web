import { apiClient } from './client';
import type { CreateIncidentReportPayload } from '../types/incidentReport';

export async function createIncidentReport(payload: CreateIncidentReportPayload): Promise<{ id: string }> {
  const { data } = await apiClient.post<{ id: string }>('/incident-reports', payload);
  return data;
}
