import type { Location } from 'react-router-dom';
import type { AuthUser } from '../types/auth';
import { homePathForRole } from './roleRoutes';

export function resolvePostAuthPath(profile: AuthUser, from?: Location): string {
  if (!profile.phone) {
    return '/complete-profile';
  }
  return from?.pathname ?? homePathForRole(profile.role);
}
