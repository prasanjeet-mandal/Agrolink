import * as React from 'react';
import { BadgeCheck, MapPin, Phone, Mail, LandPlot, Banknote, ShieldCheck, Leaf, QrCode } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { producerService } from '@/services/producerService';
import { productService } from '@/services/productService';
import { Loading, ProductImage } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/utils/formatPrice';

export default function Profile() {
  const { user } = useAuth();
  const [producer, setProducer] = React.useState(null);
  const [products, setProducts] = React.useState([]);

  React.useEffect(() => {
    let mounted = true;
    producerService.getProfile(user.id).then((p) => {
      if (!mounted) return;
      setProducer(p);
      productService.getMine(p.id).then((pr) => mounted && setProducts(pr));
    });
    return () => { mounted = false; };
  }, [user.id]);

  if (!producer) return <Loading label="Loading farm profile…" />;

  const settlementDetails = [
    { label: 'Land (acres)', value: producer.landSizeAcres || '—', icon: LandPlot },
    { label: 'Crops', value: producer.crops?.join(', ') || '—', icon: Leaf },
    { label: 'Farmer ID', value: producer.id, icon: BadgeCheck },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-wrap items-center gap-5 p-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-4xl">
            🧑‍🌾
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{producer.farmName}</h1>
              {producer.isVerified ? <BadgeCheck className="h-5 w-5 text-emerald-600" /> : null}
            </div>
            <p className="text-sm text-muted-foreground">{user.name}</p>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {producer.location.district}, {producer.location.state}
            </p>
            <div className="mt-1 flex flex-wrap gap-2">
              {producer.verified ? <Badge variant="success">Verified farmer</Badge> : null}
              <Badge variant="outline"><ShieldCheck className="h-3 w-3" /> {producer.rating} rating</Badge>
              <Badge variant="outline">{products.length} listings</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Farm details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {settlementDetails.map((d) => (
              <div key={d.label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground"><d.icon className="h-4 w-4" /> {d.label}</span>
                <span className="font-medium text-right">{d.value}</span>
              </div>
            ))}
            <Separator />
            <p className="text-sm text-muted-foreground">{producer.farmDescription}</p>
            <div className="pt-1"><Badge variant="outline">{producer.certifications?.join(' · ') || 'No certifications'}</Badge></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact & settlement</CardTitle>
            <CardDescription>Where we send order payments.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {user.phone}</div>
            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> {user.email}</div>
            <div className="flex items-center gap-2"><Banknote className="h-4 w-4 text-muted-foreground" /> {producer.bankDetails?.bank} •••• {producer.bankDetails?.accountLast4}</div>
            <div className="flex items-center gap-2"><QrCode className="h-4 w-4 text-muted-foreground" /> UPI {producer.upiId}</div>
            <Separator />
            <p className="text-xs text-muted-foreground">
              {producer.verified
                ? 'Verification complete — orders settle 24-48h after delivery.'
                : 'Verification pending — you can still list produce.'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent listings</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {products.slice(0, 4).map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-lg border p-3">
              <ProductImage productId={p.id} icon={p.icon} category={p.category} name={p.name} className="h-10 w-10 rounded-md" textClassName="text-xl" />
              <div>
                <p className="text-sm font-semibold">{p.name}</p>
                <p className="text-xs text-muted-foreground">{formatPrice(p.pricePerUnit)}/{p.unit} · {p.stockQuantity} {p.unit} in stock</p>
              </div>
            </div>
          ))}
          {!products.length && <p className="text-sm text-muted-foreground">Nothing listed yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}