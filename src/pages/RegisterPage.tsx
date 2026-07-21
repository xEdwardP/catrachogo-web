import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthLayout } from '../components/AuthLayout';
import { RoleToggle } from '../components/RoleToggle';
import { useAuth } from '../hooks/useAuth';
import { translateRegisterError } from '../api/authErrorMessages';
import { resolvePostAuthPath } from '../utils/authRedirect';
import { sanitizePhoneInput } from '../utils/phone';

const PHONE_PATTERN = /^\+?\d{8,15}$/;

export function RegisterPage() {
  const { isAuthenticated, user, registerAccount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const preselectedRole = (location.state as { role?: 'passenger' | 'driver' })?.role;

  const [role, setRole] = useState<'passenger' | 'driver'>(preselectedRole ?? 'passenger');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      const from = (location.state as { from?: Location })?.from;
      navigate(resolvePostAuthPath(user, from), { replace: true });
    }
  }, [isAuthenticated, user, location.state, navigate]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!PHONE_PATTERN.test(phone)) {
      toast.error('El teléfono debe tener entre 8 y 15 dígitos, con "+" opcional al inicio.');
      return;
    }
    if (password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setIsSubmitting(true);
    try {
      const profile = await registerAccount({ name, email, phone, password, role });
      navigate(resolvePostAuthPath(profile), { replace: true });
    } catch (error) {
      toast.error(translateRegisterError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <h2 className="mb-4 text-center text-lg font-semibold text-gray-800">Crear cuenta</h2>

      <RoleToggle value={role} onChange={setRole} />

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
            Nombre
          </label>
          <input
            id="name"
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            Correo
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
            Teléfono
          </label>
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            required
            autoComplete="tel"
            placeholder="99998888"
            value={phone}
            onChange={(event) => setPhone(sanitizePhoneInput(event.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-medium text-brand hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </AuthLayout>
  );
}
