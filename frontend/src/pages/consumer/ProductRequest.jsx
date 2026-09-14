import * as React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarClock, FileText } from 'lucide-react';
import { productService } from '@/services/productService';
import { useToast } from '@/components/ui/toast';
import { Loading, ProductImage } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField } from '@/components/forms';
import { validateForm, required, validatePositiveNumber } from '@/utils/validation';
import { formatPrice } from '@/utils/formatPrice';

export default function ProductRequest() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [product, setProduct] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [values, setValues] = React.useState({ quantity: '', timeline: '2 weeks', notes: '' });
  const [errors, setErrors] = React.useState({});
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    productService.getById(productId).then(setProduct).finally(() => setLoading(false));
  }, [productId]);

  const submit = (e) => {
    e.preventDefault();
    const rules = {
      quantity: (v) => validatePositiveNumber(v, 'Quantity') || (Number(v) < (product?.minOrderQuantity ?? 1)
        ? `Min order is ${product.minOrderQuantity} ${product.unit}` : null),
      timeline: (v) => required(v, 'Preferred timeline'),
    };
    const validation = validateForm(values, rules);
    setErrors(validation);
    if (Object.keys(validation).length) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast({
        title: 'Request sent to producer',
        description: `A bulk quote for ${values.quantity} ${product.unit} has been forwarded to ${product.producerName}.`,
        variant: 'success',
      });
      navigate('/marketplace');
    }, 600);
  };

  if (loading) return <Loading label="Loading product…" />;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
        <Link to={`/marketplace/${product.id}`}>
          <ArrowLeft className="h-4 w-4" /> Back to product
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1 overflow-hidden">
          <ProductImage productId={product.id} icon={product.icon} category={product.category} name={product.name} className="aspect-video" textClassName="text-5xl" />
          <CardContent className="space-y-2 pt-4">
            <h2 className="font-bold">{product.name}</h2>
            <p className="text-sm text-muted-foreground">
              {product.producerName} · {product.location?.district}, {product.location?.state}
            </p>
            <p className="text-sm">
              Listed at <strong>{formatPrice(product.pricePerUnit)}/{product.unit}</strong>
              {' '}· min order {product.minOrderQuantity} {product.unit}
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Request a bulk quote
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label={`Quantity (${product.unit})`} required error={errors.quantity} htmlFor="quantity">
                  <Input
                    id="quantity"
                    type="number"
                    min={product.minOrderQuantity}
                    placeholder={`e.g. ${product.minOrderQuantity * 10}`}
                    value={values.quantity}
                    onChange={(e) => setValues((v) => ({ ...v, quantity: e.target.value }))}
                  />
                </FormField>
                <FormField label="Preferred timeline" required error={errors.timeline} htmlFor="timeline">
                  <Select value={values.timeline} onValueChange={(v) => setValues((s) => ({ ...s, timeline: v }))}>
                    <SelectTrigger id="timeline">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asap">ASAP</SelectItem>
                      <SelectItem value="1 week">Within 1 week</SelectItem>
                      <SelectItem value="2 weeks">Within 2 weeks</SelectItem>
                      <SelectItem value="1 month">Within 1 month</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
              <FormField label="Notes for producer" htmlFor="notes" hint="Grading, packaging or delivery preferences.">
                <Textarea
                  id="notes"
                  value={values.notes}
                  onChange={(e) => setValues((v) => ({ ...v, notes: e.target.value }))}
                  placeholder="e.g. Need 25kg nylon bags, delivery to warehouse…"
                  rows={4}
                />
              </FormField>
              <div className="flex items-center gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
                <CalendarClock className="h-4 w-4 shrink-0 text-primary" />
                The producer responds with a final quote. You can accept or negotiate on the quoted price.
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Sending request…' : 'Send request'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}