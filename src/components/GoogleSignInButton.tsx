import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';
import { useTheme } from '../hooks/useTheme';

interface GoogleSignInButtonProps {
  onCredential: (idToken: string) => void;
}

export function GoogleSignInButton({ onCredential }: GoogleSignInButtonProps) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const { theme } = useTheme();

  if (!clientId) {
    return (
      <button
        type="button"
        disabled
        title="Falta configurar VITE_GOOGLE_CLIENT_ID"
        className="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-50 py-2.5 text-sm text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500"
      >
        Continuar con Google
      </button>
    );
  }

  return (
    <GoogleLogin
      onSuccess={(credentialResponse) => {
        if (credentialResponse.credential) {
          onCredential(credentialResponse.credential);
        }
      }}
      onError={() => {
        toast.error('No se pudo iniciar sesión con Google.');
      }}
      width="336"
      text="continue_with"
      theme={theme === 'dark' ? 'filled_black' : 'outline'}
    />
  );
}
