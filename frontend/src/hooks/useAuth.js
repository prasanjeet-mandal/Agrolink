import { useAuthContext } from '@/context/AuthContext';

export function useAuth() {
  const { user, loading, login, googleLogin, googleSignupComplete, register, logout, refreshProfile } = useAuthContext();
  return { user, loading, login, googleLogin, googleSignupComplete, register, logout, refreshProfile };
}