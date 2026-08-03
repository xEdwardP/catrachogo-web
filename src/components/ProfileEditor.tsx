import { useState } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import { CloudinaryFileInput } from './CloudinaryFileInput';
import { PasswordInput } from './PasswordInput';
import {
  translateNameUpdateError,
  translatePasswordUpdateError,
  translatePhoneUpdateError,
} from '../api/authErrorMessages';
import { useAuth } from '../hooks/useAuth';
import { PHONE_PATTERN, sanitizePhoneInput } from '../utils/phone';

export function ProfileEditor() {
  const { user, updateName, completePhone, updateProfilePhoto, updatePassword } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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

  async function handleChangePassword(event: FormEvent) {
    event.preventDefault();

    if (newPassword.length < 8) {
      toast.error('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('Las contraseñas nuevas no coinciden.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await updatePassword(currentPassword, newPassword);
      toast.success('Contraseña actualizada.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      toast.error(translatePasswordUpdateError(error));
    } finally {
      setIsChangingPassword(false);
    }
  }

  return (
    <>
      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
        <div className="flex flex-col gap-4 lg:gap-6">
          <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-900">
            <CloudinaryFileInput
              id="profile-photo"
              label="Foto de perfil"
              value={user.profilePhotoUrl}
              onUploaded={handlePhotoUploaded}
            />
          </div>

          <div className="hidden rounded-2xl bg-white p-4 shadow-sm lg:block dark:bg-gray-900">
            <h2 className="mb-4 text-base font-semibold text-gray-800 dark:text-gray-100">Cambiar contraseña</h2>
            <PasswordChangeForm
              currentPassword={currentPassword}
              newPassword={newPassword}
              confirmNewPassword={confirmNewPassword}
              isSubmitting={isChangingPassword}
              onCurrentPasswordChange={setCurrentPassword}
              onNewPasswordChange={setNewPassword}
              onConfirmNewPasswordChange={setConfirmNewPassword}
              onSubmit={handleChangePassword}
            />
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm lg:mt-0 dark:bg-gray-900">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Correo
              </label>
              <input
                id="email"
                type="email"
                disabled
                value={user.email}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
              />
            </div>

            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Nombre
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Teléfono
              </label>
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(sanitizePhoneInput(event.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
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

      <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm lg:hidden dark:bg-gray-900">
        <h2 className="mb-4 text-base font-semibold text-gray-800 dark:text-gray-100">Cambiar contraseña</h2>
        <PasswordChangeForm
          currentPassword={currentPassword}
          newPassword={newPassword}
          confirmNewPassword={confirmNewPassword}
          isSubmitting={isChangingPassword}
          onCurrentPasswordChange={setCurrentPassword}
          onNewPasswordChange={setNewPassword}
          onConfirmNewPasswordChange={setConfirmNewPassword}
          onSubmit={handleChangePassword}
        />
      </div>
    </>
  );
}

interface PasswordChangeFormProps {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  isSubmitting: boolean;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmNewPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}

function PasswordChangeForm({
  currentPassword,
  newPassword,
  confirmNewPassword,
  isSubmitting,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmNewPasswordChange,
  onSubmit,
}: PasswordChangeFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <PasswordInput
        id="current-password"
        label="Contraseña actual"
        required
        autoComplete="current-password"
        value={currentPassword}
        onChange={onCurrentPasswordChange}
      />
      <PasswordInput
        id="new-password"
        label="Nueva contraseña"
        required
        minLength={8}
        autoComplete="new-password"
        value={newPassword}
        onChange={onNewPasswordChange}
      />
      <PasswordInput
        id="confirm-new-password"
        label="Confirmar nueva contraseña"
        required
        minLength={8}
        autoComplete="new-password"
        value={confirmNewPassword}
        onChange={onConfirmNewPasswordChange}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Cambiando...' : 'Cambiar contraseña'}
      </button>
    </form>
  );
}
