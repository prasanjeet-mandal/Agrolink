import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '@/components/navbar/Navbar';
import Sidebar, { roleForPath } from '@/components/sidebar/Sidebar';
import { useAuth } from '@/hooks/useAuth';

export default function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const role = roleForPath(location.pathname, user);

  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onMenuClick={() => setMenuOpen(true)} />
        <main className="agrolink-page-in mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}