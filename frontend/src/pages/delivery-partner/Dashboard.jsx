import * as React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, PackageCheck, PackageX, Truck } from 'lucide-react';
import { logisticsService } from '@/services/logisticsService';
import { Loading, PageHeader, StatCard, LogisticsStatusBadge, DataTable } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate } from '@/utils/formatDate';
import { formatPrice } from '@/utils/formatPrice';

const READY = ['CREATED', 'ASSIGNED'];
const ACTIVE = ['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'];

export function deliveriesCount(deliveries = []) {
  return {
    ready: deliveries.filter((d) => READY.includes(d.status)).length,
    active: deliveries.filter((d) => ACTIVE.includes(d.status)).length,
    completed: deliveries.filter((d) => d.status === 'DELIVERED').length,
  };
}

export default function DeliveryPartnerDashboard() {
  const [deliveries, setDeliveries] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const load = React.useCallback((silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    logisticsService
      .getMine()
      .then(setDeliveries)
      .catch((e) => {
        if (!silent) setError(e.message);
      })
      .finally(() => {
        if (!silent) setLoading(false);
      });
  }, []);

  React.useEffect(() => {
    load();
    const t = setInterval(() => load(true), 15000);
    return () => clearInterval(t);
  }, [load]);

  if (loading) return <Loading label="Loading assigned deliveries…" />;

  const counts = deliveriesCount(deliveries);

  const columns = [
    {
      key: 'order',
      header: 'Delivery / order',
      render: (d) => (
        <div>
          <p className="font-semibold">{d.orderNumber}</p>
          <p className="text-xs text-muted-foreground">Delivery #{d.id} · {d.buyerName || `Buyer #${d.orderId}`}</p>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Product / order summary',
      render: (d) => (
        <div className="max-w-[240px]">
          <p className="truncate text-sm">{d.items.map((i) => i.productName).join(', ') || '—'}</p>
          <p className="text-xs text-muted-foreground">{formatPrice(d.totalAmount)} · {formatDate(d.createdAt)}</p>
        </div>
      ),
    },
    {
      key: 'pickup',
      header: 'Pickup location',
      render: (d) => <span className="text-xs text-muted-foreground">{d.pickupLocation}</span>,
    },
    {
      key: 'delivery',
      header: 'Delivery location',
      render: (d) => <span className="text-xs text-muted-foreground">{d.deliveryLocation}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (d) => <LogisticsStatusBadge status={d.status} />,
    },
    {
      key: 'action',
      header: '',
      className: 'text-right',
      render: (d) => {
        const active = ACTIVE.includes(d.status);
        const to = active
          ? `/delivery-partner/deliveries/${d.id}/active`
          : `/delivery-partner/deliveries/${d.id}`;
        const label = active
          ? 'Manage'
          : d.status === 'DELIVERED' || d.status === 'CANCELLED'
            ? 'View'
            : 'Process';
        return (
          <Button asChild size="sm" variant={active ? 'default' : 'outline'} className="gap-1">
            <Link to={to}>{label}</Link>
          </Button>
        );
      },
    },
  ];

  const tabs = [
    { value: 'all', label: `All (${deliveries.length})`, rows: deliveries },
    { value: 'ready', label: `Awaiting pickup (${counts.ready})`, rows: deliveries.filter((d) => READY.includes(d.status)) },
    { value: 'active', label: `Active (${counts.active})`, rows: deliveries.filter((d) => ACTIVE.includes(d.status)) },
    { value: 'completed', label: `Completed (${counts.completed})`, rows: deliveries.filter((d) => d.status === 'DELIVERED') },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Delivery partner dashboard"
        description="Accept, pick up, and deliver your assigned orders."
      />

      {error ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Awaiting pickup" value={counts.ready} icon={ClipboardList} hint="Accept or reject" />
        <StatCard label="Active" value={counts.active} icon={Truck} hint="Pickup → transit → deliver" />
        <StatCard label="Completed" value={counts.completed} icon={PackageCheck} />
        <StatCard label="Total assigned" value={deliveries.length} icon={PackageX} />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((t) => (
          <TabsContent key={t.value} value={t.value}>
            <DataTable
              columns={columns}
              data={t.rows}
              empty={{ title: 'No deliveries here', description: 'Assigned deliveries will show up in this tab.' }}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}