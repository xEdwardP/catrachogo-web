import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthLayout } from '../components/AuthLayout';
import { useAuth } from '../hooks/useAuth';
import { translatePhoneUpdateError } from '../api/authErrorMessages';
import { homePathForRole } from '../utils/roleRoutes';

const PHONE_PATTERN = /^\+?\d{8,15}$/;

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
      <h2 className="mb-2 text-center text-lg font-semibold text-gray-800">Completa tu perfil</h2>
      <p className="mb-6 text-center text-sm text-gray-500">
        Hola{user?.name ? `, ${user.name}` : ''}. Necesitamos tu número de teléfono para poder
        conectarte con {user?.role === 'driver' ? 'pasajeros' : 'un conductor'}.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
            Teléfono
          </label>
          <input
            id="phone"
            type="tel"
            required
            autoComplete="tel"
            placeholder="99998888"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#E8532E] focus:outline-none focus:ring-1 focus:ring-[#E8532E]"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-[#E8532E] py-2.5 text-sm font-semibold text-white transition hover:bg-[#d1471f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Guardando...' : 'Continuar'}
        </button>
      </form>
    </AuthLayout>
  );
}
