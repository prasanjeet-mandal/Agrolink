import { Link, useSearchParams } from 'react-router-dom';
import { Sprout, Store, Tractor, Truck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROLES } from '@/constants/roles';
import { cn } from '@/utils/cn';

const GROUPS = {
  seller: {
    kicker: 'Sell',
    title: 'Sell on Agrolink',
    subtitle: 'Pick how you want to sell — a single farmer or an FPO.',
    roles: [
      { value: ROLES.FARMER, label: 'Farmer', desc: 'Sell your own farm produce directly', icon: Tractor },
      { value: ROLES.FPO, label: 'FPO / Organization', desc: 'Aggregate member produce & sell in bulk', icon: Users },
    ],
  },
  buyer: {
    kicker: 'Buy',
    title: 'Buy on Agrolink',
    subtitle: 'Pick how you want to buy — an individual buyer or an FPO.',
    roles: [
      { value: ROLES.CONSUMER, label: 'Consumer', desc: 'Buy fresh produce straight from the farm', icon: Store },
      { value: ROLES.FPO, label: 'FPO / Organization', desc: 'Bulk purchase for your member network', icon: Users },
    ],
  },
  driver: {
    kicker: 'Partner',
    title: 'Become a Delivery Partner',
    subtitle: 'Deliver farm orders and grow with Agrolink.',
    roles: [
      { value: ROLES.DELIVERY_PARTNER, label: 'Delivery Partner', desc: 'Deliver orders as a logistics partner', icon: Truck },
    ],
  },
};

export default function SelectRole() {
  const [searchParams] = useSearchParams();
  const group = (searchParams.get('group') ?? '').toLowerCase();
  const config = GROUPS[group];

  if (!config) {
    return (
      <Card glass glow>
        <CardHeader>
          <CardTitle className="text-2xl">Choose how you want to join</CardTitle>
          <CardDescription>Pick an option to continue.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.keys(GROUPS).map((key) => (
            <Link
              key={key}
              to={`/select-role?group=${key}`}
              className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sprout className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="font-bold">{GROUPS[key].title}</p>
                <p className="text-xs text-muted-foreground">{GROUPS[key].subtitle}</p>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    );
  }

  const { kicker, title, subtitle, roles } = config;

  return (
    <Card glass glow>
      <CardHeader>
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-primary">{kicker}</p>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {roles.map((role) => (
          <div key={role.value} className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'
                )}
              >
                <role.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="font-bold">{role.label}</p>
                <p className="text-xs text-muted-foreground">{role.desc}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button asChild size="sm">
                <Link to={`/register?role=${role.value}`}>Create account</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to={`/login?role=${role.value}`}>Sign in</Link>
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}