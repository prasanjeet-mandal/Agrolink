import { Badge } from '@/components/ui/badge';
import { ORDER_STATUS_LABELS, ORDER_STATUS_VARIANTS } from '@/constants/orderStatus';
import { PAYMENT_STATUS_LABELS } from '@/constants/paymentStatus';

const PAYMENT_VARIANTS = {
  PENDING: 'warning',
  PROCESSING: 'secondary',
  COMPLETED: 'success',
  RELEASED: 'accent',
  ESCROW: 'outline',
  FAILED: 'destructive',
  REFUNDED: 'outline',
};

export function OrderStatusBadge({ status }) {
  return (
    <Badge variant={ORDER_STATUS_VARIANTS[status] ?? 'default'}>
      {ORDER_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }) {
  return (
    <Badge variant={PAYMENT_VARIANTS[status] ?? 'default'}>
      {PAYMENT_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}