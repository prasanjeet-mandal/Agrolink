import { useEffect, useState } from 'react';
import { productImageOf } from '@/constants/productImages';
import { commodityImageOf } from '@/constants/commodityImages';
import { isEdibleProduct } from '@/constants/edibleCategories';
import { resolveProductImage } from '@/services/productImageService';

const isImageUrl = (v) => typeof v === 'string' && (v.startsWith('/') || v.startsWith('http'));

export function useProductImage(product) {
  const { name, category, variety } = product ?? {};
  const edible = isEdibleProduct(product);
  const localSrc = edible
    ? isImageUrl(product?.icon)
      ? product.icon
      : productImageOf(product?.id) ?? commodityImageOf(name)
    : null;
  const [fetchedUrl, setFetchedUrl] = useState('');

  useEffect(() => {
    if (!edible || localSrc) return;
    let cancelled = false;
    resolveProductImage({ name, category, variety })
      .then((url) => {
        if (!cancelled && url) setFetchedUrl(url);
      })
      .catch(() => {
        /* keep gradient placeholder */
      });
    return () => {
      cancelled = true;
    };
  }, [edible, localSrc, name, category, variety]);

  if (!edible) return null;
  return localSrc ?? fetchedUrl;
}