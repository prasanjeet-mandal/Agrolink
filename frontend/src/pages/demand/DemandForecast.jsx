import * as React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, MapPin, TrendingUp } from 'lucide-react';
import { demandService } from '@/services/demandService';
import { productService } from '@/services/productService';
import { PageHeader, Loading, StatCard } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { formatPrice } from '@/utils/formatPrice';
import { formatDate } from '@/utils/formatDate';

export default function DemandForecast() {
  const [forecasts, setForecasts] = React.useState([]);
  const [products, setProducts] = React.useState({});
  const [selected, setSelected] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    Promise.all([demandService.getForecasts(), productService.getAll()])
      .then(([fc, pr]) => {
        if (!mounted) return;
        const map = Object.fromEntries(pr.map((p) => [p.id, p]));
        setProducts(map);
        setForecasts(fc);
        setSelected(fc[0].id);
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  if (loading) return <Loading label="Loading demand forecast…" />;

  const current = forecasts.find((f) => f.id === selected) ?? forecasts[0];
  const product = products[current?.productId] ?? {};
  const history = current?.history.map((p) => ({ ...p, kind: 'Historical' })) ?? [];
  const future = current?.forecast.map((p) => ({ ...p, kind: 'Forecast' })) ?? [];
  const data = [...history, ...future];

  const lastDemand = history.length ? history[history.length - 1].value : 0;
  const futureDemand = future.length ? future[future.length - 1].value : 0;
  const growth = ((futureDemand - lastDemand) / Math.max(1, lastDemand)) * 100;
  const peak = Math.max(...future.map((p) => p.value), lastDemand);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demand forecast"
        description="Projected demand for key commodities across sourcing districts."
        actions={<Button asChild variant="outline" className="gap-2"><Link to="/pricing"><BarChart3 className="h-4 w-4" /> Price forecast</Link></Button>}
      />

      <Card className="mx-auto max-w-sm">
        <CardContent className="pt-6">
          <Select value={current.id} onValueChange={setSelected}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {forecasts.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {products[f.productId]?.name ?? f.productId} · {f.district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Projected demand growth"
          value={`${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`}
          icon={growth >= 0 ? TrendingUp : BarChart3}
          hint={growth >= 0 ? 'rising over next 6 months' : 'easing over next 6 months'}
        />
        <StatCard
          label="Peak monthly demand"
          value={peak.toLocaleString('en-IN')} 
          icon={BarChart3}
          hint={`commonly ${current.district} / month`}
        />
        <StatCard
          label="Suggested price"
          value={product.pricePerUnit ? formatPrice(product.pricePerUnit) : '—'}
          icon={TrendingUp}
          hint={product.unit ? `current listing per ${product.unit}` : 'no listed price'}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> {current.district} — {product.name}
          </CardTitle>
          {product.category ? <Badge variant="outline">{product.category}</Badge> : null}
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={data} margin={{ left: 4, right: 4, top: 8 }}>
              <defs>
                <linearGradient id="gradForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="at" tickFormatter={(v) => formatDate(v, { month: 'short', year: '2-digit' })} tick={{ fontSize: 11 }} tickMargin={6} />
              <YAxis tickFormatter={(v) => v.toLocaleString('en-IN')} tick={{ fontSize: 11 }} width={52} />
              <Tooltip
                formatter={(value) => [Number(value).toLocaleString('en-IN'), 'Demand']}
                labelFormatter={(v) => formatDate(v, { day: '2-digit', month: 'short', year: 'numeric' })}
              />
              <Legend />
              <Area type="monotone" dataKey="value" name="Demand" stroke="#16a34a" strokeWidth={2} fill="url(#gradForecast)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
          <p className="text-sm text-muted-foreground">
            Commodity {product.name} is projected to be {growth >= 0 ? 'in high demand' : 'cooling off'} in {current.district}. Plan sourcing and pricing accordingly.
          </p>
          <Button asChild size="sm"><Link to="/pricing">View price forecast</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}