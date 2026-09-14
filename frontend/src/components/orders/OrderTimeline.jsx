import { Check, Circle } from 'lucide-react';
import { ORDER_STATUS, ORDER_STATUS_LABELS, ORDER_STATUS_STEPS } from '@/constants/orderStatus';
import { cn } from '@/utils/cn';
import { formatDateTime } from '@/utils/formatDate';

export default function OrderTimeline({ order, className }) {
  const timelineByStatus = Object.fromEntries((order.timeline ?? []).map((t) => [t.status, t.at]));
  const activeIndex = ORDER_STATUS_STEPS.indexOf(order.status);
  const current = order.status;

  return (
    <ol className={cn('space-y-0', className)}>
      {ORDER_STATUS_STEPS.map((step, index) => {
        const reached = index <= activeIndex || current === ORDER_STATUS.DELIVERED;
        const passed = index < activeIndex;
        const isCurrent = index === activeIndex;
        const at = timelineByStatus[step];
        return (
          <li key={step} className="relative flex gap-3 pb-5 last:pb-0">
            {index < ORDER_STATUS_STEPS.length - 1 ? (
              <span
                className={cn(
                  'absolute left-[7px] top-5 h-full w-px',
                  index < activeIndex ? 'bg-primary' : 'bg-border'
                )}
                aria-hidden="true"
              />
            ) : null}
            <span
              className={cn(
                'relative z-10 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2',
                reached ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/40 bg-background text-muted-foreground'
              )}
            >
              {passed ? <Check className="h-2.5 w-2.5" /> : isCurrent ? <Circle className="h-2 w-2 fill-current" /> : null}
            </span>
            <div className={cn('min-w-0 pt-0.5', !reached && 'opacity-50')}>
              <p className={cn('text-sm font-medium', isCurrent && 'text-primary')}>
                {ORDER_STATUS_LABELS[step]}
              </p>
              {at ? <p className="text-xs text-muted-foreground">{formatDateTime(at)}</p> : null}
              {isCurrent ? <p className="text-xs text-primary">Current status</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}