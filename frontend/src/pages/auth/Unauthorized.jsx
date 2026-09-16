import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/toast';

export default function Unauthorized() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const switchAccount = () => {
    logout();
    toast({ title: 'Signed out', description: 'Sign in with the right account to continue.' });
    navigate('/login', { replace: true });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-destructive/10 blur-3xl"
      />
      <Card glass glow lift className="relative max-w-md w-full">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <span className="agrolink-glow flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-destructive to-orange-500 text-white">
            <ShieldAlert className="h-8 w-8" />
          </span>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Access restricted</h1>
            <p className="text-sm text-muted-foreground">
              Your account role does not have permission to view this page.
            </p>
          </div>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <Button onClick={switchAccount} variant="outline" className="gap-2">
              <LogOut className="h-4 w-4" /> Sign in with a different account
            </Button>
            <Button asChild className="gap-2">
              <Link to="/">
                <ArrowLeft className="h-4 w-4" /> Go to home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}