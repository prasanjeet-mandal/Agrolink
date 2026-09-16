import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Menu, Search, ShoppingCart, LogOut, UserCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCartContext } from '@/context/CartContext';
import { useToast } from '@/components/ui/toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ThemeToggle from '@/components/common/ThemeToggle';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/utils/cn';
import { ROLES, ROLE_LABELS } from '@/constants/roles';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const isFocusedRole = user?.role === ROLES.DELIVERY_PARTNER || user?.role === ROLES.ADMIN;
  const { itemCount } = useCartContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (location.pathname !== '/marketplace') setQuery('');
  }, [location.pathname]);

  const onSearch = (e) => {
    e.preventDefault();
    navigate(query.trim() ? `/marketplace?q=${encodeURIComponent(query.trim())}` : '/marketplace');
  };

  const handleLogout = () => {
    logout();
    toast({ title: 'Logged out', description: 'See you next harvest.', variant: 'info' });
    navigate('/login');
  };

  const initials = (user?.name ?? user?.fullName ?? 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b bg-background/75 px-4 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-background/55 sm:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick} aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </Button>

<Link to="/home" onClick={() => window.scrollTo(0, 0)} className="flex items-center gap-2">
        <img src="/assets/images/logo.png" alt="Agrolink" className="h-11 w-auto" />
      </Link>

      {!isFocusedRole ? (
        <form onSubmit={onSearch} className="relative ml-auto hidden w-full max-w-sm md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search produce, e.g. basmati, turmeric…"
            className="pl-9"
          />
        </form>
      ) : null}

      <div className={cn('ml-auto flex items-center gap-1.5', isFocusedRole ? '' : 'md:ml-2')}>
        <ThemeToggle />

        {!isFocusedRole ? (
          <Link to="/consumer/cart" className="relative" aria-label="Cart">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            {itemCount > 0 ? (
              <Badge variant="destructive" className="absolute -right-0.5 -top-0.5 h-5 min-w-5 justify-center px-1">
                {itemCount}
              </Badge>
            ) : null}
          </Link>
        ) : null}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="px-2 py-1 text-sm text-muted-foreground">No new notifications</div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-1.5">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/15 text-primary">{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden max-w-28 truncate text-sm font-medium lg:block">
                {user?.name ?? 'Guest'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {user?.name}
              <span className="block text-xs font-normal text-muted-foreground">
                {user ? ROLE_LABELS[user.role] : 'Not signed in'}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user ? (
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <UserCircle2 /> My profile
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}