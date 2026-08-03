import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AccountSwitchHeader } from '../components/AccountSwitchHeader';
import { AuthLayout } from '../components/AuthLayout';
import { useAuth } from '../hooks/useAuth';
import { translatePhoneUpdateError } from '../api/authErrorMessages';
import { homePathForRole } from '../utils/roleRoutes';
import { PHONE_PATTERN, sanitizePhoneInput } from '../utils/phone';

export function CompleteProfilePage() {
  const { user, completePhone } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!PHONE_PATTERN.test(phone)) {
      toast.error('El teléfono debe tener entre 8 y 15 dígitos, con "+" opcional al inicio.');
      return;
    }

    setIsSubmitting(true);
    try {
      const profile = await completePhone(phone);
      navigate(homePathForRole(profile.role), { replace: true });
    } catch (error) {
      toast.error(translatePhoneUpdateError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <AccountSwitchHeader />
      <h2 className="mb-2 text-center text-lg font-semibold text-gray-800 dark:text-gray-100">Completa tu perfil</h2>
      <p className="mb-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Hola{user?.name ? `, ${user.name}` : ''}. Necesitamos tu número de teléfono para poder
        conectarte con {user?.role === 'driver' ? 'pasajeros' : 'un conductor'}.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
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
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Guardando...' : 'Continuar'}
        </button>
      </form>
    </AuthLayout>
  );
}
