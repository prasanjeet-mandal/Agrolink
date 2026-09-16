import { cn } from '@/utils/cn';
import { productImageOf } from '@/constants/productImages';

const gradientByCategory = {
  'Grains & Pulses': 'from-amber-200/70 to-yellow-100',
  Vegetables: 'from-green-200/70 to-emerald-100',
  Fruits: 'from-rose-200/70 to-orange-100',
  Spices: 'from-orange-200/70 to-amber-100',
  Oilseeds: 'from-yellow-200/70 to-lime-100',
  Dairy: 'from-sky-200/70 to-blue-100',
};

const isImageUrl = (v) => typeof v === 'string' && (v.startsWith('/') || v.startsWith('http'));

export default function ProductImage({ productId, icon, category, name, className, textClassName }) {
  const src = isImageUrl(icon) ? icon : productImageOf(productId);
  if (src) {
    return <img src={src} alt={name ?? productId} loading="lazy" className={cn('object-cover', className)} />;
  }
  const gradient = gradientByCategory[category] ?? 'from-secondary to-muted';
  return (
    <div
      className={cn(
        'flex aspect-square w-full items-center justify-center bg-gradient-to-br',
        gradient,
        className
      )}
    >
      <span className={cn('text-3xl', textClassName)} role="img" aria-label={name}>
        {icon ?? '🌱'}
      </span>
    </div>
  );
}