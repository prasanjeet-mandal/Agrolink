import * as React from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Lock, Mail, Sprout } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/forms';
import { validateForm, required, isEmail, isPhone } from '@/utils/validation';
import { ROLES, ROLE_ROUTES } from '@/constants/roles';
import GoogleSignIn from '@/components/auth/GoogleSignIn';

const ROLE_HEADING = {
  [ROLES.CONSUMER]: 'Sign in as Buyer',
  [ROLES.FARMER]: 'Sign in as Seller',
  [ROLES.FPO]: 'Sign in as FPO',
  [ROLES.DELIVERY_PARTNER]: 'Sign in as Delivery Partner',
  [ROLES.ADMIN]: 'Sign in as Administrator',
};

export default function Login() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Derive from URL param on every render — reactive
  const paramRole = searchParams.get('role')?.toUpperCase() ?? '';
  const validRoles = Object.values(ROLES);
  const roleLocked = validRoles.includes(paramRole);

  const [values, setValues] = React.useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [submitting, setSubmitting] = React.useState(false);

  const goToRole = React.useCallback((user, fallback) => {
    navigate(ROLE_ROUTES[user.role] ?? fallback, { replace: true });
  }, [navigate]);

  const submit = async (e) => {
    e.preventDefault();
    const fieldRules = {
      email: (v) => (!isEmail(v) && !isPhone(v) ? 'Enter a valid email or 10-digit phone' : null),
      password: (v) => required(v, 'Password'),
    };
    const validation = validateForm(values, fieldRules);
    setErrors(validation);
    if (Object.keys(validation).length) return;

    setSubmitting(true);
    try {
      const user = await login({ email: values.email, password: values.password });
      const from = location.state?.from?.pathname;
      goToRole(user, from);
      toast({ title: 'Welcome back', description: `Signed in as ${user.name}`, variant: 'success' });
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card glass glow glowLg lift className="agrolink-glass-panel">
      <CardHeader className="text-center">
        <span className="agrolink-glow mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-600 text-white shadow-lg shadow-primary/30">
          <Sprout className="h-6 w-6" />
        </span>
        <CardTitle className="agrolink-text-gradient text-2xl">
          {roleLocked ? ROLE_HEADING[paramRole] : 'Sign in'}
        </CardTitle>
        <CardDescription>
          {roleLocked
            ? `Welcome back! Enter your credentials to continue.`
            : 'Access your farm marketplace dashboard.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form onSubmit={submit} className="space-y-4" noValidate>
          {errors.form ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
              {errors.form}
            </p>
          ) : null}
          <FormField label="Email or phone" required error={errors.email} htmlFor="email">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                value={values.email}
                onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                placeholder="Enter your email or mobile number"
                autoComplete="username"
                className="pl-9"
                autoFocus
              />
            </div>
          </FormField>
          <FormField label="Password" required error={errors.password} htmlFor="password">
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={values.password}
                onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
                placeholder="••••••••"
                autoComplete="current-password"
                className="pl-9 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </FormField>
          <div className="flex items-center justify-end text-sm">
            <Link to="/forgot-password" className="font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? <Loader2 className="animate-spin" /> : null}
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <div className="relative flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <span className="h-px flex-1 bg-muted" />
          <span>or</span>
          <span className="h-px flex-1 bg-muted" />
        </div>

        <GoogleSignIn mode="login" onError={(msg) => setErrors((e) => ({ ...e, form: msg }))} />

        <p className="text-center text-sm text-muted-foreground">
          New to Agrolink?{' '}
          <Link
            to={roleLocked ? `/register?role=${paramRole}` : '/register'}
            className="font-semibold text-primary hover:underline"
          >
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}