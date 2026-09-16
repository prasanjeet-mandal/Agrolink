import * as React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Car, Eye, EyeOff, IdCard, Loader2, Mail, Phone, Sprout, UserRound } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/forms';
import { validateForm, required, isEmail, validatePhoneE164, validatePassword, validateConfirmPassword } from '@/utils/validation';
import { ROLES, ROLE_LABELS, ROLE_ROUTES } from '@/constants/roles';
import GoogleSignIn from '@/components/auth/GoogleSignIn';

const REGISTRABLE_ROLES = [
  ROLES.CONSUMER,
  ROLES.FARMER,
  ROLES.FPO,
  ROLES.DELIVERY_PARTNER,
];

export default function Register() {
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const paramRole = searchParams.get('role')?.toUpperCase() ?? '';
  const roleLocked = REGISTRABLE_ROLES.includes(paramRole);
  const initialRole = roleLocked ? paramRole : ROLES.CONSUMER;

  const [role] = React.useState(initialRole);
  const [values, setValues] = React.useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    vehicleNumber: '', drivingLicense: '',
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [submitting, setSubmitting] = React.useState(false);

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const fieldRules = {
      name: (v) => required(v, 'Full name'),
      email: (v) => isEmail(v) ? null : 'Enter a valid email address',
      phone: validatePhoneE164,
      password: validatePassword,
      confirmPassword: (v, all) => validateConfirmPassword(v, all.password),
      ...(role === ROLES.DELIVERY_PARTNER
        ? {
            vehicleNumber: (v) => required(v, 'Vehicle number'),
            drivingLicense: (v) => required(v, 'Driving licence number'),
          }
        : {}),
    };
    const validation = validateForm(values, fieldRules);
    setErrors(validation);
    if (Object.keys(validation).length) return;

    setSubmitting(true);
    try {
      const account = await register({ ...values, role });
      navigate(ROLE_ROUTES[account.role]);
      toast({
        title: 'Account created',
        description: `Welcome to Agrolink, ${account.name}`,
        variant: 'success',
      });
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card glass glow glowLg className="agrolink-glass-panel">
      <CardHeader className="text-center">
        <span className="agrolink-glow mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-600 text-white shadow-lg shadow-primary/30">
          <Sprout className="h-6 w-6" />
        </span>
        <CardTitle className="agrolink-text-gradient text-2xl">
          {roleLocked ? `Join as ${ROLE_LABELS[initialRole]}` : 'Create your account'}
        </CardTitle>
        <CardDescription>
          {roleLocked
            ? `You're registering as a ${ROLE_LABELS[initialRole]}.`
            : 'Create your account to buy and sell fresh produce.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form onSubmit={submit} className="space-y-4" noValidate>
          {errors.form ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
              {errors.form}
            </p>
          ) : null}

          <GoogleSignIn mode="register" defaultRole={role} onError={(msg) => setErrors((e) => ({ ...e, form: msg }))} />

          <div className="relative flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <span className="h-px flex-1 bg-muted" />
            <span>or continue with email</span>
            <span className="h-px flex-1 bg-muted" />
          </div>

          <FormField label="Full name" required error={errors.name} htmlFor="name">
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="name" value={values.name} onChange={set('name')} placeholder="Your full name" autoComplete="name" className="pl-9" autoFocus />
            </div>
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Email" required error={errors.email} htmlFor="email">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" value={values.email} onChange={set('email')} placeholder="Enter your email address" autoComplete="email" className="pl-9" />
              </div>
            </FormField>
            <FormField label="Phone" required error={errors.phone} htmlFor="phone">
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="phone" type="tel" inputMode="tel" value={values.phone} onChange={set('phone')} placeholder="Enter your mobile number" autoComplete="tel-national" maxLength={15} className="pl-9" />
              </div>
            </FormField>
          </div>

          {role === ROLES.DELIVERY_PARTNER ? (
            <div className="grid gap-4 rounded-lg border border-primary/20 bg-primary/5 p-4 sm:grid-cols-2">
              <FormField label="Vehicle number" required error={errors.vehicleNumber} htmlFor="vehicleNumber">
                <div className="relative">
                  <Car className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="vehicleNumber" value={values.vehicleNumber} onChange={set('vehicleNumber')} placeholder="Enter vehicle registration number" className="pl-9" />
                </div>
              </FormField>
              <FormField label="Driving licence number" required error={errors.drivingLicense} htmlFor="drivingLicense">
                <div className="relative">
                  <IdCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="drivingLicense" value={values.drivingLicense} onChange={set('drivingLicense')} placeholder="Enter driving licence number" className="pl-9" />
                </div>
              </FormField>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Password" required error={errors.password} htmlFor="password">
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={values.password}
                  onChange={set('password')}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="pr-10"
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
              <p className="pt-1.5 text-xs text-muted-foreground">At least 8 characters with letters &amp; numbers</p>
            </FormField>
            <FormField label="Confirm password" required error={errors.confirmPassword} htmlFor="confirmPassword">
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={values.confirmPassword}
                  onChange={set('confirmPassword')}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormField>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? <Loader2 className="animate-spin" /> : <UserRound className="h-4 w-4" />}
            {submitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <div className="border-t pt-3">
          <p className="text-center text-sm text-muted-foreground">
            Already registered?{' '}
            <Link
              to={roleLocked ? `/login?role=${initialRole}` : '/login'}
              className="font-semibold text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}