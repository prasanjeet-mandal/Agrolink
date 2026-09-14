import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, LogOut, MapPin, Sprout } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/services/userService';
import { PageHeader, Loading } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ROLE_LABELS } from '@/constants/roles';
import { formatDate } from '@/utils/formatDate';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    userService.getProfile(user.id).then((data) => {
      if (mounted) setProfile(data);
    }).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [user.id]);

  if (loading) return <Loading />;

  const pinfo = profile?.profile;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="Your account and farm/consumer details."
        actions={
          <Button
            variant="outline"
            onClick={() => { logout(); navigate('/login'); }}
            className="gap-2 text-destructive"
          >
            <LogOut className="h-4 w-4" /> Log out
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
            <Avatar className="h-20 w-20 text-xl">
              <AvatarFallback className="bg-primary/15 text-primary">
                {(profile?.name ?? 'U').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-bold">{profile?.name}</h2>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
              <p className="text-sm text-muted-foreground">+91 {profile?.phone}</p>
            </div>
            <Badge variant="secondary" className="gap-1">
              {ROLE_LABELS[profile?.role]}
              {profile?.verified ? <BadgeCheck className="h-3 w-3 text-primary" /> : null}
            </Badge>
            <p className="text-xs text-muted-foreground">
              Member since {formatDate(new Date().setFullYear(new Date().getFullYear() - 1))}
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>Verified profile information used for orders and settlements.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pinfo?.location ? (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                {pinfo.location.village ? `${pinfo.location.village}, ` : ''}
                {pinfo.location.district}, {pinfo.location.state}
              </div>
            ) : null}
            {pinfo?.deliveryAddress ? (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                {pinfo.deliveryAddress.line1}, {pinfo.deliveryAddress.city}, {pinfo.deliveryAddress.state} — {pinfo.deliveryAddress.pincode}
              </div>
            ) : null}
            <Separator />
            {pinfo?.certifications?.length ? (
              <div className="flex flex-wrap gap-2">
                {pinfo.certifications.map((c) => (
                  <Badge key={c} variant="outline" className="gap-1">
                    <Sprout className="h-3 w-3 text-primary" /> {c}
                  </Badge>
                ))}
              </div>
            ) : null}
            {pinfo?.farmDescription ? (
              <p className="text-sm text-muted-foreground">{pinfo.farmDescription}</p>
            ) : null}
            <Separator />
            <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}