import * as React from 'react';
import { authService } from '@/services/authService';
import { ROLES, ROLE_LABELS } from '@/constants/roles';
import { toSession } from '@/services/normalize';

const AuthContext = React.createContext(null);

const STORAGE_USER = 'agrolink_user';
const STORAGE_TOKEN = 'agrolink_token';

const roleLabel = (role) => ROLE_LABELS[role] ?? role ?? '';

function assertExpectedRole(user, expectedRole) {
  if (expectedRole && user && user.role !== expectedRole) {
    throw new Error(
      `Cannot sign in as ${roleLabel(expectedRole)}: this account is registered as ${roleLabel(user.role)}. Please sign in from the correct section.`
    );
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_USER))?.user ?? null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = React.useState(() => localStorage.getItem(STORAGE_TOKEN));
  const [loading, setLoading] = React.useState(false);

  const persist = React.useCallback((session) => {
    localStorage.setItem(STORAGE_USER, JSON.stringify({ user: session.user }));
    localStorage.setItem(STORAGE_TOKEN, session.token);
    setUser(session.user);
    setToken(session.token);
  }, []);

  const login = React.useCallback(
    async ({ email, password, expectedRole } = {}) => {
      setLoading(true);
      try {
        const session = await authService.login({ email, password });
        assertExpectedRole(session.user, expectedRole);
        persist(session);
        return session.user;
      } finally {
        setLoading(false);
      }
    },
    [persist]
  );

  const googleLogin = React.useCallback(
    async (code, { expectedRole } = {}) => {
      setLoading(true);
      try {
        const res = await authService.googleLogin(code);
        if (res.needsRole) {
          return { needsRole: true, signupTicket: res.signupTicket, name: res.fullName, email: res.email };
        }
        const session = toSession(res);
        assertExpectedRole(session.user, expectedRole);
        persist(session);
        return session.user;
      } finally {
        setLoading(false);
      }
    },
    [persist]
  );

  const googleSignupComplete = React.useCallback(
    async (signupTicket, { role, vehicleNumber, drivingLicense } = {}) => {
      setLoading(true);
      try {
        const session = await authService.googleSignupComplete(signupTicket, { role, vehicleNumber, drivingLicense });
        persist(session);
        return session.user;
      } finally {
        setLoading(false);
      }
    },
    [persist]
  );

  const register = React.useCallback(
    async (payload, otpToken) => {
      setLoading(true);
      try {
        const session = await authService.register(payload, otpToken);
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
    setToken(null);
  }, []);

  const refreshProfile = React.useCallback(async () => {
    const profile = await authService.me();
    const current = JSON.parse(localStorage.getItem(STORAGE_USER) ?? '{}');
    localStorage.setItem(STORAGE_USER, JSON.stringify({ ...current, user: profile }));
    setUser(profile);
    return profile;
  }, []);

  const value = React.useMemo(
    () => ({ user, token, loading, login, googleLogin, googleSignupComplete, register, logout, refreshProfile }),
    [user, token, loading, login, googleLogin, googleSignupComplete, register, logout, refreshProfile]
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