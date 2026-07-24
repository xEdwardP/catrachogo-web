import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { CloudinaryFileInput } from '../components/CloudinaryFileInput';
import { translateNameUpdateError, translatePhoneUpdateError } from '../api/authErrorMessages';
import { useAuth } from '../hooks/useAuth';
import { homePathForRole } from '../utils/roleRoutes';
import { PHONE_PATTERN, sanitizePhoneInput } from '../utils/phone';

export function ProfilePage() {
  const { user, updateName, completePhone, updateProfilePhoto } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return null;
  }
  const currentUser = user;

  async function handlePhotoUploaded(url: string) {
    try {
      await updateProfilePhoto(url);
      toast.success('Foto de perfil actualizada.');
    } catch {
      toast.error('No se pudo actualizar tu foto de perfil. Intenta de nuevo.');
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      toast.error('El nombre debe tener al menos 2 caracteres.');
      return;
    }
    const phoneChanged = phone !== currentUser.phone;
    if (phoneChanged && !PHONE_PATTERN.test(phone)) {
      toast.error('El teléfono debe tener entre 8 y 15 dígitos, con "+" opcional al inicio.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (trimmedName !== currentUser.name) {
        await updateName(trimmedName);
      }
      if (phoneChanged) {
        await completePhone(phone);
      }
      toast.success('Perfil actualizado.');
    } catch (error) {
      toast.error(
        trimmedName !== currentUser.name ? translateNameUpdateError(error) : translatePhoneUpdateError(error),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream p-4 lg:p-8">
      <div className="mx-auto max-w-md lg:max-w-2xl">
        <Link
          to={homePathForRole(user.role)}
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
        <h1 className="mb-4 text-xl font-bold text-gray-800 lg:mb-6">Mi perfil</h1>

        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
          <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm lg:mb-0">
            <CloudinaryFileInput
              id="profile-photo"
              label="Foto de perfil"
              value={user.profilePhotoUrl}
              onUploaded={handlePhotoUploaded}
            />
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                Correo
              </label>
              <input
                id="email"
                type="email"
                disabled
                value={user.email}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
              />
            </div>

            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
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
                value={phone}
                onChange={(event) => setPhone(sanitizePhoneInput(event.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
            </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
