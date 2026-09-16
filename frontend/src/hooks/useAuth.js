import { useAuthContext } from '@/context/AuthContext';

export function useAuth() {
  const { user, token, loading, login, googleLogin, googleSignupComplete, register, logout, refreshProfile } = useAuthContext();
  return { user, token, loading, login, googleLogin, googleSignupComplete, register, logout, refreshProfile };
}