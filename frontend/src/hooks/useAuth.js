import { useAuthContext } from '@/context/AuthContext';

export function useAuth() {
  const { user, loading, login, register, logout, refreshProfile } = useAuthContext();
  return { user, loading, login, register, logout, refreshProfile };
}