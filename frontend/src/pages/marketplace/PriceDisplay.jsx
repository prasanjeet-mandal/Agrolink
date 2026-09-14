import { cn } from '@/utils/cn';
import { formatPrice, formatPricePerUnit } from '@/utils/formatPrice';

export default function PriceDisplay({ price, unit, perUnit = false, className, size = 'md' }) {
  const sizeClass = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-lg';
  return (
    <div className={cn('leading-tight', className)}>
      <p className={cn('font-bold tracking-tight text-primary', sizeClass)}>
        {perUnit ? formatPricePerUnit(price, unit) : formatPrice(price)}
      </p>
      {perUnit && price != null ? (
        <p className="text-xs text-muted-foreground">{formatPrice(price)} / {unit}</p>
      ) : null}
    </div>
  );
}