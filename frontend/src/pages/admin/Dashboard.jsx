import * as React from 'react';
import {
  Loader2,
  MessageSquare,
  Package,
  ShoppingCart,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { Loading, PageHeader, StatCard, OrderStatusBadge, DataTable } from '@/components/common';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_LABELS } from '@/constants/roles';
import { ORDER_STATUS, ORDER_STATUS_LABELS } from '@/constants/orderStatus';
import { formatDate } from '@/utils/formatDate';
import { formatPrice } from '@/utils/formatPrice';
import { cn } from '@/utils/cn';

const STATUS_OPTIONS = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.PROCESSING,
  ORDER_STATUS.READY_FOR_SHIPMENT,
  ORDER_STATUS.IN_TRANSIT,
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.CANCELLED,
];

const PRODUCT_STATUSES = ['ACTIVE', 'INACTIVE', 'SOLD_OUT'];
const PRODUCT_STATUS_LABELS = { ACTIVE: 'Active', INACTIVE: 'Inactive', SOLD_OUT: 'Sold out' };
const PRODUCT_STATUS_VARIANTS = { ACTIVE: 'success', INACTIVE: 'secondary', SOLD_OUT: 'warning' };

const REVIEW_STATUSES = ['PENDING', 'APPROVED', 'HIDDEN'];
const REVIEW_STATUS_LABELS = { PENDING: 'Pending', APPROVED: 'Approved', HIDDEN: 'Hidden' };
const REVIEW_STATUS_VARIANTS = { PENDING: 'warning', APPROVED: 'success', HIDDEN: 'outline' };

function RatingStars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            'h-3.5 w-3.5',
            n <= (rating ?? 0) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
          )}
        />
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = React.useState({ users: 0, products: 0, orders: 0, reviews: 0 });
  const [orders, setOrders] = React.useState([]);
  const [users, setUsers] = React.useState([]);
  const [products, setProducts] = React.useState([]);
  const [reviews, setReviews] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [busy, setBusy] = React.useState({});

  const run = React.useCallback((key, fn) => {
    setBusy((prev) => ({ ...prev, [key]: true }));
    return fn().finally(() => setBusy((prev) => ({ ...prev, [key]: false })));
  }, []);

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      adminService.getStats(),
      adminService.listOrders(),
      adminService.listUsers(),
      adminService.listProducts(),
      adminService.listReviews(),
    ])
      .then(([s, o, u, p, r]) => {
        setStats(s ?? { users: 0, products: 0, orders: 0, reviews: 0 });
        setOrders(o);
        setUsers(u);
        setProducts(p);
        setReviews(r);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const updateOrder = (order, status) => {
    if (status === order.status) return;
    run(`o${order.id}`, () =>
      adminService.updateOrderStatus(order.id, status).then((updated) => {
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        toast({ title: 'Order updated', description: `${updated.orderNumber} → ${ORDER_STATUS_LABELS[updated.status]}`, variant: 'success' });
      })
    ).catch((e) => setError(e.message));
  };

  const toggleUser = (target) => {
    const next = !target.enabled;
    const key = `u${target.id}`;
    run(key, () =>
      adminService.setUserEnabled(target.id, next).then((updated) => {
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, enabled: updated.enabled } : u)));
        toast({
          title: next ? 'User activated' : 'User deactivated',
          description: `${target.fullName} can ${next ? 'now' : 'no longer'} sign in.`,
          variant: 'info',
        });
      })
    ).catch((e) => setError(e.message));
  };

  const updateProduct = (product, status) => {
    if (status === product.status) return;
    run(`p${product.id}`, () =>
      adminService.setProductStatus(product.id, status).then(() => {
        setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, status } : p)));
        toast({ title: 'Product updated', description: `${product.name} → ${PRODUCT_STATUS_LABELS[status]}`, variant: 'success' });
      })
    ).catch((e) => setError(e.message));
  };

  const moderate = (review, status) => {
    if (status === review.status) return;
    run(`r${review.id}`, () =>
      adminService.moderateReview(review.id, status).then((updated) => {
        setReviews((prev) => prev.map((x) => (x.id === updated.id ? { ...x, status: updated.status } : x)));
        toast({ title: 'Review moderated', description: `Review #${updated.id} → ${REVIEW_STATUS_LABELS[updated.status]}`, variant: 'success' });
      })
    ).catch((e) => setError(e.message));
  };

  if (loading) return <Loading label="Loading admin dashboard…" />;

  const revenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const orderColumns = [
    {
      key: 'order',
      header: 'Order / buyer',
      render: (o) => (
        <div>
          <p className="font-semibold">{o.orderNumber}</p>
          <p className="text-xs text-muted-foreground">{o.consumerName || `Buyer #${o.consumerId}`}</p>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Items',
      render: (o) => <p className="max-w-[240px] truncate text-sm">{o.items.map((i) => i.productName).join(', ') || '—'}</p>,
    },
    {
      key: 'placed',
      header: 'Placed on',
      render: (o) => <span className="text-xs text-muted-foreground">{formatDate(o.createdAt)}</span>,
    },
    {
      key: 'total',
      header: 'Total',
      render: (o) => <span className="font-medium">{formatPrice(o.totalAmount)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (o) => <OrderStatusBadge status={o.status} />,
    },
    {
      key: 'action',
      header: 'Update status',
      render: (o) => (
        <div className="flex items-center gap-2">
          <Select value={o.status} onValueChange={(s) => updateOrder(o, s)}>
            <SelectTrigger className="h-8 w-[9.5rem]" aria-label={`Update status for ${o.orderNumber}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>{ORDER_STATUS_LABELS[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {busy[`o${o.id}`] ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        </div>
      ),
    },
  ];

  const userColumns = [
    {
      key: 'name',
      header: 'User',
      render: (u) => (
        <div>
          <p className="font-semibold">{u.fullName}</p>
          <p className="text-xs text-muted-foreground">{u.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (u) => <Badge variant="outline">{ROLE_LABELS[u.role] ?? u.role}</Badge>,
    },
    {
      key: 'status',
      header: 'Account',
      render: (u) => <Badge variant={u.enabled ? 'success' : 'destructive'}>{u.enabled ? 'Active' : 'Disabled'}</Badge>,
    },
    {
      key: 'action',
      header: '',
      className: 'text-right',
      render: (u) => {
        const isSelf = u.id === user?.id;
        return (
          <Button
            size="sm"
            variant={u.enabled ? 'outline' : 'default'}
            disabled={isSelf || busy[`u${u.id}`]}
            onClick={() => toggleUser(u)}
            className="gap-1.5"
          >
            {busy[`u${u.id}`] ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {u.enabled ? 'Deactivate' : 'Activate'}
          </Button>
        );
      },
    },
  ];

  const productColumns = [
    {
      key: 'product',
      header: 'Product',
      render: (p) => (
        <div>
          <p className="font-semibold">{p.name}</p>
          <p className="text-xs text-muted-foreground">{p.categoryName}</p>
        </div>
      ),
    },
    {
      key: 'seller',
      header: 'Seller',
      render: (p) => <span className="text-sm">{p.sellerName}</span>,
    },
    {
      key: 'price',
      header: 'Price',
      render: (p) => <span className="font-medium">{formatPrice(p.price, { compact: true })} / {p.unit}</span>,
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (p) => <span className="text-sm">{p.availableQuantity} {p.unit}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => <Badge variant={PRODUCT_STATUS_VARIANTS[p.status]}>{PRODUCT_STATUS_LABELS[p.status] ?? p.status}</Badge>,
    },
    {
      key: 'action',
      header: 'Set status',
      render: (p) => (
        <div className="flex items-center gap-2">
          <Select value={p.status} onValueChange={(s) => updateProduct(p, s)}>
            <SelectTrigger className="h-8 w-[7.5rem]" aria-label={`Set status for ${p.name}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{PRODUCT_STATUS_LABELS[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {busy[`p${p.id}`] ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        </div>
      ),
    },
  ];

  const reviewColumns = [
    {
      key: 'product',
      header: 'Product',
      render: (r) => <p className="max-w-[200px] truncate font-medium">{r.productName}</p>,
    },
    {
      key: 'buyer',
      header: 'Reviewed by',
      render: (r) => <span className="text-sm">{r.buyerName}</span>,
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (r) => <RatingStars rating={r.rating} />,
    },
    {
      key: 'comment',
      header: 'Comment',
      render: (r) => <p className="max-w-[280px] truncate text-sm text-muted-foreground">{r.comment || '—'}</p>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <Badge variant={REVIEW_STATUS_VARIANTS[r.status]}>{REVIEW_STATUS_LABELS[r.status] ?? r.status}</Badge>,
    },
    {
      key: 'action',
      header: 'Moderate',
      render: (r) => (
        <div className="flex items-center gap-2">
          <Select value={r.status} onValueChange={(s) => moderate(r, s)}>
            <SelectTrigger className="h-8 w-[7.5rem]" aria-label={`Moderate review for ${r.productName}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REVIEW_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{REVIEW_STATUS_LABELS[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {busy[`r${r.id}`] ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin dashboard"
        description="Manage users, orders, products and reviews across the whole AgroLink platform."
      />

      {error ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
          <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
          <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard label="Registered users" value={stats.users} icon={Users} hint="Across all roles" />
            <StatCard label="Products" value={stats.products} icon={Package} hint="In the catalogue" />
            <StatCard label="Total orders" value={stats.orders ?? orders.length} icon={ShoppingCart} hint="All time" />
            <StatCard label="Reviews" value={stats.reviews ?? reviews.length} icon={MessageSquare} hint="Awaiting moderation" />
            <StatCard label="Order value" value={formatPrice(revenue)} icon={TrendingUp} hint="Sum of all orders" />
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <DataTable
            columns={orderColumns}
            data={orders}
            empty={{ title: 'No orders yet', description: 'Orders placed on the platform will appear here.' }}
          />
        </TabsContent>

        <TabsContent value="users">
          <DataTable
            columns={userColumns}
            data={users}
            empty={{ title: 'No users', description: 'Registered users will appear here.' }}
          />
        </TabsContent>

        <TabsContent value="products">
          <DataTable
            columns={productColumns}
            data={products}
            empty={{ title: 'No products', description: 'Products listed by sellers will appear here.' }}
          />
        </TabsContent>

        <TabsContent value="reviews">
          <DataTable
            columns={reviewColumns}
            data={reviews}
            empty={{ title: 'No reviews yet', description: 'Reviews left by buyers will appear here.' }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}