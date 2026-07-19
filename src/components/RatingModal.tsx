import { useState } from 'react';
import { Star, X } from 'lucide-react';
import { toast } from 'sonner';
import { createRating } from '../api/ratings';

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
    } catch {
      toast.error('No se pudo enviar la calificación. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSkip() {
    onDone();
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
        <button
          type="button"
          onClick={handleSkip}
          aria-label="Cerrar"
          className="float-right text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="mb-1 text-lg font-semibold text-gray-800">¿Cómo estuvo tu viaje?</h2>
        <p className="mb-4 text-sm text-gray-500">Califica a {ratedName ?? 'tu conductor'}</p>

        <div className="mb-4 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button key={value} type="button" onClick={() => setScore(value)} aria-label={`${value} estrellas`}>
              <Star className={`h-8 w-8 ${value <= score ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Comentario (opcional)"
          rows={3}
          className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#E8532E] focus:outline-none focus:ring-1 focus:ring-[#E8532E]"
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={score === 0 || isSubmitting}
          className="w-full rounded-lg bg-[#E8532E] py-2.5 text-sm font-semibold text-white transition hover:bg-[#d1471f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar calificación'}
        </button>
      </div>
    </div>
  );
}
