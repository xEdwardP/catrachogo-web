import { useNavigate } from 'react-router-dom';
import { Clock, HelpCircle, LogOut, UserCircle, Wallet } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { useAuth } from '../hooks/useAuth';

interface HeaderActionsPillProps {
  historyPath: string;
  walletPath: string;
  profilePath: string;
  shadow?: 'sm' | 'md';
}

export function HeaderActionsPill({ historyPath, walletPath, profilePath, shadow = 'sm' }: HeaderActionsPillProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div
      className={`flex items-center gap-2 rounded-lg bg-white p-1.5 ${shadow === 'md' ? 'shadow-md' : 'shadow-sm'}`}
    >
      <NotificationBell />
      <button
        type="button"
        onClick={() => navigate(historyPath)}
        aria-label="Historial de viajes"
        className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100"
      >
        <Clock className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => navigate(walletPath)}
        aria-label="Wallet"
        className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100"
      >
        <Wallet className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => navigate(profilePath)}
        aria-label="Mi perfil"
        className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100"
      >
        <UserCircle className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => navigate('/support')}
        aria-label="Ayuda y soporte"
        className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100"
      >
        <HelpCircle className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={logout}
        aria-label="Cerrar sesión"
        className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100"
      >
        <LogOut className="h-5 w-5" />
      </button>
    </div>
  );
}
