import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ProfileEditor } from '../components/ProfileEditor';
import { useAuth } from '../hooks/useAuth';
import { homePathForRole } from '../utils/roleRoutes';

export function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cream p-4 lg:p-8 dark:bg-gray-950">
      <div className="mx-auto max-w-md lg:max-w-2xl">
        <Link
          to={homePathForRole(user.role)}
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
        <h1 className="mb-4 text-xl font-bold text-gray-800 lg:mb-6 dark:text-gray-100">Mi perfil</h1>

        <ProfileEditor />
      </div>
    </div>
  );
}
