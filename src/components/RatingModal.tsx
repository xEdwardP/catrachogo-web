import { useState } from 'react';
import { Star, X } from 'lucide-react';
import { toast } from 'sonner';
import { createRating } from '../api/ratings';
import { translateCreateRatingError } from '../api/ratingErrorMessages';

interface RatingModalProps {
  tripId: string;
  ratedId: string;
  ratedName?: string;
  onDone: () => void;
}

export function RatingModal({ tripId, ratedId, ratedName, onDone }: RatingModalProps) {
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (score === 0) return;
    setIsSubmitting(true);
    try {
      await createRating({ tripId, ratedId, score, comment: comment.trim() || undefined });
      toast.success('¡Gracias por tu calificación!');
      onDone();
    } catch (error) {
      toast.error(translateCreateRatingError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSkip() {
    onDone();
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-900">
        <button
          type="button"
          onClick={handleSkip}
          aria-label="Cerrar"
          className="float-right text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="mb-1 text-lg font-semibold text-gray-800 dark:text-gray-100">¿Cómo estuvo tu viaje?</h2>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">Califica a {ratedName ?? 'tu conductor'}</p>

        <div className="mb-4 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button key={value} type="button" onClick={() => setScore(value)} aria-label={`${value} estrellas`}>
              <Star className={`h-8 w-8 ${value <= score ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
            </button>
          ))}
        </div>

        <label htmlFor="rating-comment" className="sr-only">
          Comentario (opcional)
        </label>
        <textarea
          id="rating-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Comentario (opcional)"
          rows={3}
          className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={score === 0 || isSubmitting}
          className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar calificación'}
        </button>
      </div>
    </div>
  );
}
