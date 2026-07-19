export interface CreateRatingPayload {
  tripId: string;
  ratedId: string;
  score: number;
  comment?: string;
}

export interface Rating {
  id: string;
  tripId: string;
  raterId: string;
  ratedId: string;
  score: number;
  comment: string | null;
  createdAt: string;
}
