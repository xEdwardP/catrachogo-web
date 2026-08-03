import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { homePathForRole } from '../utils/roleRoutes';
import { ThemeToggle } from './ThemeToggle';

interface LegalPageLayoutProps {
  title: string;
  updatedAt: string;
  children: ReactNode;
}

export function LegalPageLayout({ title, updatedAt, children }: LegalPageLayoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream p-4 dark:bg-gray-950">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          {user ? (
            <Link
              to={homePathForRole(user.role)}
              className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
            >
              <ArrowLeft className="h-4 w-4" /> Volver
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
            >
              <ArrowLeft className="h-4 w-4" /> Volver
            </button>
          )}
          <ThemeToggle />
        </div>

        <h1 className="mb-1 text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h1>
        <p className="mb-4 text-xs text-gray-400 dark:text-gray-500">Última actualización: {updatedAt}</p>

        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900">{children}</div>
      </div>
    </div>
  );
}
