import * as React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/utils/cn';

function useCountUp(end, duration = 750) {
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    if (typeof end !== 'number' || Number.isNaN(end)) {
      setVal(end);
      return undefined;
    }
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setVal(end);
      return undefined;
    }
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(end * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);
  return val;
}

export default function StatCard({ label, value, icon: Icon, delta, deltaLabel, hint, className }) {
  const positive = delta != null && delta >= 0;
  const isNumber = typeof value === 'number' && !Number.isNaN(value);
  const animated = useCountUp(isNumber ? value : 0);

  return (
    <Card className={cn('group relative overflow-hidden p-5 agrolink-lift', className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-primary/25 to-accent/20 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tracking-tight">
            {isNumber ? Math.round(animated).toLocaleString('en-IN') : value}
          </p>
          {delta != null ? (
            <p
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-semibold',
                positive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
              )}
            >
              {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {Math.abs(delta)}% {deltaLabel ?? (positive ? 'up' : 'down')}
            </p>
          ) : hint ? (
            <p className="text-xs text-muted-foreground">{hint}</p>
          ) : null}
        </div>
        {Icon ? (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-[0_8px_20px_-6px_hsl(var(--primary)/0.55)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </div>
    </Card>
  );
}