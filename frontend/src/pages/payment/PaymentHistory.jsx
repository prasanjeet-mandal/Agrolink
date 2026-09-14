import * as React from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, Banknote, Wallet } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { paymentService } from '@/services/paymentService';
import { PageHeader, Loading, StatCard, PaymentStatusBadge, DataTable } from '@/components/common';
import { Button } from '@/components/ui/button';
import { ROLES } from '@/constants/roles';
import { formatPrice } from '@/utils/formatPrice';
import { formatDate } from '@/utils/formatDate';

export default function PaymentHistory() {
  const { user } = useAuth();
  const [payments, setPayments] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    paymentService.getMine({ role: user.role, userId: user.id })
      .then((data) => mounted && setPayments(data))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [user.id, user.role]);

  if (loading) return <Loading label="Loading payment history…" />;

  const isConsumer = user.role === ROLES.CONSUMER;
  const settled = (payments ?? []).filter((p) => ['COMPLETED', 'RELEASED'].includes(p.status))
    .reduce((s, p) => s + p.amount, 0);

  const columns = [
    {
      key: 'paymentId', header: 'Payment',
      render: (p) => (
        <div className="flex items-center gap-2">
          {isConsumer
            ? <ArrowDownLeft className="h-4 w-4 shrink-0 text-destructive" />
            : <ArrowUpRight className="h-4 w-4 shrink-0 text-emerald-600" />}
          <div>
            <p className="font-semibold">{p.paymentId}</p>
            <p className="text-xs text-muted-foreground">{p.orderNumber}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'createdAt', header: 'Date',
      render: (p) => <span className="text-xs text-muted-foreground">{formatDate(p.createdAt ?? new Date().toISOString())}</span>,
    },
    {
      key: 'amount', header: isConsumer ? 'Amount paid' : 'Amount received', className: 'text-right',
      render: (p) => <span className="font-semibold">{formatPrice(p.amount)}</span>,
    },
    {
      key: 'method', header: 'Method',
      render: (p) => <span className="text-xs">{p.method?.replaceAll('_', ' ') ?? '—'}</span>,
    },
    {
      key: 'status', header: 'Status',
      render: (p) => <PaymentStatusBadge status={p.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment history"
        description={isConsumer ? 'All money you have paid on Agrolink.' : 'All settlements received on Agrolink.'}
        actions={<Button asChild variant="outline" className="gap-2"><Link to="/marketplace"><Banknote className="h-4 w-4" /> Shop more</Link></Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label={isConsumer ? 'Total paid' : 'Total received'}
          value={formatPrice(settled, { compact: true })}
          icon={Wallet}
          hint="all time"
        />
        <StatCard
          label="Transactions"
          value={payments?.length ?? 0}
          icon={Banknote}
        />
      </div>

      <DataTable
        columns={columns}
        data={payments ?? []}
        empty={{ title: 'No payments yet', description: 'Your payment records will appear here.' }}
      />
    </div>
  );
}