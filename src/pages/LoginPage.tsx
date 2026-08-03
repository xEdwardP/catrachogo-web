import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthLayout } from '../components/AuthLayout';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { PasswordInput } from '../components/PasswordInput';
import { useAuth } from '../hooks/useAuth';
import { translateGoogleLoginError, translateLoginError } from '../api/authErrorMessages';
import { resolvePostAuthPath } from '../utils/authRedirect';
import type { AuthUser } from '../types/auth';

export function LoginPage() {
  const { isAuthenticated, user, loginWithPassword, loginWithGoogleToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectAfterAuth = useCallback(
    (profile: AuthUser) => {
      const from = (location.state as { from?: Location })?.from;
      navigate(resolvePostAuthPath(profile, from), { replace: true });
    },
    [location, navigate],
  );

  useEffect(() => {
    if (isAuthenticated && user) {
      redirectAfterAuth(user);
    }
  }, [isAuthenticated, user, redirectAfterAuth]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const profile = await loginWithPassword(email, password);
      redirectAfterAuth(profile);
    } catch (error) {
      toast.error(translateLoginError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleCredential(idToken: string) {
    try {
      const profile = await loginWithGoogleToken(idToken);
      redirectAfterAuth(profile);
    } catch {
      toast.error(translateGoogleLoginError());
    }
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Correo
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
          />
        </div>

        <PasswordInput
          id="password"
          label="Contraseña"
          required
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
        o
        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
      </div>

      <GoogleSignInButton onCredential={handleGoogleCredential} />

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="font-medium text-brand hover:underline">
          Crear cuenta
        </Link>
      </p>
    </AuthLayout>
  );
}
