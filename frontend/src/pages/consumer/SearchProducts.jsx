import { Link } from 'react-router-dom';
import { BadgePercent, Store } from 'lucide-react';
import { PageHeader } from '@/components/common';
import { Button } from '@/components/ui/button';
import Marketplace from '@/pages/marketplace/Marketplace';

export default function SearchProducts() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-accent p-5 text-primary-foreground">
        <div className="space-y-1">
          <p className="flex items-center gap-2 text-lg font-bold">
            <BadgePercent className="h-5 w-5" /> Direct-from-farm prices
          </p>
          <p className="text-sm text-primary-foreground/85">
            No APMC commission, no middlemen. Compare grades and negotiate bulk quotes.
          </p>
        </div>
        <Button asChild variant="secondary" className="gap-2">
          <Link to="/marketplace">
            <Store className="h-4 w-4" /> Open full marketplace
          </Link>
        </Button>
      </div>

      <PageHeader
        title="Find produce"
        description="Search across categories, filter by seller and price, and request bulk quotes."
      />

      <Marketplace />
    </div>
  );
}