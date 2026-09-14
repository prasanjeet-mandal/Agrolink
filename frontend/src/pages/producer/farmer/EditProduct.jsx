import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService } from '@/services/productService';
import { useToast } from '@/components/ui/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader, Loading } from '@/components/common';
import ProductForm from '@/components/forms/ProductForm';

export default function EditProduct() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [product, setProduct] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    productService.getById(productId).then(setProduct).finally(() => setLoading(false));
  }, [productId]);

  if (loading) return <Loading label="Loading product…" />;
  if (!product) return <PageHeader title="Product not found" />;

  const initial = {
    name: product.name,
    variety: product.variety,
    category: product.category,
    unit: product.unit,
    pricePerUnit: product.pricePerUnit,
    stockQuantity: product.stockQuantity,
    minOrderQuantity: product.minOrderQuantity,
    quality: product.quality,
    icon: product.icon,
    description: product.description,
    certification: product.certification?.join(', ') ?? '',
  };

  const submit = async (values) => {
    setSubmitting(true);
    try {
      await productService.update(productId, {
        ...values,
        location: product.location,
        producerId: product.producerId,
        isFpo: product.isFpo,
        certification: values.certification ? values.certification.split(',').map((c) => c.trim()).filter(Boolean) : [],
        pricePerUnit: Number(values.pricePerUnit),
        stockQuantity: Number(values.stockQuantity),
        minOrderQuantity: Number(values.minOrderQuantity),
      });
      toast({ title: 'Product updated', description: 'Your listing was saved.', variant: 'success' });
      navigate('/producer/farmer/products');
    } catch (err) {
      toast({ title: 'Could not update', description: err.message, variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Edit product" description={`Updating listing for ${product.name}`} />
      <Card>
        <CardHeader>
          <CardTitle>Product details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm initial={initial} submitLabel="Save changes" submitting={submitting} onSubmit={submit} />
        </CardContent>
      </Card>
    </div>
  );
}