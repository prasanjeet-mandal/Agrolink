import { RotateCcw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
];

export default function SearchFilters({ categories, filters, onChange, onReset, resultCount }) {
  const set = (field) => (value) => onChange(field, value);

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={onReset} className="gap-1 text-muted-foreground">
          <RotateCcw className="h-3.5 w-3.5" /> Clear all
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Category</label>
          <Select value={filters.category || 'all'} onValueChange={(v) => set('category')(v === 'all' ? '' : v)}>
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Seller type</label>
          <Select value={filters.source || 'all'} onValueChange={(v) => set('source')(v === 'all' ? '' : v)}>
            <SelectTrigger>
              <SelectValue placeholder="All sellers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sellers</SelectItem>
              <SelectItem value="FARMER">Individual farmers</SelectItem>
              <SelectItem value="FPO">FPOs / Co-ops</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Price (₹ / unit)</label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              placeholder="Min"
              value={filters.minPrice ?? ''}
              onChange={(e) => set('minPrice')(e.target.value)}
            />
            <span className="text-muted-foreground">–</span>
            <Input
              type="number"
              min={0}
              placeholder="Max"
              value={filters.maxPrice ?? ''}
              onChange={(e) => set('maxPrice')(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Sort by</label>
          <Select value={filters.sort || 'newest'} onValueChange={set('sort')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {resultCount != null ? `${resultCount} product${resultCount === 1 ? '' : 's'} found` : 'Type to search produce'}
      </p>
    </div>
  );
}