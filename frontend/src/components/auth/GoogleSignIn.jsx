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
  }, [googleLogin, navigate, toast, onError]);

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
                  placeholder="e.g. PB-10-AB-1234"
                />
              </FormField>
              <FormField label="Driving licence" required htmlFor="gLicense">
                <Input
                  id="gLicense"
                  value={drivingLicense}
                  onChange={(e) => setDrivingLicense(e.target.value)}
                  placeholder="e.g. DL-042019-007654"
                />
              </FormField>
            </div>
          ) : null}

          <Button type="submit" className="w-full" size="lg" disabled={submitting || (pickedRole === ROLES.DELIVERY_PARTNER && (!vehicleNumber.trim() || !drivingLicense.trim()))}>
            {submitting ? <Loader2 className="animate-spin" /> : null}
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
            className="w-full"
            size="lg"
            disabled={disabled || !active}
            onClick={openPopup}
          >
            {!active || submitting ? <Loader2 className="animate-spin" /> : null}
            {mode === 'register' ? 'Continue with Google' : 'Sign in with Google'}
          </Button>
        </>
      )}
    </div>
  );
}