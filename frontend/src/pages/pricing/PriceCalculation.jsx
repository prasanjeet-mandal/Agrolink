import * as React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calculator, Info, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { pricingService } from '@/services/pricingService';
import { PageHeader } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField } from '@/components/forms';
import { Badge } from '@/components/ui/badge';
import { ROLES } from '@/constants/roles';
import { formatPrice } from '@/utils/formatPrice';
import { validateForm, validatePositiveNumber } from '@/utils/validation';

const GRADES = [
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium (+8%)' },
  { value: 'a-plus', label: 'A+ grade (+12%)' },
  { value: 'organic', label: 'Organic (+25%)' },
];

export default function PriceCalculation() {
  const { user } = useAuth();
  const [values, setValues] = React.useState({
    basePrice: '',
    grade: 'standard',
    mode: user.role === ROLES.FPO ? 'fpo_aggregation' : 'farmer_suggestion',
    unit: 'kg',
  });
  const [errors, setErrors] = React.useState({});
  const [result, setResult] = React.useState(null);
  const [calculating, setCalculating] = React.useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const rules = {
      basePrice: (v) => validatePositiveNumber(v, 'Base price'),
    };
    const validation = validateForm(values, rules);
    setErrors(validation);
    if (Object.keys(validation).length) return;

    setCalculating(true);
    setResult(null);
    try {
      const res = await pricingService.calculate({
        basePrice: Number(values.basePrice),
        grades: [values.grade],
        mode: values.mode,
      });
      setResult({ ...res, basePrice: Number(values.basePrice), unit: values.unit });
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
        <Link to="/pricing"><ArrowLeft className="h-4 w-4" /> Back to price forecast</Link>
      </Button>
      <PageHeader
        title="Price calculator"
        description="Estimate a fair, AI-recommended price for your produce grade."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5 text-primary" /> Inputs</CardTitle>
            <CardDescription>Based on your grade and selling channel.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Base mandi price (₹)" required error={errors.basePrice} htmlFor="basePrice">
                  <Input id="basePrice" type="number" min={0} value={values.basePrice} onChange={(e) => setValues((v) => ({ ...v, basePrice: e.target.value }))} placeholder="e.g. 140" />
                </FormField>
                <FormField label="Sell unit" htmlFor="unit">
                  <Select value={values.unit} onValueChange={(v) => setValues((s) => ({ ...s, unit: v }))}>
                    <SelectTrigger id="unit"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="quintal">quintal</SelectItem>
                      <SelectItem value="litre">litre</SelectItem>
                      <SelectItem value="bag">bag</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <FormField label="Quality grade" htmlFor="grade">
                <Select value={values.grade} onValueChange={(v) => setValues((s) => ({ ...s, grade: v }))}>
                  <SelectTrigger id="grade"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GRADES.map((g) => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormField>

              {user.role === ROLES.FPO ? (
                <FormField label="Selling channel" htmlFor="mode">
                  <Select value={values.mode} onValueChange={(v) => setValues((s) => ({ ...s, mode: v }))}>
                    <SelectTrigger id="mode"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fpo_aggregation">FPO aggregation (bulk, lower logistics)</SelectItem>
                      <SelectItem value="farmer_suggestion">Direct producer (smaller lots)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              ) : null}

              <Button type="submit" size="lg" className="gap-2" disabled={calculating}>
                <Sparkles className="h-4 w-4" />
                {calculating ? 'Calculating…' : 'Suggest fair price'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <Info className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Enter a base price to see a grade- and channel-adjusted fair price with confidence range.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-lg bg-emerald-50 p-4 text-center dark:bg-emerald-950/40">
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Suggested price</p>
                  <p className="mt-1 text-3xl font-extrabold text-emerald-700 dark:text-emerald-300">
                    {formatPrice(result.suggested)}<span className="text-base font-semibold">/{result.unit}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Confidence range</span>
                  <span className="font-semibold">{formatPrice(result.min)} – {formatPrice(result.max)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">vs base price</span>
                  <Badge variant={result.suggested >= result.basePrice ? 'success' : 'warning'}>
                    {((result.suggested - result.basePrice) / result.basePrice * 100).toFixed(1)}%
                  </Badge>
                </div>

                <div className="space-y-2 rounded-lg border p-3 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Factor breakdown</p>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Grade uplift</span>
                    <span className="font-medium">×{result.factors.grading.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Logistics factor</span>
                    <span className="font-medium">×{result.factors.logistics.toFixed(2)}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{result.factors.qualityNote}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}