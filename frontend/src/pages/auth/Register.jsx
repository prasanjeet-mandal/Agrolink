import * as React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Car, Check, Eye, EyeOff, IdCard, Loader2, Mail, MailCheck, Phone, ShieldCheck, Store, Truck, UserRound, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/forms';
import { authService } from '@/services/authService';
import { validateForm, required, isEmail, validatePhoneE164, validatePassword, validateConfirmPassword, getPasswordStrength } from '@/utils/validation';
import { ROLES, ROLE_ROUTES } from '@/constants/roles';
import { cn } from '@/utils/cn';
import GoogleSignIn from '@/components/auth/GoogleSignIn';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;

const ROLE_OPTIONS = [
  { value: ROLES.CONSUMER, label: 'Consumer', desc: 'Buy fresh produce directly', icon: Store },
  { value: ROLES.FARMER, label: 'Farmer', desc: 'Sell your own farm produce', icon: UserRound },
  { value: ROLES.FPO, label: 'FPO / Organization', desc: 'Aggregate member produce & sell', icon: Users },
  { value: ROLES.DELIVERY_PARTNER, label: 'Delivery Partner', desc: 'Deliver orders as a logistics partner', icon: Truck },
];

const MESSAGE = {
  [0]: { text: 'Too short', bar: 'bg-muted', textColor: 'text-muted-foreground' },
  [1]: { text: 'Weak', bar: 'from-red-500 to-orange-500', textColor: 'text-red-500' },
  [2]: { text: 'Fair', bar: 'from-orange-500 to-amber-500', textColor: 'text-amber-600' },
  [3]: { text: 'Good', bar: 'from-amber-500 to-yellow-500', textColor: 'text-yellow-600' },
  [4]: { text: 'Strong', bar: 'from-emerald-500 to-green-600', textColor: 'text-emerald-600' },
};

function OtpBoxes({ value, onChange, onComplete, disabled, autoFocus = true }) {
  const refs = React.useRef([]);

  const handleChange = (idx, e) => {
    const digit = e.target.value.replace(/\D/g, '');
    const next = (value ?? '').split('');
    if (digit) {
      next[idx] = digit[digit.length - 1];
      const joined = next.join('');
      onChange(joined);
      if (idx < OTP_LENGTH - 1) refs.current[idx + 1]?.focus();
      if (joined.length === OTP_LENGTH) onComplete?.(joined);
    } else {
      next[idx] = '';
      onChange(next.join(''));
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !value?.[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const digits = (e.clipboardData.getData('text') ?? '').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (digits) {
      onChange(digits);
      refs.current[Math.min(digits.length, OTP_LENGTH - 1)]?.focus();
    }
  };

  return (
    <div className="flex justify-between gap-2">
      {Array.from({ length: OTP_LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          value={value?.[i] ?? ''}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          aria-label={`OTP digit ${i + 1}`}
          className="h-12 w-12 rounded-lg border border-input bg-transparent text-center text-lg font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      ))}
    </div>
  );
}

export default function Register() {
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Derive from URL param on every render — reactive
  const paramRole = searchParams.get('role')?.toUpperCase() ?? '';
  const validRoles = Object.values(ROLES);
  const roleLocked = validRoles.includes(paramRole);
  const initialRole = roleLocked ? paramRole : ROLES.CONSUMER;

  // Show only the locked role option; otherwise show all
  const visibleOptions = roleLocked
    ? ROLE_OPTIONS.filter((o) => o.value === initialRole)
    : ROLE_OPTIONS;

  const [step, setStep] = React.useState('details');
  const [role, setRole] = React.useState(initialRole);

  // Sync role state whenever URL param changes (e.g. user navigates /register?role=FARMER → /register?role=CONSUMER)
  React.useEffect(() => {
    setRole(initialRole);
    setStep('details');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramRole]);

  const [values, setValues] = React.useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    vehicleNumber: '', drivingLicense: '',
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [submitting, setSubmitting] = React.useState(false);

  const [otpReq, setOtpReq] = React.useState(null);
  const [otp, setOtp] = React.useState('');
  const [verifyError, setVerifyError] = React.useState('');
  const [verifying, setVerifying] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);
  const payloadRef = React.useRef(null);

  const strength = getPasswordStrength(values.password);

  React.useEffect(() => {
    if (cooldown <= 0) return undefined;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  const sendOtp = async (payload) => {
    const req = await authService.sendRegistrationOtp(payload);
    setOtpReq(req);
    setOtp('');
    setVerifyError('');
    setCooldown(RESEND_COOLDOWN);
    setStep('otp');
    toast({
      title: 'Verification code sent',
      description: 'A one-time code was texted to your mobile number.',
      variant: 'success',
    });
  };

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

    const payload = { ...values, role };
    payloadRef.current = payload;
    setSubmitting(true);
    try {
      await sendOtp(payload);
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const verify = async (e) => {
    e.preventDefault();
    if ((otp ?? '').length !== OTP_LENGTH) {
      setVerifyError(`Enter the ${OTP_LENGTH}-digit code`);
      return;
    }
    if (!otpReq?.requestId) return;
    setVerifying(true);
    try {
      const verified = await authService.verifyRegistrationOtp(otpReq.requestId, otp, payloadRef.current);
      const account = await register(payloadRef.current, verified?.registrationToken);
      navigate(ROLE_ROUTES[account.role]);
      toast({
        title: 'Account created',
        description: `Welcome to Agrolink, ${account.name}`,
        variant: 'success',
      });
    } catch (err) {
      setVerifyError(err.message);
      setOtp('');
    } finally {
      setVerifying(false);
    }
  };

  const submitVerify = async (e) => {
    if (verifying) return;
    await verify(e ?? { preventDefault: () => {} });
  };

  const resend = async () => {
    if (cooldown > 0 || !payloadRef.current) return;
    setVerifyError('');
    try {
      await sendOtp(payloadRef.current);
    } catch (err) {
      setVerifyError(err.message);
    }
  };

  const goBack = () => {
    setStep('details');
    setVerifyError('');
  };

  return (
    <Card glass glow>
      <CardHeader>
        <CardTitle className="text-2xl">
          {roleLocked
            ? `Join as ${ROLE_OPTIONS.find((o) => o.value === initialRole)?.label ?? 'Member'}`
            : 'Create your account'}
        </CardTitle>
        <CardDescription>
          {roleLocked
            ? `You're registering as a ${ROLE_OPTIONS.find((o) => o.value === initialRole)?.label}. ${ROLE_OPTIONS.find((o) => o.value === initialRole)?.desc}.`
            : 'Choose how you want to use Agrolink.'}
        </CardDescription>
        <div className="flex items-center gap-4 pt-1 text-xs font-medium">
          <span className={cn('flex items-center gap-1.5', step === 'details' ? 'text-primary' : 'text-muted-foreground')}>
            <span className={cn('flex h-5 w-5 items-center justify-center rounded-full', step === 'details' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>1</span>
            Your details
          </span>
          <span className={cn('h-px w-6', step === 'otp' ? 'bg-primary' : 'bg-muted')} />
          <span className={cn('flex items-center gap-1.5', step === 'otp' ? 'text-primary' : 'text-muted-foreground')}>
            <span className={cn('flex h-5 w-5 items-center justify-center rounded-full', step === 'otp' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>2</span>
            Verify
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {step === 'details' ? (
          <form onSubmit={submit} className="space-y-4" noValidate>
            {errors.form ? (
              <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                {errors.form}
              </p>
            ) : null}

            <GoogleSignIn mode="register" onError={(msg) => setErrors((e) => ({ ...e, form: msg }))} />

            <div className="relative flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <span className="h-px flex-1 bg-muted" />
              <span>or continue with email</span>
              <span className="h-px flex-1 bg-muted" />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium leading-none">I am a…</span>
              </div>
              <div className={cn('grid gap-2', visibleOptions.length === 1 ? '' : 'sm:grid-cols-3')}>
                {visibleOptions.map((opt) => {
                  const selected = role === opt.value;
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => !roleLocked && setRole(opt.value)}
                      aria-pressed={selected}
                      disabled={roleLocked}
                      className={cn(
                        'group relative flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all',
                        selected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'hover:border-primary/40 hover:bg-muted/60',
                        roleLocked && 'cursor-default'
                      )}
                    >
                      {selected ? (
                        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                      ) : null}
                      <opt.icon className={cn('h-5 w-5', selected ? 'text-primary' : 'text-muted-foreground')} />
                      <span className="text-sm font-semibold">{opt.label}</span>
                      <span className="text-xs text-muted-foreground">{opt.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <FormField label="Full name" required error={errors.name} htmlFor="name">
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="name" value={values.name} onChange={set('name')} placeholder="e.g. Sunita Devi" autoComplete="name" className="pl-9" autoFocus />
              </div>
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Email" required error={errors.email} htmlFor="email">
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="email" type="email" value={values.email} onChange={set('email')} placeholder="you@example.com" autoComplete="email" className="pl-9" />
                </div>
              </FormField>
              <FormField label="Phone" required error={errors.phone} htmlFor="phone">
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="phone" type="tel" inputMode="tel" value={values.phone} onChange={set('phone')} placeholder="+91 9876543210" autoComplete="tel-national" maxLength={15} className="pl-9" />
                </div>
              </FormField>
            </div>

            {role === ROLES.DELIVERY_PARTNER ? (
              <div className="grid gap-4 rounded-lg border border-primary/20 bg-primary/5 p-4 sm:grid-cols-2">
                <FormField label="Vehicle number" required error={errors.vehicleNumber} htmlFor="vehicleNumber">
                  <div className="relative">
                    <Car className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="vehicleNumber" value={values.vehicleNumber} onChange={set('vehicleNumber')} placeholder="e.g. PB-10-AB-1234" className="pl-9" />
                  </div>
                </FormField>
                <FormField label="Driving licence number" required error={errors.drivingLicense} htmlFor="drivingLicense">
                  <div className="relative">
                    <IdCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="drivingLicense" value={values.drivingLicense} onChange={set('drivingLicense')} placeholder="e.g. DL-042019-007654" className="pl-9" />
                  </div>
                </FormField>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Password" required error={errors.password} htmlFor="password">
                <div className="flex flex-col gap-1.5">
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
                  {values.password ? (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <span
                            key={i}
                            className={cn(
                              'h-1 flex-1 rounded-full bg-gradient-to-r transition-colors',
                              i <= strength.score ? MESSAGE[strength.score].bar : 'bg-muted'
                            )}
                          />
                        ))}
                      </div>
                      <p className={cn('text-xs font-medium', MESSAGE[strength.score].textColor)}>
                        {strength.label}
                      </p>
                    </div>
                  ) : null}
                  <p className="text-xs text-muted-foreground">At least 8 characters with letters & numbers</p>
                </div>
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
              {submitting ? <Loader2 className="animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              {submitting ? 'Sending OTP…' : 'Send verification code'}
            </Button>
          </form>
        ) : (
          <form onSubmit={verify} className="space-y-4" noValidate>
            {verifyError ? (
              <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                {verifyError}
              </p>
            ) : null}

            {otpReq ? (
              <div className="space-y-1 rounded-lg border bg-emerald-500/5 p-4 text-sm">
                <p className="flex items-center gap-2 font-semibold text-emerald-700">
                  <MailCheck className="h-4 w-4" /> Code sent
                </p>
                <p>
                  A one-time code was texted to <b>{otpReq.maskedPhone}</b>. Enter it below to verify
                  your mobile and finish creating your account.
                </p>
                {otpReq.otp ? (
                  <p className="pt-1 text-xs text-muted-foreground">
                    Demo mode — use code{' '}
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm tracking-widest">{otpReq.otp}</code>
                  </p>
                ) : null}
              </div>
            ) : null}

            <FormField label={`Enter the ${OTP_LENGTH}-digit code`} required htmlFor="otp">
              <OtpBoxes value={otp} onChange={(v) => { setOtp(v); setVerifyError(''); }} onComplete={submitVerify} disabled={verifying} />
            </FormField>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-1 font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> Change details
              </button>
              <span className="text-muted-foreground">
                {cooldown > 0 ? (
                  <>Resend in {cooldown}s</>
                ) : (
                  <button type="button" onClick={resend} className="font-semibold text-primary hover:underline">
                    Resend code
                  </button>
                )}
              </span>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={verifying || (otp ?? '').length !== OTP_LENGTH}>
              {verifying ? <Loader2 className="animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              {verifying ? 'Verifying…' : 'Verify & create account'}
            </Button>
          </form>
        )}

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