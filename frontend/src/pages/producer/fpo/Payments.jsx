import * as React from 'react';
import { Link } from 'react-router-dom';
import { Banknote, Wallet, Clock, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { producerService } from '@/services/producerService';
import { paymentService } from '@/services/paymentService';
import { PageHeader, Loading, StatCard, PaymentStatusBadge, DataTable } from '@/components/common';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/utils/formatPrice';
import { formatDate } from '@/utils/formatDate';

export default function Payments() {
  const { user } = useAuth();
  const [producer, setProducer] = React.useState(null);
  const [payments, setPayments] = React.useState(null);
  const [stats, setStats] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    producerService.getProfile(user.id).then((p) => {
      if (!mounted) return;
      setProducer(p);
      Promise.all([
        paymentService.getMine({ role: user.role, userId: user.id, producerId: p.id }),
        producerService.getStats(p.id),
      ]).then(([pay, s]) => {
        if (!mounted) return;
        setPayments(pay);
        setStats(s);
      });
    });
    return () => { mounted = false; };
  }, [user.id, user.role]);

  if (!producer || !payments || !stats) return <Loading label="Fetching payments…" />;

  const pendingTotal = payments
    .filter((p) => ['PENDING', 'PROCESSING'].includes(p.status))
    .reduce((s, p) => s + p.amount, 0);

  const columns = [
    {
      key: 'paymentId', header: 'Payment ID',
      render: (p) => <span className="font-medium">{p.paymentId}</span>,
    },
    {
      key: 'orderNumber', header: 'Order',
      render: (p) => <Link to="/orders" className="text-xs text-muted-foreground hover:text-foreground">{p.orderNumber}</Link>,
    },
    {
      key: 'createdAt', header: 'Date',
      render: (p) => <span className="text-xs text-muted-foreground">{formatDate(p.createdAt)}</span>,
    },
    {
      key: 'amount', header: 'Amount', className: 'text-right',
      render: (p) => <span className="font-semibold">{formatPrice(p.amount)}</span>,
    },
    {
      key: 'method', header: 'Method',
      render: (p) => <span className="text-xs">{p.method.replaceAll('_', ' ')}</span>,
    },
    {
      key: 'status', header: 'Status',
      render: (p) => <PaymentStatusBadge status={p.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Settlement overview for your organization."
        actions={<Button asChild variant="outline" className="gap-2"><Link to="/payment/history"><Wallet className="h-4 w-4" /> Full history</Link></Button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Cleared earnings" value={formatPrice(stats.totalRevenue ?? 0, { compact: true })} icon={Banknote} hint="released to organization bank" />
        <StatCard label="Awaiting settlement" value={formatPrice(pendingTotal, { compact: true })} icon={Clock} hint="held in escrow / processing" />
        <StatCard label="Payout pools" value={producer.memberFarmers} icon={Users} hint="member farmers on your schedule" />
      </div>

      <DataTable
        columns={columns}
        data={payments}
        empty={{ title: 'No payments yet', description: 'Completed orders automatically generate a settlement.' }}
      />
    </div>
  );
}