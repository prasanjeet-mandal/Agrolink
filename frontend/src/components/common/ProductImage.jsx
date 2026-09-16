import { useEffect, useState } from 'react';
import { cn } from '@/utils/cn';
import { productImageOf } from '@/constants/productImages';
import { commodityImageOf } from '@/constants/commodityImages';
import { resolveProductImage } from '@/services/productImageService';

const gradientByCategory = {
  'Grains & Pulses': 'from-amber-200/70 to-yellow-100',
  Vegetables: 'from-green-200/70 to-emerald-100',
  Fruits: 'from-rose-200/70 to-orange-100',
  Spices: 'from-orange-200/70 to-amber-100',
  Oilseeds: 'from-yellow-200/70 to-lime-100',
  Dairy: 'from-sky-200/70 to-blue-100',
};

const isImageUrl = (v) => typeof v === 'string' && (v.startsWith('/') || v.startsWith('http'));

export default function ProductImage({ productId, icon, category, name, variety, className }) {
  const localSrc = isImageUrl(icon) ? icon : productImageOf(productId);
  const commoditySrc = commodityImageOf(name ?? productId);
  const [fetchedUrl, setFetchedUrl] = useState('');
  const [failed, setFailed] = useState(false);

  const shouldAutoFetch = !localSrc && !commoditySrc && !failed;

  useEffect(() => {
    if (!shouldAutoFetch) return;

    let cancelled = false;
    resolveProductImage({ productId, name, category, variety })
      .then((url) => {
        if (!cancelled && url) setFetchedUrl(url);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [shouldAutoFetch, productId, name, category, variety]);

  const src = localSrc ?? commoditySrc ?? fetchedUrl;

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? productId ?? 'Product'}
        loading="lazy"
        onError={localSrc ? undefined : () => setFailed(true)}
        className={cn('object-cover', className)}
      />
    );
  }

  const gradient = gradientByCategory[category] ?? 'from-secondary to-muted';
  return (
    <div
      className={cn(
        'flex aspect-square w-full items-center justify-center bg-gradient-to-br',
        gradient,
        className
      )}
    />
  );
}