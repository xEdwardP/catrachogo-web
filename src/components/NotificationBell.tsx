import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Bell, Check } from 'lucide-react';
import {
  getNotifications,
  getUnreadNotificationsCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notifications';
import { usePolling } from '../hooks/usePolling';
import { useAuth } from '../hooks/useAuth';
import { formatRelativeTime } from '../utils/relativeTime';
import type { AppNotification } from '../types/notification';
import type { UserRole } from '../types/auth';

const UNREAD_POLL_INTERVAL_MS = 45000;

const TRIP_NOTIFICATION_TYPES = new Set(['trip_accepted', 'trip_started', 'trip_completed', 'trip_cancelled']);

function tripPathForRole(role: UserRole | undefined, tripId: string): string | null {
  if (role === 'passenger') return `/passenger/trips/${tripId}`;
  if (role === 'driver') return `/driver/trips/${tripId}`;
  return null;
}

interface NotificationBellProps {
  align?: 'left' | 'right';
}

export function NotificationBell({ align = 'right' }: NotificationBellProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<AppNotification[] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  usePolling(
    () => {
      getUnreadNotificationsCount()
        .then(setUnreadCount)
        .catch(() => {});
    },
    UNREAD_POLL_INTERVAL_MS,
    true,
  );

  useEffect(() => {
    if (!isOpen) return;
    getNotifications(1, 20)
      .then((result) => setNotifications(result.data))
      .catch(() => toast.error('No se pudieron cargar las notificaciones.'));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead();
      setNotifications(
        (current) => current && current.map((notification) => ({ ...notification, read: true })),
      );
      setUnreadCount(0);
    } catch {
      toast.error('No se pudo marcar todo como leído.');
    }
  }

  function handleNotificationClick(notification: AppNotification) {
    if (!notification.read) {
      setNotifications(
        (current) => current && current.map((item) => (item.id === notification.id ? { ...item, read: true } : item)),
      );
      setUnreadCount((count) => Math.max(0, count - 1));
      markNotificationRead(notification.id).catch(() => {});
    }

    if (TRIP_NOTIFICATION_TYPES.has(notification.type) && notification.relatedTripId) {
      const path = tripPathForRole(user?.role, notification.relatedTripId);
      if (path) {
        setIsOpen(false);
        navigate(path);
      }
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label="Notificaciones"
        className="relative rounded-md p-1.5 text-gray-600 hover:bg-gray-100"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className={`absolute top-full z-30 mt-2 w-80 max-w-[90vw] rounded-2xl bg-white p-3 shadow-lg ${
            align === 'left' ? 'left-0' : 'right-0'
          }`}
        >
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-sm font-semibold text-gray-800">Notificaciones</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
              >
                <Check className="h-3 w-3" /> Marcar todas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications === null ? (
              <p className="py-6 text-center text-sm text-gray-400">Cargando...</p>
            ) : notifications.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">No tienes notificaciones.</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {notifications.map((notification) => (
                  <li key={notification.id}>
                    <button
                      type="button"
                      onClick={() => handleNotificationClick(notification)}
                      className={`flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left transition hover:bg-cream/70 ${
                        notification.read ? '' : 'bg-brand-pale/40'
                      }`}
                    >
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          notification.read ? 'bg-transparent' : 'bg-brand'
                        }`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-gray-800">
                          {notification.title}
                        </span>
                        <span className="block truncate text-xs text-gray-500">{notification.body}</span>
                        <span className="block text-[11px] text-gray-400">
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
