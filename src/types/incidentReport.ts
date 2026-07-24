export type IncidentReportCategory = 'safety' | 'driver_behavior' | 'vehicle_condition' | 'payment' | 'other';
export type IncidentReportStatus = 'pending' | 'reviewed';

export interface CreateIncidentReportPayload {
  tripId: string;
  category: IncidentReportCategory;
  description: string;
}

export interface AdminIncidentReportRow {
  id: string;
  category: IncidentReportCategory;
  description: string;
  status: IncidentReportStatus;
  createdAt: string;
  tripId: string | null;
  trip: { destinationAddress: string } | null;
  reporter: { id: string; name: string };
  reportedDriver: { id: string; name: string } | null;
}
