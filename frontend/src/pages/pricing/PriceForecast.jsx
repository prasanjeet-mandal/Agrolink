import * as React from 'react';
import { Link } from 'react-router-dom';
import { TrendingDown, TrendingUp, Calculator, Info } from 'lucide-react';
import { pricingService } from '@/services/pricingService';
import { PageHeader, Loading, StatCard } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { formatPrice } from '@/utils/formatPrice';
import { formatDate } from '@/utils/formatDate';

const PRODUCTS = [
  { id: 'pr1', name: 'Basmati Rice (Premium)', icon: '🌾', unit: 'kg' },
  { id: 'pr6', name: 'Kachi Ghani Mustard Oil', icon: '🧡', unit: 'litre' },
  { id: 'pr4', name: 'Organic Onion', icon: '🧅', unit: 'kg' },
  { id: 'pr9', name: 'Raw Turmeric', icon: '🫚', unit: 'kg' },
  { id: 'pr7', name: 'Sunflower Seeds', icon: '🌻', unit: 'kg' },
];

export default function PriceForecast() {
  const [product, setProduct] = React.useState(PRODUCTS[0].id);
  const [forecast, setForecast] = React.useState(null);
  const [fees, setFees] = React.useState({ commission: null, logistics: null });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      pricingService.getForecast(product),
      pricingService.getTrend().catch(() => ({ commission: null, logistics: null })),
    ]).then(([f, t]) => {
      if (!mounted) return;
      setForecast(f);
      setFees(t);
    }).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [product]);

  if (loading || !forecast) return <Loading label="Loading price forecast…" />;

  const current = PRODUCTS.find((p) => p.id === product);
  const history = forecast.history.map((p) => ({ ...p, time: new Date(p.at).getTime(), prev: null }));
  const future = forecast.forecast.map((p) => ({ ...p, time: new Date(p.at).getTime(), span: null }));
  const data = [...history, ...future];

  const lastValue = history[history.length - 1].value;
  const futureValue = future[future.length - 1].value;
  const change = ((futureValue - lastValue) / lastValue) * 100;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Price forecast"
        description="Mandi (Agmarknet) trends with a 6-month AI forecast for your region."
        actions={<Button asChild variant="outline" className="gap-2"><Link to="/pricing/calculate"><Calculator className="h-4 w-4" /> Price calculator</Link></Button>}
      />

      <Card className="mx-auto max-w-sm">
        <CardContent className="pt-6">
          <Select value={product} onValueChange={setProduct}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PRODUCTS.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.icon} {p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label={`Current mandi (${current.unit})`}
          value={formatPrice(lastValue)}
          icon={lastValue >= futureValue ? TrendingUp : TrendingDown}
          hint="latest in forecast window"
        />
        <StatCard
          label={`Est. in 6 months`}
          value={formatPrice(futureValue)}
          icon={change >= 0 ? TrendingUp : TrendingDown}
          hint={`${change >= 0 ? '+' : ''}${change.toFixed(1)}% expected`}
        />
        <StatCard
          label="Suggested range"
          value={<span>{formatPrice(futureValue * 0.95)} – {formatPrice(futureValue * 1.05)}</span>}
          icon={Calculator}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historical & forecast trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={340}>
            <ComposedChart data={data} margin={{ left: 4, right: 4, top: 8 }}>
              <defs>
                <linearGradient id="gradHistory" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="time"
                tickFormatter={(v) => formatDate(v, { month: 'short', year: '2-digit' })}
                tick={{ fontSize: 11 }}
                tickMargin={6}
              />
              <YAxis
                tickFormatter={(v) => `₹${v}`}
                tick={{ fontSize: 11 }}
                width={44}
              />
              <Tooltip
                formatter={(value, name) => [formatPrice(value), name === 'prev' ? 'Historical' : 'Forecast']}
                labelFormatter={(v) => formatDate(v, { day: '2-digit', month: 'short', year: 'numeric' })}
              />
              <Legend formatter={(value) => (value === 'prev' ? 'Historical (₹)' : 'Forecast (₹)')} />
              <Area type="monotone" dataKey="prev" name="prev" stroke="#16a34a" strokeWidth={2} fill="url(#gradHistory)" dot={false} />
              <Line type="monotone" dataKey="value" name="future" stroke="#d97706" strokeWidth={2.5} strokeDasharray="6 4" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            Suggested average platform fees on this commodity: commission {fees.commission ?? '—'}%, logistics {fees.logistics ?? '—'}%.
          </p>
          <Button asChild size="sm"><Link to="/pricing/calculate">Estimate your price</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}