import * as React from 'react';
import { Link } from 'react-router-dom';
import { PackagePlus, Pencil, ShoppingCart, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { producerService } from '@/services/producerService';
import { productService } from '@/services/productService';
import { useToast } from '@/components/ui/toast';
import { PageHeader, Loading, ProductImage, DataTable } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/modals';
import { formatPrice } from '@/utils/formatPrice';

export default function ManageProducts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [toDelete, setToDelete] = React.useState(null);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    producerService.getProfile(user.id).then((p) => {
      if (!mounted) return;
      setLoading(true);
      productService.getMine(p.id).then((data) => {
        if (mounted) { setProducts(data); setLoading(false); }
      });
    });
    return () => { mounted = false; };
  }, [user.id]);

  const confirmDelete = async () => {
    setDeleting(true);
    await productService.remove(toDelete.id);
    setProducts((prev) => prev.filter((p) => p.id !== toDelete.id));
    setDeleting(false);
    setToDelete(null);
    toast({ title: 'Product removed', description: `${toDelete.name} was delisted.`, variant: 'info' });
  };

  const columns = [
    {
      key: 'name', header: 'Product',
      render: (p) => (
        <div className="flex items-center gap-3">
          <ProductImage productId={p.id} icon={p.icon} category={p.category} name={p.name} className="h-10 w-10 rounded-md" textClassName="text-xl" />
          <div>
            <p className="font-semibold">{p.name}</p>
            <p className="text-xs text-muted-foreground">{p.variety} · {p.category}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'pricePerUnit', header: 'Price', className: 'text-right',
      render: (p) => <span className="font-medium">{formatPrice(p.pricePerUnit)}/{p.unit}</span>,
    },
    {
      key: 'stockQuantity', header: 'Stock', className: 'text-right',
      render: (p) => <span>{p.stockQuantity.toLocaleString('en-IN')} {p.unit}</span>,
    },
    {
      key: 'status', header: 'Status',
      render: (p) => <Badge variant={p.status === 'ACTIVE' ? 'success' : 'warning'}>{p.status === 'ACTIVE' ? 'Live' : p.status}</Badge>,
    },
    {
      key: 'actions', header: 'Actions',
      render: (p) => (
        <div className="flex gap-1">
          <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
            <Link to={`/marketplace/${p.id}`}><ShoppingCart className="h-3.5 w-3.5" /> View</Link>
          </Button>
          <Button asChild variant="ghost" size="icon" aria-label="Edit">
            <Link to={`/producer/fpo/products/${p.id}/edit`}><Pencil className="h-4 w-4" /></Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => setToDelete(p)} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage products"
        description="Listings pooled from member farmers."
        actions={<Button asChild className="gap-2"><Link to="/producer/fpo/products/add"><PackagePlus className="h-4 w-4" /> Add product</Link></Button>}
      />
      {loading ? (
        <Loading label="Loading products…" />
      ) : (
        <DataTable columns={columns} data={products} empty={{ title: 'No products yet', description: 'Add your first pooled listing.' }} />
      )}
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Delete this product?"
        description={toDelete ? `${toDelete.name} will be removed from the marketplace.` : ''}
        confirmLabel="Delete" destructive
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}