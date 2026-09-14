import { Outlet } from 'react-router-dom';
import { BadgeCheck, Handshake, LineChart, Sprout, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';

const PERKS = [
  { icon: BadgeCheck, text: 'Verified farmers & FPOs' },
  { icon: LineChart, text: 'Live mandi price trends' },
  { icon: Truck, text: 'Farm-to-market logistics' },
  { icon: Handshake, text: 'Direct, fair pricing' },
];

export default function AuthLayout() {
  return (
    <div className="agrolink-page-in flex min-h-screen bg-background text-foreground">
      <aside className="relative hidden w-[46%] overflow-hidden lg:block">
        <img
          src="/assets/images/hero-farm-real-4.jpg"
          alt="Green paddy field"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/85 via-emerald-900/60 to-[#07301f]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:20px_20px]" />
        <div
          aria-hidden
          className="agrolink-float pointer-events-none absolute -left-16 top-1/4 h-64 w-64 rounded-full bg-emerald-400/25 blur-3xl"
        />
        <div
          aria-hidden
          className="agrolink-float-slow pointer-events-none absolute -right-10 bottom-16 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl"
        />

        <div className="relative flex h-full flex-col p-10 text-white">
          <div>
            <img src="/assets/images/logo.png" alt="Agrolink" className="h-11 w-auto" />
          </div>

          <div className="mt-auto space-y-7">
            <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">
              Fresh produce,<br />
              straight from the farm.
            </h2>
            <p className="max-w-md text-base text-white/75">
              One platform for farmers, FPOs and buyers — pricing, logistics, payments and market
              intelligence in a single place.
            </p>
            <ul className="grid gap-3">
              {PERKS.map((p) => (
                <li key={p.text} className="flex items-center gap-2.5 text-sm text-white/90">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur">
                    <p.icon className="h-4 w-4 text-emerald-300" />
                  </span>
                  {p.text}
                </li>
              ))}
            </ul>
            <div className="flex gap-8 border-t border-white/15 pt-5 text-sm">
              <div>
                <p className="text-2xl font-extrabold">12k+</p>
                <p className="text-white/60">Farmers onboard</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold">40+</p>
                <p className="text-white/60">Mandi markets</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold">24–48h</p>
                <p className="text-white/60">Delivery window</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <section className="relative flex flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-secondary via-background to-background p-6">
        <div
          aria-hidden
          className="agrolink-float pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl"
        />
        <div
          aria-hidden
          className="agrolink-float-slow pointer-events-none absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-accent/15 blur-3xl"
        />

        <div className="relative w-full max-w-md">
          <div className="mb-6 flex items-center justify-between">
            <Link to="/home" onClick={() => window.scrollTo(0, 0)} className="flex items-center lg:hidden">
              <img src="/assets/images/logo.png" alt="Agrolink" className="h-10 w-auto" />
            </Link>
            <LanguageSwitcher className="ml-auto w-36" />
          </div>
          <Outlet />
          <div className="mt-6 text-center">
            <Button asChild variant="glass" size="sm">
              <Link to="/" className="gap-1 text-muted-foreground">
                <Sprout className="h-4 w-4" /> Back to home
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}