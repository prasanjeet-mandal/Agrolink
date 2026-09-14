import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { producerService } from '@/services/producerService';
import { productService } from '@/services/productService';
import { useToast } from '@/components/ui/toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageHeader } from '@/components/common';
import ProductForm from '@/components/forms/ProductForm';

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
      const payload = {
        ...values,
        producerId: producer.id,
        isFpo: true,
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
        description: 'This product is now live for members and consumers.',
        variant: 'success',
      });
      navigate('/producer/fpo/products');
    } catch (err) {
      toast({ title: 'Could not list product', description: err.message, variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add product"
        description="Aggregate member produce into one sellable listing."
      />
      <Card>
        <CardHeader>
          <CardTitle>Product details</CardTitle>
          <CardDescription>This listing represents pooled produce from your member farmers.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm submitLabel="List product" submitting={submitting} onSubmit={submit} />
        </CardContent>
      </Card>
    </div>
  );
}