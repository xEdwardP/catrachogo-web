import { Loader2 } from 'lucide-react';

export function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <Loader2 className="h-8 w-8 animate-spin text-brand" aria-label="Cargando" />
    </div>
  );
}
