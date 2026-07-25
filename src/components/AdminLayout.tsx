import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Car, Flag, LayoutDashboard, LogOut, MapPinned, Users, Wallet } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { NotificationBell } from './NotificationBell';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/drivers', label: 'Conductores', icon: Users, end: false },
  { to: '/admin/trips', label: 'Viajes', icon: Car, end: false },
  { to: '/admin/withdrawals', label: 'Retiros', icon: Wallet, end: false },
  { to: '/admin/incident-reports', label: 'Reportes', icon: Flag, end: false },
  { to: '/admin/fare-zones', label: 'Zonas y tarifas', icon: MapPinned, end: false },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="flex w-64 shrink-0 flex-col border-r border-gray-100 bg-white">
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <img src="/logo_without_text.png" alt="CatrachoGo" className="h-9 w-9" />
            <div>
              <p className="font-bold leading-tight text-gray-800">CatrachoGo</p>
              <p className="text-xs font-medium text-brand">Administración</p>
            </div>
          </div>
          <NotificationBell />
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 pt-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand text-white shadow-sm shadow-brand/30'
                    : 'text-gray-600 hover:bg-cream hover:text-gray-800'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-100 px-4 py-4">
          <div className="mb-3 flex items-center gap-2.5 px-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-pale text-xs font-bold text-brand">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-700">{user?.name}</p>
              <p className="truncate text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
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
