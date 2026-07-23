import type { UserRole } from '../types/auth';

export function homePathForRole(role: UserRole): string {
  switch (role) {
    case 'passenger':
      return '/passenger';
    case 'driver':
      return '/driver';
    case 'admin':
      return '/admin';
  }
}
