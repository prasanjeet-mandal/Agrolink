import * as React from 'react';
import { authService } from '@/services/authService';
import { ROLES } from '@/constants/roles';

const AuthContext = React.createContext(null);

const STORAGE_USER = 'agrolink_user';
const STORAGE_TOKEN = 'agrolink_token';

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_USER))?.user ?? null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = React.useState(false);

  const persist = React.useCallback((session) => {
    localStorage.setItem(STORAGE_USER, JSON.stringify({ user: session.user }));
    localStorage.setItem(STORAGE_TOKEN, session.token);
    setUser(session.user);
  }, []);

  const login = React.useCallback(
    async (credentials) => {
      setLoading(true);
      try {
        const session = await authService.login(credentials);
        persist(session);
        return session.user;
      } finally {
        setLoading(false);
      }
    },
    [persist]
  );

  const register = React.useCallback(
    async (payload) => {
      setLoading(true);
      try {
        const session = await authService.register(payload);
        persist(session);
        return session.user;
      } finally {
        setLoading(false);
      }
    },
    [persist]
  );

  const logout = React.useCallback(() => {
    localStorage.removeItem(STORAGE_USER);
    localStorage.removeItem(STORAGE_TOKEN);
    setUser(null);
  }, []);

  const refreshProfile = React.useCallback(async () => {
    const profile = await authService.me();
    const current = JSON.parse(localStorage.getItem(STORAGE_USER) ?? '{}');
    localStorage.setItem(STORAGE_USER, JSON.stringify({ ...current, user: profile }));
    setUser(profile);
    return profile;
  }, []);

  const value = React.useMemo(
    () => ({ user, loading, login, register, logout, refreshProfile }),
    [user, loading, login, register, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}

export const roleMatches = (user, allowed) => {
  if (!user) return false;
  if (user.role === ROLES.ADMIN) return true;
  return allowed.includes(user.role);
};