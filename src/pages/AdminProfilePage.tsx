import { AdminLayout } from '../components/AdminLayout';
import { ProfileEditor } from '../components/ProfileEditor';

export function AdminProfilePage() {
  return (
    <AdminLayout>
      <h1 className="mb-1 text-2xl font-bold text-gray-800 dark:text-gray-100">Mi perfil</h1>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Actualiza tus datos y tu contraseña de acceso.</p>

      <ProfileEditor />
    </AdminLayout>
  );
}
