import * as React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Mail, MailCheck } from 'lucide-react';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/forms';
import { validateEmail, required } from '@/utils/validation';

export default function ForgotPassword() {
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const validation = validateEmail(email);
    if (validation) return setError(validation);
    if (!required(email)) return setError('Email is required');
    setError(null);
    setSubmitting(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <Card glass glow>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <span className="agrolink-glow flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-emerald-600 text-white">
            <MailCheck className="h-8 w-8" />
          </span>
          <div className="space-y-1">
            <h2 className="text-xl font-bold">Check your inbox</h2>
            <p className="mx-auto max-w-sm text-sm text-muted-foreground">
              If an account exists for <span className="font-medium text-foreground">{email}</span>,
              a password reset link (mock) is on its way.
            </p>
          </div>
          <Button asChild variant="outline" className="mt-2 gap-2">
            <Link to="/login">
              <ArrowLeft className="h-4 w-4" /> Back to sign in
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card glass glow>
      <CardHeader>
        <CardTitle className="text-2xl">Reset password</CardTitle>
        <CardDescription>
          Enter your account email and we will send you a reset link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <FormField label="Email" required error={error} htmlFor="email">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                autoComplete="email"
                className="pl-9"
                autoFocus
              />
            </div>
          </FormField>
          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? <Loader2 className="animate-spin" /> : null}
            {submitting ? 'Sending link…' : 'Send reset link'}
          </Button>
          <Button asChild variant="link" className="w-full" size="sm">
            <Link to="/login">Back to sign in</Link>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}