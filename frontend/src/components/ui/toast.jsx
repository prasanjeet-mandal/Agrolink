import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]',
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        success: 'group border-emerald-200 bg-emerald-50 text-emerald-900',
        error: 'group border-destructive bg-destructive/10 text-destructive',
        warning: 'group border-amber-200 bg-amber-50 text-amber-900',
        info: 'group border-blue-200 bg-blue-50 text-blue-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const ICONS = {
  default: null,
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const Toast = React.forwardRef(({ className, variant = 'default', icon, children, ...props }, ref) => {
  const Icon = ICONS[variant];
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    >
      {Icon ? <Icon className="mt-0.5 h-5 w-5 shrink-0" /> : null}
      {icon}
      <div className="grid gap-1">{children}</div>
      <ToastPrimitives.Close className="absolute right-1 top-1 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-1 focus:ring-ring">
        <X className="h-4 w-4" />
      </ToastPrimitives.Close>
    </ToastPrimitives.Root>
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn('text-sm font-semibold', className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn('text-sm opacity-90', className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

// ---- Toast store (minimal, self-contained: no sonner dependency) ----
const ToastContext = React.createContext(null);

export function ToastProviderComponent({ children }) {
  const [toasts, setToasts] = React.useState([]);

  const dismiss = React.useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toaster = React.useCallback(({ title, description, variant = 'default', duration = 5000 }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, title, description, variant }]);
    if (duration !== Infinity) {
      setTimeout(() => dismiss(id), duration);
    }
    return id;
  }, [dismiss]);

  const value = React.useMemo(() => ({ toast: toaster, dismiss }), [toaster, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {ReactDOM.createPortal(
        <ToastProvider swipeDirection="right">
          {toasts.map((t) => (
            <Toast key={t.id} variant={t.variant} onOpenChange={(open) => !open && dismiss(t.id)}>
              <div className="grid gap-1">
                {t.title ? <ToastTitle>{t.title}</ToastTitle> : null}
                {t.description ? <ToastDescription>{t.description}</ToastDescription> : null}
              </div>
            </Toast>
          ))}
          <ToastViewport />
        </ToastProvider>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

export function Toaster() {
  return <ToastProviderComponent />;
}

export { Toast, ToastTitle, ToastDescription, ToastViewport };