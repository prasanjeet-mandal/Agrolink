import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { producerService } from '@/services/producerService';
import { productService } from '@/services/productService';
import { pricingService } from '@/services/pricingService';
import { useToast } from '@/components/ui/toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageHeader } from '@/components/common';
import ProductForm from '@/components/forms/ProductForm';
import { formatPrice } from '@/utils/formatPrice';

export default function AddProduct() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [producer, setProducer] = React.useState(null);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    producerService.getProfile(user.id).then(setProducer).catch(() => setProducer(null));
  }, [user.id]);

  const submit = async (values) => {
    setSubmitting(true);
    try {
      let suggested = null;
      try {
        const estimate = await pricingService.calculate({
          basePrice: Number(values.pricePerUnit),
          grades: [values.quality.toLowerCase()],
        });
        suggested = estimate.suggested;
      } catch {
        suggested = null;
      }
      const payload = {
        ...values,
        producerId: producer.id,
        isFpo: false,
        location: {
          state: producer.location.state,
          district: producer.location.district,
          village: producer.location.village,
        },
        certification: values.certification ? values.certification.split(',').map((c) => c.trim()).filter(Boolean) : [],
        pricePerUnit: Number(values.pricePerUnit),
        stockQuantity: Number(values.stockQuantity),
        minOrderQuantity: Number(values.minOrderQuantity),
      };
      await productService.create(payload);
      toast({
        title: 'Product listed',
        description: suggested != null
          ? `Listed at ${formatPrice(payload.pricePerUnit)}/${payload.unit}. Market range suggests ${formatPrice(suggested)}/${payload.unit}.`
          : 'Your produce is now live in the marketplace.',
        variant: 'success',
      });
      navigate('/producer/farmer/products');
    } catch (err) {
      toast({ title: 'Could not list product', description: err.message, variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add produce"
        description="List fresh stock and let buyers order it directly."
      />
      <Card>
        <CardHeader>
          <CardTitle>Product details</CardTitle>
          <CardDescription>
            Tip — the Pricing tool can recommend a fair price based on your grade before you finalise.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm submitLabel="List product" submitting={submitting} onSubmit={submit} />
        </CardContent>
      </Card>
    </div>
  );
}