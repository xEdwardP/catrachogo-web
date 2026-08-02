import { LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function AccountSwitchHeader() {
  const { user, logout } = useAuth();

  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-sm shadow-sm">
      <span className="truncate text-gray-500">
        {user?.name ? `Sesión iniciada como ${user.name}` : 'Sesión iniciada'}
      </span>
      <button
        type="button"
        onClick={logout}
        className="flex shrink-0 items-center gap-1.5 font-medium text-gray-600 hover:text-gray-800"
      >
        <LogOut className="h-4 w-4" /> Cerrar sesión
      </button>
    </div>
  );
}
