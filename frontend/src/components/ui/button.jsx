import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:shadow-[0_0_0_4px_hsl(var(--primary)/0.16)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97]',
    {
      variants: {
        variant: {
          default:
            'bg-primary text-primary-foreground border border-primary/40 shadow-[0_4px_16px_-6px_hsl(var(--primary)/0.5)] hover:-translate-y-0.5 hover:bg-primary/90 hover:border-primary/70 hover:shadow-[0_10px_34px_-8px_hsl(var(--primary)/0.7)]',
          destructive:
            'bg-destructive text-destructive-foreground border border-destructive/40 shadow-[0_4px_16px_-6px_hsl(var(--destructive)/0.5)] hover:-translate-y-0.5 hover:bg-destructive/90 hover:border-destructive/70 hover:shadow-[0_10px_34px_-8px_hsl(var(--destructive)/0.65)]',
          outline:
            'border border-primary/30 bg-background shadow-[0_4px_16px_-8px_hsl(var(--primary)/0.35)] hover:-translate-y-0.5 hover:border-primary/60 hover:bg-accent hover:text-accent-foreground hover:shadow-[0_10px_30px_-8px_hsl(var(--primary)/0.55)]',
          secondary:
            'bg-secondary text-secondary-foreground border border-muted-foreground/20 shadow-[0_4px_14px_-6px_hsl(var(--foreground)/0.18)] hover:-translate-y-0.5 hover:bg-secondary/80 hover:border-muted-foreground/35 hover:shadow-[0_10px_26px_-8px_hsl(var(--primary)/0.35)]',
          ghost: 'border-transparent hover:bg-muted hover:text-foreground hover:border-primary/40 hover:shadow-[0_0_18px_-6px_hsl(var(--primary)/0.5)]',
          link: 'text-primary underline-offset-4 hover:underline',
          accent:
            'bg-accent text-accent-foreground border border-accent/40 shadow-[0_4px_16px_-6px_hsl(var(--accent)/0.5)] hover:-translate-y-0.5 hover:bg-accent/90 hover:border-accent/70 hover:shadow-[0_10px_34px_-8px_hsl(var(--accent)/0.65)]',
          success:
            'bg-emerald-600 text-white border border-emerald-400/40 shadow-[0_4px_16px_-6px_hsl(160_60%_40%/0.5)] hover:-translate-y-0.5 hover:bg-emerald-700 hover:border-emerald-400/70 hover:shadow-[0_10px_34px_-8px_hsl(160_60%_40%/0.7)]',
          glass:
            'agrolink-glass text-foreground shadow-[0_4px_16px_-8px_hsl(var(--primary)/0.3)] hover:agrolink-glass-strong hover:-translate-y-0.5',
        },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };