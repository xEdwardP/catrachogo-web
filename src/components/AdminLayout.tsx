import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Car, LogOut, MapPinned, Users, Wallet } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const NAV_ITEMS = [
  { to: '/admin/drivers', label: 'Conductores', icon: Users },
  { to: '/admin/trips', label: 'Viajes', icon: Car },
  { to: '/admin/withdrawals', label: 'Retiros', icon: Wallet },
  { to: '/admin/fare-zones', label: 'Zonas y tarifas', icon: MapPinned },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-[#F6F1EC]">
      <aside className="flex w-64 shrink-0 flex-col border-r border-gray-100 bg-white">
        <div className="flex items-center gap-2 px-5 py-5">
          <img src="/logo_without_text.png" alt="CatrachoGo" className="h-8 w-8" />
          <span className="font-bold text-gray-800">CatrachoGo Admin</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-[#E8532E] text-white' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-100 px-5 py-4">
          <p className="mb-2 truncate text-xs text-gray-400">{user?.email}</p>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-auto p-8">{children}</main>
    </div>
  );
}
