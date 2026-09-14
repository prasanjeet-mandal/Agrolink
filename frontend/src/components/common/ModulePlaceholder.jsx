import { Construction } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ModulePlaceholder({ title, module }) {
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-primary">
          <Construction className="h-8 w-8" />
        </span>
        <div className="space-y-1">
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-sm text-muted-foreground">
            This page is wired into the routes and will be built in its module.
          </p>
        </div>
        <Badge variant="secondary">{module}</Badge>
      </CardContent>
    </Card>
  );
}