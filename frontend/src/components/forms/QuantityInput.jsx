import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

export default function QuantityInput({ value, onChange, min = 1, max = 99999, step = 1, className, size = 'sm' }) {
  const set = (next) => {
    if (Number.isNaN(next)) return;
    onChange(Math.min(max, Math.max(min, next)));
  };

  const btnClass =
    size === 'lg' ? 'h-10 w-10' : 'h-8 w-8';

  return (
    <div className={cn('inline-flex items-center rounded-md border', className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={btnClass}
        onClick={() => set(value - step)}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <input
        aria-label="Quantity"
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => set(Number(e.target.value))}
        className={cn(
          'w-16 border-0 text-center text-sm font-semibold [appearance:textfield] focus:outline-none',
          size === 'lg' && 'text-base'
        )}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={btnClass}
        onClick={() => set(value + step)}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}