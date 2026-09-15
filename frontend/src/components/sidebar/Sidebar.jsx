import { NavLink } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { NAVIGATION } from '@/constants/navigation';
import { ROLES } from '@/constants/roles';

export default function Sidebar({ role, open, onClose }) {
  const groups = NAVIGATION[role] ?? [];

  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-y-auto border-r bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 transition-transform duration-200 lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <nav className="flex-1 space-y-6 p-4">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.title}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          'group flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200 [&_svg]:transition-transform [&_svg]:duration-200',
                          isActive
                            ? 'bg-gradient-to-r from-primary to-emerald-600 text-white shadow-[0_6px_18px_-6px_hsl(var(--primary)/0.6)]'
                            : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0 group-hover:scale-110" />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

export function roleForPath(pathname, user) {
  if (pathname.startsWith('/producer/fpo')) return ROLES.FPO;
  if (pathname.startsWith('/producer/farmer')) return ROLES.FARMER;
  if (pathname.startsWith('/delivery-partner')) return ROLES.DELIVERY_PARTNER;
  if (pathname.startsWith('/admin')) return ROLES.ADMIN;
  return user?.role ?? ROLES.CONSUMER;
}