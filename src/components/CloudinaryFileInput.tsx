import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Check, ImagePlus, Loader2 } from 'lucide-react';
import { uploadToCloudinary } from '../api/cloudinary';

interface CloudinaryFileInputProps {
  id: string;
  label: string;
  value: string | null;
  onUploaded: (url: string) => void;
}

export function CloudinaryFileInput({ id, label, value, onUploaded }: CloudinaryFileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      onUploaded(url);
    } catch {
      toast.error(`No se pudo subir "${label}". Intenta de nuevo.`);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </label>
      <button
        id={id}
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className={`flex w-full items-center gap-3 rounded-lg border-2 border-dashed px-3 py-3 text-left text-sm transition ${
          value ? 'border-success bg-success/5' : 'border-gray-300 hover:border-brand/50 dark:border-gray-600'
        }`}
      >
        {value ? (
          <img src={value} alt={label} className="h-10 w-10 rounded-md object-cover" />
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
            <ImagePlus className="h-5 w-5" />
          </span>
        )}
        <span className="flex-1 text-gray-600 dark:text-gray-300">
          {isUploading ? 'Subiendo...' : value ? 'Cambiar imagen' : 'Toca para subir una imagen'}
        </span>
        {isUploading && <Loader2 className="h-4 w-4 animate-spin text-gray-400 dark:text-gray-500" />}
        {!isUploading && value && <Check className="h-4 w-4 text-success" />}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
