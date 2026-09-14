import { Label } from '@/components/ui/label';
import { cn } from '@/utils/cn';

export default function FormField({ label, required, error, hint, htmlFor, className, children }) {
  return (
    <div className={cn('grid gap-1.5', className)}>
      {label ? (
        <Label htmlFor={htmlFor}>
          {label}
          {required ? <span className="ml-0.5 text-destructive">*</span> : null}
        </Label>
      ) : null}
      {children}
      {hint && !error ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
    </div>
  );
}