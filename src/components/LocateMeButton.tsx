import { Loader2, LocateFixed } from 'lucide-react';

interface LocateMeButtonProps {
  isLoading: boolean;
  onClick: () => void;
  className?: string;
}

export function LocateMeButton({ isLoading, onClick, className = '' }: LocateMeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      aria-label="Usar mi ubicación actual"
      title="Usar mi ubicación actual"
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-brand shadow-md hover:bg-brand-pale disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LocateFixed className="h-5 w-5" />}
    </button>
  );
}
