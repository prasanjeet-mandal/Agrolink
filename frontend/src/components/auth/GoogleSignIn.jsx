import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/toast';
import { GOOGLE_CLIENT_ID } from '@/constants/config';
import { ROLES, ROLE_ROUTES, ROLE_LABELS } from '@/constants/roles';
import { cn } from '@/utils/cn';

const PICKER_OPTIONS = [
  { value: ROLES.CONSUMER, label: ROLE_LABELS[ROLES.CONSUMER] },
  { value: ROLES.FARMER, label: ROLE_LABELS[ROLES.FARMER] },
  { value: ROLES.FPO, label: ROLE_LABELS[ROLES.FPO] },
  { value: ROLES.DELIVERY_PARTNER, label: ROLE_LABELS[ROLES.DELIVERY_PARTNER] },
];

function GoogleIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
      />
    </svg>
  );
}

let gsiPromise = null;

function loadGsi() {
  if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
    return Promise.resolve(window.google);
  }
  if (gsiPromise) return gsiPromise;
  gsiPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = () => resolve(window.google);
    s.onerror = () => reject(new Error('Failed to load Google sign-in'));
    document.head.appendChild(s);
  });
  return gsiPromise;
}

export default function GoogleSignIn({
  mode = 'login',
  className,
  disabled,
  defaultRole,
  onError,
}) {
  const { googleLogin, googleSignupComplete } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [active, setActive] = React.useState(false);
  const [error, setError] = React.useState('');
  const [rolePickerVisible, setRolePickerVisible] = React.useState(false);
  const [signupTicket, setSignupTicket] = React.useState('');
  const [pickedRole, setPickedRole] = React.useState(ROLES.CONSUMER);
  const [vehicleNumber, setVehicleNumber] = React.useState('');
  const [drivingLicense, setDrivingLicense] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const codeClientRef = React.useRef(null);
  const setLoadingForPopup = React.useRef(null);

  const notConfigured = !GOOGLE_CLIENT_ID;

  const openPopup = React.useCallback(() => {
    setError('');
    const client = codeClientRef.current;
    if (!client) {
      setError('Google sign-in is still loading. Please try again');
      return;
    }
    setLoadingForPopup.current = (val) => setActive(val ? false : true);
    setActive(false);
    try {
      client.requestCode();
    } catch {
      setActive(true);
      setError('Unable to start Google sign-in. Please try again');
    }
  }, []);

  const handleCode = React.useCallback(async (code) => {
    setSubmitting(true);
    try {
      const result = await googleLogin(code);
      if (result && result.needsRole) {
        const role = defaultRole && defaultRole !== ROLES.DELIVERY_PARTNER ? defaultRole : null;
        if (role) {
          try {
            const user = await googleSignupComplete(result.signupTicket, { role });
            toast({
              title: 'Welcome',
              description: `Signed in as ${user?.name ?? result?.email ?? 'your account'}`,
              variant: 'success',
            });
            navigate(ROLE_ROUTES[user?.role] ?? '/', { replace: true });
          } catch (err) {
            const message = err?.message || 'Unable to complete sign-up';
            setError(message);
            onError?.(message);
          }
          return;
        }
        setSignupTicket(result.signupTicket);
        setRolePickerVisible(true);
        setError('');
        return;
      }
      toast({
        title: 'Welcome',
        description: `Signed in as ${result?.name ?? result?.email ?? 'your account'}`,
        variant: 'success',
      });
      navigate(ROLE_ROUTES[result?.role] ?? '/', { replace: true });
    } catch (err) {
      const message = err?.message || 'Google sign-in failed. Please try again';
      setError(message);
      onError?.(message);
    } finally {
      setSubmitting(false);
    }
  }, [googleLogin, googleSignupComplete, navigate, toast, onError, defaultRole]);

  const completeSignup = React.useCallback(async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const user = await googleSignupComplete(signupTicket, {
        role: pickedRole,
        vehicleNumber,
        drivingLicense,
      });
      toast({
        title: 'Welcome',
        description: `Signed in as ${user?.name ?? 'your account'}`,
        variant: 'success',
      });
      navigate(ROLE_ROUTES[user?.role] ?? '/', { replace: true });
    } catch (err) {
      const message = err?.message || 'Unable to complete sign-up';
      setError(message);
      onError?.(message);
    } finally {
      setSubmitting(false);
    }
  }, [signupTicket, pickedRole, vehicleNumber, drivingLicense, submitting, googleSignupComplete, navigate, toast, onError]);

  const handleGoogleError = React.useCallback((code) => {
    const map = {
      popup_closed_by_user: 'Sign-in cancelled',
      popup_failed_to_open: 'Sign-in popup was blocked by your browser',
      opt_out_or_no_session: 'No Google session found',
    };
    const message = map[code] ?? 'Google sign-in was cancelled';
    setError(message);
    onError?.(message);
  }, [onError]);

  React.useEffect(() => {
    if (notConfigured) return;
    let cancelled = false;
    (async () => {
      try {
        const google = await loadGsi();
        if (cancelled) return;
        codeClientRef.current = google.accounts.oauth2.initCodeClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile openid',
          ux_mode: 'popup',
          redirect_uri: 'postmessage',
          callback: (response) => {
            if (setLoadingForPopup.current) setLoadingForPopup.current(false);
            setError('');
            if (response?.code) {
              handleCode(response.code);
            } else if (response?.error) {
              handleGoogleError(response.error);
            }
          },
        });
        setActive(true);
      } catch {
        if (!cancelled) setError('Google sign-in is unavailable');
      }
    })();
    return () => { cancelled = true; };
  }, [notConfigured, handleCode, handleGoogleError]);

  if (notConfigured) return null;

  return (
    <div className={cn('space-y-3', className)}>
      {rolePickerVisible ? (
        <form onSubmit={completeSignup} className="space-y-3">
          {error ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
              {error}
            </p>
          ) : null}

          <p className="text-sm font-medium text-muted-foreground">
            Choose how you want to use Agrolink
          </p>

          <div className="grid grid-cols-2 gap-2">
            {PICKER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPickedRole(opt.value)}
                className={cn(
                  'rounded-lg border p-2 text-left text-sm font-semibold transition-all',
                  pickedRole === opt.value
                    ? 'border-primary bg-primary/10 ring-1 ring-primary'
                    : 'hover:border-primary/40 hover:bg-muted/60'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {pickedRole === ROLES.DELIVERY_PARTNER ? (
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Vehicle number" required htmlFor="gVehicle">
                <Input
                  id="gVehicle"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="Enter vehicle registration number"
                />
              </FormField>
              <FormField label="Driving licence" required htmlFor="gLicense">
                <Input
                  id="gLicense"
                  value={drivingLicense}
                  onChange={(e) => setDrivingLicense(e.target.value)}
                  placeholder="Enter driving licence number"
                />
              </FormField>
            </div>
          ) : null}

          <Button type="submit" className="w-full gap-2" size="lg" disabled={submitting || (pickedRole === ROLES.DELIVERY_PARTNER && (!vehicleNumber.trim() || !drivingLicense.trim()))}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon className="h-5 w-5" />}
            {submitting ? 'Creating account…' : 'Continue with Google'}
          </Button>
        </form>
      ) : (
        <>
          {error ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
              {error}
            </p>
          ) : null}

          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            size="lg"
            disabled={disabled || !active}
            onClick={openPopup}
          >
            {!active || submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon className="h-5 w-5" />}
            {mode === 'register' ? 'Continue with Google' : 'Sign in with Google'}
          </Button>
        </>
      )}
    </div>
  );
}