import { Link } from 'react-router-dom';
import { BadgeCheck, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProductImage } from '@/components/common';
import PriceDisplay from './PriceDisplay';
import { cn } from '@/utils/cn';

export default function ProductCard({ product, className, to }) {
  const linkTo = to ?? `/marketplace/${product.id}`;
  const outOfStock = Number(product.stockQuantity ?? 0) <= 0;
  return (
    <Link to={linkTo} className="group block">
      <Card className={cn('overflow-hidden transition-all group-hover:shadow-md', className)}>
        <div className={cn('relative', outOfStock && 'opacity-70')}>
          <ProductImage productId={product.id} icon={product.icon} category={product.category} name={product.name} className="aspect-[4/5]" />
          <div className="absolute left-2 top-2 flex gap-1.5">
            <Badge variant="secondary">{product.category}</Badge>
            {product.isFpo ? <Badge variant="accent">FPO</Badge> : null}
          </div>
          {outOfStock ? (
            <div className="absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-center">
              <Badge variant="destructive" className="px-3 py-1 text-xs">Out of stock</Badge>
            </div>
          ) : null}
          {product.quality ? (
            <Badge variant="success" className="absolute bottom-2 right-2">
              {product.quality}
            </Badge>
          ) : null}
        </div>

        <div className="space-y-1.5 p-3">
          <div>
            <p className="text-sm font-bold leading-snug line-clamp-1">{product.name}</p>
            <p className="text-xs text-muted-foreground">{product.variety}</p>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate">
              {product.producerName}
              {product.location?.district ? ` · ${product.location.district}` : ''}
            </span>
            {product.producerRating ? (
              <span className="ml-auto flex shrink-0 items-center gap-0.5 font-medium text-foreground">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {product.producerRating.toFixed(1)}
              </span>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-2 border-t pt-2.5">
            <PriceDisplay price={product.pricePerUnit} perUnit size="md" unit={product.unit} />
            <Badge variant="outline" className="text-xs">
              {product.unit}
            </Badge>
          </div>
        </div>
      </Card>
    </Link>
  );
}