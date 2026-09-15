import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BarChart3, BadgeCheck, Bot, Bug, Building2, CheckCircle2, ChevronLeft, ChevronRight,
  CloudSun, CreditCard, Droplets, Eye, Globe, Landmark, Languages, LineChart, MapPin, Menu, Newspaper,
  Package, Quote, Route, Scale, Ship, ShoppingCart, Sprout, Stethoscope, Store, Sunrise, TrendingUp,
  Tractor, Truck, Users, Wallet, Warehouse, X, ClipboardList, Smartphone, Star,
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { LANGUAGES } from '@/i18n/dict';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import ThemeToggle from '@/components/common/ThemeToggle';
import { productService } from '@/services/productService';
import { productImageOf } from '@/constants/productImages';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/utils/formatPrice';

const NAV_LINKS = [
  { labelKey: 'nav.mandi', href: '#prices' },
  { labelKey: 'news.title', href: '#news' },
  { labelKey: 'nav.leads', href: '#leads' },
  { labelKey: 'nav.how', href: '#how-it-works' },
  { labelKey: 'nav.faq', href: '#faq' },
];

const LEAD_SECTIONS = ['Oilseeds', 'Vegetables', 'Grains & Pulses', 'Spices', 'Fruits', 'Dairy'];

const STATS = [
  { to: 500, prefix: '', suffix: '+', labelKey: 'stats.farmers' },
  { to: 40, prefix: '', suffix: '+', labelKey: 'stats.fpos' },
  { to: 25, prefix: '', suffix: '+', labelKey: 'stats.crops' },
  { to: 2.4, prefix: '₹', suffix: ' Cr', decimals: 1, labelKey: 'stats.escrow' },
];

const GALLERY = [
  { src: '/assets/images/hero-farm.jpg', labelKey: 'gal.1' },
  { src: '/assets/images/paddy.jpg', labelKey: 'gal.2' },
  { src: '/assets/images/wheat-field.jpg', labelKey: 'gal.3' },
  { src: '/assets/images/veg-table.jpg', labelKey: 'gal.4' },
  { src: '/assets/images/market-veg.jpg', labelKey: 'gal.5' },
  { src: '/assets/images/delivery-truck.jpg', labelKey: 'gal.6' },
  { src: '/assets/images/grain-sacks.jpg', labelKey: 'gal.7' },
  { src: '/assets/images/farmer-smile.jpg', labelKey: 'gal.8' },
  { src: '/assets/images/cover-farmer-field-1.jpg', labelKey: 'gal.9' },
];

const TESTIMONIALS = [
  {
    name: 'Meera Sharma', roleKey: 'testi.r1',
    avatar: '/assets/images/woman-customer.jpg',
    textKey: 'testi.t1',
  },
  {
    name: 'Harpreet Singh', roleKey: 'testi.r2',
    avatar: '/assets/images/man-farmer.jpg',
    textKey: 'testi.t2',
  },
  {
    name: 'Rakesh Verma', roleKey: 'testi.r3',
    avatar: '/assets/images/man-buyer.jpg',
    textKey: 'testi.t3',
  },
];

const WHO_USES = [
  { icon: Sprout, titleKey: 'who.farmer.t', descKey: 'who.farmer.d' },
  { icon: Users, titleKey: 'who.buyer.t', descKey: 'who.buyer.d' },
  { icon: Building2, titleKey: 'who.process.t', descKey: 'who.process.d' },
  { icon: Ship, titleKey: 'who.logi.t', descKey: 'who.logi.d' },
  { icon: LineChart, titleKey: 'who.trader.t', descKey: 'who.trader.d' },
  { icon: Smartphone, titleKey: 'who.coop.t', descKey: 'who.coop.d' },
];

const STEPS = [
  { icon: ClipboardList, titleKey: 'steps.s1.t', descKey: 'steps.s1.d' },
  { icon: Users, titleKey: 'steps.s2.t', descKey: 'steps.s2.d' },
  { icon: Truck, titleKey: 'steps.s3.t', descKey: 'steps.s3.d' },
];

const CATEGORIES = [
  { name: 'Fruits', crops: ['Mango', 'Banana', 'Grapes', 'Apple', 'Guava'] },
  { name: 'Vegetables', crops: ['Tomato', 'Potato', 'Onion', 'Brinjal', 'Chilli'] },
  { name: 'Grains & Pulses', crops: ['Basmati', 'Wheat', 'Ragi', 'Chana', 'Toor'] },
  { name: 'Oilseeds', crops: ['Mustard', 'Groundnut', 'Soyabean', 'Sunflower'] },
  { name: 'Spices', crops: ['Turmeric', 'Coriander', 'Chilli', 'Jeera'] },
  { name: 'Dairy', crops: ['Milk (Bulk)', 'Paneer', 'Ghee', 'Curd'] },
];

const VALUE_CHAIN = [
  { icon: Tractor, titleKey: 'vc.farmer.t', descKey: 'vc.farmer.d', href: '/register' },
  { icon: Users, titleKey: 'vc.fpo.t', descKey: 'vc.fpo.d', href: '/register' },
  { icon: Store, titleKey: 'vc.input.t', descKey: 'vc.input.d', href: '/marketplace' },
  { icon: LineChart, titleKey: 'vc.trader.t', descKey: 'vc.trader.d', href: '/pricing' },
  { icon: Warehouse, titleKey: 'vc.wholesale.t', descKey: 'vc.wholesale.d', href: '/marketplace' },
  { icon: ShoppingCart, titleKey: 'vc.retail.t', descKey: 'vc.retail.d', href: '/marketplace' },
];

const FARM_TO_FORK = [
  { icon: BarChart3, titleKey: 'f2f.demand.t', descKey: 'f2f.demand.d' },
  { icon: ClipboardList, titleKey: 'f2f.harvest.t', descKey: 'f2f.harvest.d' },
  { icon: BadgeCheck, titleKey: 'f2f.quality.t', descKey: 'f2f.quality.d' },
  { icon: Sunrise, titleKey: 'f2f.deliver.t', descKey: 'f2f.deliver.d' },
];

const FARM_INTEL = [
  { icon: CloudSun, titleKey: 'grow.w.t', descKey: 'grow.w.d', href: '/demand' },
  { icon: Droplets, titleKey: 'grow.i.t', descKey: 'grow.i.d', href: '/pricing' },
  { icon: Bug, titleKey: 'grow.pest.t', descKey: 'grow.pest.d', href: '/chatbot' },
  { icon: Stethoscope, titleKey: 'grow.soil.t', descKey: 'grow.soil.d', href: '/chatbot' },
];

const SAMACHAR = [
  { tagKey: 'sam.m.tag', icon: Scale, titleKey: 'sam.m.t', href: '/pricing', src: '/assets/images/grain-sacks.jpg' },
  { tagKey: 'sam.f.tag', icon: Users, titleKey: 'sam.f.t', href: '/demand', src: '/assets/images/man-farmer.jpg' },
  { tagKey: 'sam.season.tag', icon: CloudSun, titleKey: 'sam.season.t', href: '/logistics', src: '/assets/images/paddy.jpg' },
];

const AGRI_NEWS = [
  { src: '/assets/images/paddy.jpg', date: '12 Sep', tagKey: 'news.tag1', titleKey: 'news.t1', descKey: 'news.d1', srcKey: 'news.src1' },
  { src: '/assets/images/veg-table.jpg', date: '11 Sep', tagKey: 'news.tag2', titleKey: 'news.t2', descKey: 'news.d2', srcKey: 'news.src2' },
  { src: '/assets/images/grain-sacks.jpg', date: '10 Sep', tagKey: 'news.tag3', titleKey: 'news.t3', descKey: 'news.d3', srcKey: 'news.src3' },
  { src: '/assets/images/delivery-truck.jpg', date: '9 Sep', tagKey: 'news.tag4', titleKey: 'news.t4', descKey: 'news.d4', srcKey: 'news.src4' },
];

const FAQS = [
  { qKey: 'faq.q1', aKey: 'faq.a1' },
  { qKey: 'faq.q2', aKey: 'faq.a2' },
  { qKey: 'faq.q3', aKey: 'faq.a3' },
  { qKey: 'faq.q4', aKey: 'faq.a4' },
  { qKey: 'faq.q5', aKey: 'faq.a5' },
  { qKey: 'faq.q6', aKey: 'faq.a6' },
  { qKey: 'faq.q7', aKey: 'faq.a7' },
  { qKey: 'faq.q8', aKey: 'faq.a8' },
];

const SECTIONS_ORDER = LEAD_SECTIONS.map((name) => ({ id: name.toLowerCase().replace(/\W+/g, '-'), name }));

const CHIP_COLORS = [
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
  'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300',
  'bg-lime-100 text-lime-800 dark:bg-lime-950/60 dark:text-lime-300',
  'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300',
  'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300',
];
const chipCls = (i) => CHIP_COLORS[((i % CHIP_COLORS.length) + CHIP_COLORS.length) % CHIP_COLORS.length];

const STRIPE_COLORS = [
  'from-emerald-500 to-lime-500',
  'from-amber-400 to-orange-500',
  'from-orange-500 to-amber-500',
  'from-lime-500 to-emerald-600',
  'from-sky-500 to-emerald-500',
  'from-amber-500 to-lime-500',
];
const stripeCls = (i) => `bg-gradient-to-r ${STRIPE_COLORS[((i % STRIPE_COLORS.length) + STRIPE_COLORS.length) % STRIPE_COLORS.length]}`;

const DOT_COLORS = ['bg-emerald-500', 'bg-amber-500', 'bg-orange-500', 'bg-lime-500', 'bg-green-600', 'bg-sky-500'];
const dotCls = (i) => DOT_COLORS[((i % DOT_COLORS.length) + DOT_COLORS.length) % DOT_COLORS.length];

const SOLID_TAGS = ['bg-emerald-600 hover:bg-emerald-700', 'bg-amber-500 hover:bg-amber-600', 'bg-orange-600 hover:bg-orange-700'];

function marketLabel(product) {
  return [product.location?.district, product.location?.state].filter(Boolean).join(', ');
}

function roleBadge(product) {
  return product.isFpo
    ? { label: 'FPO', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' }
    : { label: 'Farmer', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' };
}

function Brand() {
  return (
    <Link to="/home" onClick={() => window.scrollTo(0, 0)} className="flex items-center gap-2">
      <img src="/assets/images/logo.png" alt="Agrolink" className="h-9 w-auto" />
    </Link>
  );
}

function Reveal({ children, className = '', delay = 0 }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add('is-visible');
            io.disconnect();
          }
        });
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

function Tilt({ children, className = '', max = 8 }) {
  const ref = React.useRef(null);
  const frame = React.useRef(0);

  const onMove = React.useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const rx = (0.5 - py) * max;
      const ry = (px - 0.5) * max;
      el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02, 1.02, 1)`;
      el.style.setProperty('--gx', `${px * 100}%`);
      el.style.setProperty('--gy', `${py * 100}%`);
    });
  }, [max]);

  const onLeave = React.useCallback(() => {
    cancelAnimationFrame(frame.current);
    const el = ref.current;
    if (el) el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  }, []);

  return (
    <div className={`tilt-wrap ${className}`}>
      <div ref={ref} className="tilt-card relative h-full" onMouseMove={onMove} onMouseLeave={onLeave}>
        <span className="tilt-glare" />
        {children}
      </div>
    </div>
  );
}

function Counter({ to, prefix = '', suffix = '', decimals = 0 }) {
  const ref = React.useRef(null);
  const started = React.useRef(false);
  const [val, setVal] = React.useState(0);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const duration = 1300;
          const tick = (now) => {
            const p = Math.min(1, (now - start) / duration);
            setVal(to * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.disconnect();
        }
      });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);

  return (
    <span ref={ref}>
      {prefix}{val.toFixed(decimals)}{suffix}
    </span>
  );
}

function SectionHeading({ kicker, title, actionHref, actionLabel }) {
  const { t } = useLanguage();
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        {kicker ? (
          <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <span className="h-1.5 w-6 rounded-full bg-gradient-to-r from-emerald-500 to-amber-500" />
            {kicker}
          </p>
        ) : null}
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h2>
      </div>
      {actionHref || actionLabel ? (
        <Link to={actionHref ?? '#!'} className="group flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
          {actionLabel ?? t('leads.viewAll')} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : null}
    </div>
  );
}

function MandiCard({ product }) {
  const { t } = useLanguage();
  const img = productImageOf(product.id);
  return (
    <Link
      to={`/marketplace/${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <span className={`absolute inset-x-0 top-0 z-10 h-1 ${stripeCls(String(product.id ?? '').charCodeAt(0))}`} />
      <div className="relative overflow-hidden">
        {img ? (
          <img
            src={img}
            alt={product.name}
            loading="lazy"
            className="aspect-[3/1] w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex aspect-[3/1] w-full items-center justify-center bg-gradient-to-br from-emerald-100 to-lime-50 text-2xl">
            {product.icon ?? '🌱'}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
        <span className="absolute bottom-2 right-2 rounded-full bg-emerald-600/95 px-2.5 py-0.5 text-xs font-bold text-white shadow">
          {formatPrice(product.pricePerUnit)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-1 text-sm font-bold">{product.name}</p>
          <span className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-amber-600">
            <TrendingUp className="h-3 w-3" /> {t('mandi.farmgate')}
          </span>
        </div>
        <div className="mt-auto flex items-center justify-between border-t pt-2.5">
          <p className="truncate text-xs text-muted-foreground">{marketLabel(product)}</p>
          <p className="shrink-0 text-xs font-semibold">{product.unit}</p>
        </div>
      </div>
    </Link>
  );
}

function LeadCard({ product }) {
  const { t } = useLanguage();
  const badge = roleBadge(product);
  const img = productImageOf(product.id);
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="relative overflow-hidden">
        {img ? (
          <img
            src={img}
            alt={product.name}
            loading="lazy"
            className="aspect-[3/1] w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex aspect-[3/1] w-full items-center justify-center bg-gradient-to-br from-emerald-100 to-lime-50 text-3xl">
            {product.icon ?? '🌱'}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <span className={`absolute left-2.5 top-2.5 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${badge.className}`}>{badge.label}</span>
        <span className="absolute bottom-2.5 right-2.5 rounded-full bg-emerald-600/95 px-2.5 py-1 text-xs font-bold text-white shadow">
          {formatPrice(product.pricePerUnit)}/{product.unit}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-1 text-sm font-bold">{product.name}</p>
          <span className="shrink-0 rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
            {product.variety ?? '—'}
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="flex min-w-0 items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{marketLabel(product)}</span>
          </span>
          <span className="shrink-0 font-medium text-primary">{product.quality ?? 'Standard'}</span>
        </div>
        <div className="mt-auto flex items-center justify-between border-t pt-2.5">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="h-3.5 w-3.5" /> {product.stockQuantity} {product.unit}
          </span>
          <Link to={`/marketplace/${product.id}`} className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            {t('card.more')} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function LeadsSection({ name, products }) {
  const { t } = useLanguage();
  return (
    <div className="scroll-mt-20">
      <SectionHeading
        kicker={t('leads.kicker')}
        title={t('leads.head').replace('{name}', name)}
        actionHref="/marketplace"
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => <LeadCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}

function MarqueeTicker({ rows }) {
  const items = [...rows, ...rows, ...rows, ...rows];
  return (
    <div className="relative overflow-hidden border-y bg-card/60 py-3">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />
      <div className="agrolink-marquee flex w-max">
        {items.map((r, i) => {
          const src = productImageOf(r.id);
          return (
            <div key={i} className={`mr-4 flex min-w-max items-center gap-3 rounded-xl border border-l-4 bg-background px-4 py-2.5 ${['border-emerald-500', 'border-amber-500', 'border-lime-500', 'border-orange-500', 'border-sky-500', 'border-green-600'][i % 6]}`}>
              {src ? (
                <img src={src} alt={r.name} loading="lazy" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
              ) : (
                <span className="text-xl">{r.icon}</span>
              )}
              <div>
                <p className="text-sm font-semibold">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.market}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-primary">{formatPrice(r.price)}</p>
                <p className="text-[11px] text-emerald-600">per {r.unit}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Testimonials() {
  const { t } = useLanguage();
  const [idx, setIdx] = React.useState(0);
  const paused = React.useRef(false);

  React.useEffect(() => {
    const timer = setInterval(() => {
      if (!paused.current) setIdx((i) => (i + 1) % TESTIMONIALS.length);
    }, 5200);
    return () => clearInterval(timer);
  }, []);

  const tst = TESTIMONIALS[idx];
  return (
    <div
      className="relative mx-auto max-w-3xl rounded-3xl border bg-card p-8 text-center shadow-sm sm:p-10"
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
    >
      <Quote className="mx-auto h-8 w-8 text-primary/30" />
      <p key={idx} className="agrolink-fade-up mt-4 min-h-[5.5rem] text-base leading-relaxed text-muted-foreground sm:text-lg">
        {t(tst.textKey)}
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <img src={tst.avatar} alt={tst.name} className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/20" loading="lazy" />
        <div className="text-left">
          <p className="font-bold">{tst.name}</p>
          <p className="text-xs text-muted-foreground">{t(tst.roleKey)}</p>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <div className="mt-6 flex items-center justify-center gap-4">
        <button type="button" onClick={() => setIdx((i) => (i + TESTIMONIALS.length - 1) % TESTIMONIALS.length)} className="rounded-full border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Previous testimonial">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex gap-1.5">
          {TESTIMONIALS.map((tt, i) => (
            <button
              key={tt.name}
              type="button"
              onClick={() => setIdx(i)}
              aria-label={`Testimonial ${i + 1}`}
              className={`h-2 rounded-full transition-all ${i === idx ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60'}`}
            />
          ))}
        </div>
        <button type="button" onClick={() => setIdx((i) => (i + 1) % TESTIMONIALS.length)} className="rounded-full border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Next testimonial">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ValueChain() {
  const { t } = useLanguage();
  return (
    <section id="everyone" className="border-t bg-secondary/30 py-14 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading kicker={t('vc.kicker')} title={t('vc.title')} actionHref="/marketplace" actionLabel={t('vc.action')} />
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {VALUE_CHAIN.map((v, i) => (
            <Reveal key={v.titleKey} delay={i * 70}>
              <Link to={v.href} className="flex h-full gap-4 rounded-2xl border bg-card p-5 transition-all hover:-translate-y-1 hover:shadow-lg">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${chipCls(i)}`}><v.icon className="h-5 w-5" /></span>
                <div>
                  <h3 className="font-bold">{t(v.titleKey)}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t(v.descKey)}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function MandiIntelligence() {
  const { t } = useLanguage();
  const chips = [
    { icon: Scale, key: 'intel.modal' },
    { icon: Landmark, key: 'intel.msp' },
    { icon: Globe, key: 'intel.onenation' },
    { icon: Newspaper, key: 'intel.bulletins' },
  ];
  return (
    <div className="mt-8 rounded-2xl border bg-secondary/30 p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-xl text-sm font-semibold">
          {t('intel.desc')}
        </p>
        <div className="flex flex-wrap gap-2">
          {chips.map((c, i) => (
            <span key={c.key} className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${chipCls(i)}`}>
              <c.icon className="h-3.5 w-3.5" /> {t(c.key)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function FarmToFork() {
  const { t } = useLanguage();
  return (
    <section className="mx-auto max-w-7xl scroll-mt-20 px-4 py-14 sm:px-6">
      <Reveal>
        <SectionHeading kicker={t('f2f.kicker')} title={t('f2f.title')} actionHref="/marketplace" actionLabel={t('f2f.action')} />
      </Reveal>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {FARM_TO_FORK.map((f, i) => (
          <Reveal key={f.titleKey} delay={i * 90}>
            <div className="relative h-full rounded-2xl border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
              <span className="absolute right-5 top-5 text-4xl font-extrabold text-muted/30">{i + 1}</span>
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${chipCls(i)}`}><f.icon className="h-5 w-5" /></span>
              <h3 className="mt-4 text-lg font-bold">{t(f.titleKey)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(f.descKey)}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={120}>
        <p className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> {t('f2f.check1')}</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-amber-500" /> {t('f2f.check2')}</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-orange-500" /> {t('f2f.check3')}</span>
        </p>
      </Reveal>
    </section>
  );
}

function GrowMore() {
  const { t } = useLanguage();
  return (
    <section className="border-y bg-secondary/30 py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="mb-8 text-center">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <span className="h-1.5 w-6 rounded-full bg-gradient-to-r from-emerald-500 to-amber-500" />
              {t('grow.kicker')}
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t('grow.title')}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              {t('grow.sub')}
            </p>
          </div>
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FARM_INTEL.map((f, i) => (
            <Reveal key={f.titleKey} delay={i * 80}>
              <Link to={f.href} className="flex h-full flex-col rounded-2xl border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${chipCls(i)}`}><f.icon className="h-5 w-5" /></span>
                <h3 className="mt-3 font-bold">{t(f.titleKey)}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t(f.descKey)}</p>
                <span className="mt-auto flex items-center gap-1 pt-3 text-sm font-semibold text-primary">{t('grow.try')} <ArrowRight className="h-3.5 w-3.5" /></span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function LatestNews() {
  const { t } = useLanguage();
  return (
    <section id="news" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-14 sm:px-6">
      <Reveal>
        <SectionHeading kicker={t('news.kicker')} title={t('news.title')} />
      </Reveal>
      <div className="grid gap-5 sm:grid-cols-2">
        {AGRI_NEWS.map((n, i) => (
          <Reveal key={n.titleKey} delay={i % 2 ? 80 : 0}>
            <a href="#news" className="group flex h-full gap-4 overflow-hidden rounded-2xl border bg-card p-3 pr-5 transition-all hover:-translate-y-1 hover:shadow-lg">
              <img src={n.src} alt="" loading="lazy" className="h-28 w-32 shrink-0 rounded-xl object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="flex min-w-0 flex-col">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow ${SOLID_TAGS[i % 3]}`}>{t(n.tagKey)}</span>
                  <span className="text-[11px] text-muted-foreground">{n.date} · {t(n.srcKey)}</span>
                </div>
                <h3 className="mt-1.5 line-clamp-2 font-bold leading-snug transition-colors group-hover:text-primary">{t(n.titleKey)}</h3>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{t(n.descKey)}</p>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Samachar() {
  const { t } = useLanguage();
  return (
    <section className="mx-auto max-w-7xl scroll-mt-20 px-4 py-14 sm:px-6">
      <Reveal>
        <SectionHeading kicker={t('sam.kicker')} title={t('sam.title')} actionHref="/pricing" actionLabel={t('sam.more')} />
      </Reveal>
      <div className="grid gap-5 sm:grid-cols-3">
        {SAMACHAR.map((a, i) => (
          <Reveal key={a.titleKey} delay={i * 80}>
            <Link to={a.href} className="group block overflow-hidden rounded-2xl border bg-card transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="relative h-36 overflow-hidden">
                <img src={a.src} alt={t(a.tagKey)} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <span className={`absolute left-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold text-white shadow ${SOLID_TAGS[i % 3]}`}><a.icon className="h-3 w-3" /> {t(a.tagKey)}</span>
              </div>
              <div className="p-4">
                <h3 className="font-bold leading-snug group-hover:text-primary">{t(a.titleKey)}</h3>
                <p className="mt-2 flex items-center gap-1 text-sm font-semibold text-primary">{t('sam.read')} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export default function Landing() {
  const { t, lang, setLang } = useLanguage();
  const [products, setProducts] = React.useState([]);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const heroRef = React.useRef(null);
  const heroBgRef = React.useRef(null);
  const heroFrame = React.useRef(0);

  React.useEffect(() => {
    productService.getAll().then(setProducts).catch(() => {});
  }, []);

  const onHeroMove = React.useCallback((e) => {
    const section = heroRef.current;
    const bg = heroBgRef.current;
    if (!section || !bg) return;
    const r = section.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    cancelAnimationFrame(heroFrame.current);
    heroFrame.current = requestAnimationFrame(() => {
      bg.style.transform = `translate3d(${x * 14}px, ${y * 12}px, 0) scale(1.06)`;
    });
  }, []);

  const onHeroLeave = React.useCallback(() => {
    cancelAnimationFrame(heroFrame.current);
    if (heroBgRef.current) {
      heroBgRef.current.style.transform = 'translate3d(0, 0, 0) scale(1.06)';
    }
  }, []);

  const mandiRows = products.slice(0, 6).map((p) => ({
    id: p.id,
    icon: p.icon,
    name: p.name,
    price: p.pricePerUnit,
    unit: p.unit,
    market: marketLabel(p),
  }));
  const mandiGrid = products.slice(0, 8);
  const grouped = SECTIONS_ORDER
    .map((s) => ({ ...s, products: products.filter((p) => p.category === s.name).slice(0, 3) }))
    .filter((s) => s.products.length)
    .slice(0, 4);

  return (
    <div className="agrolink-page-in min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/75 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-background/55">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Brand />
          <nav className="ml-8 hidden items-center gap-5 text-sm font-medium text-muted-foreground xl:flex">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="transition-colors hover:text-foreground">{t(l.labelKey)}</a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1.5">
            <LanguageSwitcher />
            <ThemeToggle />
            <div className="hidden items-center gap-2 sm:flex">
              <Button asChild variant="ghost" size="sm"><Link to="/login?role=ADMIN">{t('nav.adminLogin')}</Link></Button>
            </div>
            <Button variant="ghost" size="icon" className="xl:hidden" onClick={() => setMenuOpen((o) => !o)} aria-label="Open menu">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          </div>
        </div>
        {menuOpen ? (
          <div className="border-t bg-background px-4 py-3 xl:hidden">
            <div className="flex flex-col gap-2">
              {NAV_LINKS.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="text-sm font-medium text-muted-foreground">{t(l.labelKey)}</a>
              ))}
              <div className="flex gap-2 pt-2">
                <Button asChild variant="outline" size="sm" className="flex-1"><Link to="/login?role=ADMIN">{t('nav.adminLogin')}</Link></Button>
              </div>
            </div>
          </div>
        ) : null}
      </header>

      {/* Hero — cover banner */}
      <section ref={heroRef} onMouseMove={onHeroMove} onMouseLeave={onHeroLeave} className="relative overflow-hidden border-b">
        <div className="pointer-events-none absolute inset-0">
          <div ref={heroBgRef} className="absolute inset-0 transition-transform duration-300 ease-out will-change-transform">
            <img
              src="/assets/images/hero-farm-real-4.jpg"
              alt="Indian farmer working in a green rice paddy field"
              className="h-full w-full scale-[1.06] object-cover [object-position:center_40%]"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/55 via-emerald-900/30 to-[#0c3327]/70 transition-opacity duration-700 dark:from-[#04122b]/85 dark:via-[#0a2a3f]/55 dark:to-[#031a17]/90" />
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:18px_18px]" />
            <div
              aria-hidden
              className="absolute inset-0 opacity-0 transition-opacity duration-700 dark:opacity-100 dark:bg-[radial-gradient(circle,rgba(255,255,255,0.35)_1px,transparent_1px)] dark:bg-[size:110px_110px]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.02)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.02)_50%,rgba(255,255,255,0.02)_75%,transparent_75%)] bg-[size:40px_40px]" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-background" />
        </div>
        <div className="relative mx-auto flex max-w-7xl flex-col justify-center px-4 pb-24 pt-20 sm:px-6 lg:min-h-[78vh] lg:pb-32 lg:pt-28">
          <div className="max-w-3xl">
            <span className="agrolink-fade-up inline-flex w-fit items-center gap-2 rounded-full border border-amber-300/40 bg-gradient-to-r from-emerald-600/40 via-green-600/30 to-amber-500/30 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              <Languages className="h-3.5 w-3.5 text-amber-300" />
              {t('hero.kicker')}
            </span>
            <h1 className="agrolink-fade-up mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-white [animation-delay:120ms] sm:text-6xl lg:text-7xl">
              {t('hero.h1a')}{' '}
              <span className="agrolink-animate-gradient bg-gradient-to-r from-lime-300 via-amber-300 to-orange-400 bg-clip-text text-transparent">{t('hero.h1b')}</span>
            </h1>
            <p className="agrolink-fade-up mt-4 text-xl font-semibold text-white/90 [animation-delay:200ms]">
              {t('hero.subtitle')}
            </p>
            <p className="agrolink-fade-up mt-4 max-w-2xl text-base text-white/75 [animation-delay:280ms] sm:text-lg">
              {t('hero.desc')}
            </p>
          </div>

          <div className="agrolink-fade-up mt-12 grid max-w-2xl gap-4 [animation-delay:360ms] sm:grid-cols-3">
            <Tilt>
              <Button asChild variant="success" size="lg" className="agrolink-neon-emerald w-full h-auto flex-col items-start gap-1 rounded-xl px-5 py-3.5">
                <Link to="/select-role?group=seller" className="group text-left whitespace-normal">
                  <span className="text-lg font-extrabold tracking-tight text-white">{t('hero.seller')}</span>
                  <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-100/90">
                    {t('hero.sellerMore')} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Button>
            </Tilt>
            <Tilt>
              <Button asChild size="lg" className="agrolink-neon-primary w-full h-auto flex-col items-start gap-1 rounded-xl px-5 py-3.5">
                <Link to="/select-role?group=buyer" className="group text-left whitespace-normal">
                  <span className="text-lg font-extrabold tracking-tight text-white">{t('hero.buyer')}</span>
                  <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary-foreground/90">
                    {t('hero.buyerMore')} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Button>
            </Tilt>
            <Tilt>
              <Button asChild size="lg" className="w-full h-auto flex-col items-start gap-1 rounded-xl px-5 py-3.5 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-lg shadow-orange-700/30">
                <Link to="/select-role?group=driver" className="group text-left whitespace-normal">
                  <span className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-white">
                    <Truck className="h-5 w-5 shrink-0" /> {t('hero.driver')}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-orange-100/90">
                    {t('hero.driverMore')} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Button>
            </Tilt>
          </div>

          <div className="agrolink-fade-up mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-white/80 [animation-delay:440ms]">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> {t('hero.free')}</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-lime-300" /> {t('hero.verified')}</span>
            <span className="flex items-center gap-1.5"><LineChart className="h-4 w-4 text-amber-300" /> {t('hero.mandiRates')}</span>
            <span className="flex items-center gap-1.5"><Sunrise className="h-4 w-4 text-orange-300" /> {t('hero.fresh88')}</span>
          </div>
        </div>
      </section>

      {/* Animated stats */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.labelKey} delay={i * 90}>
              <Tilt>
                <div className="relative overflow-hidden rounded-2xl agrolink-glass p-5 text-center agrolink-lift">
                  <span className={`absolute inset-x-0 top-0 h-1 ${stripeCls(i)}`} />
                  <p className="text-2xl font-extrabold text-primary sm:text-3xl">
                    <Counter to={s.to} prefix={s.prefix} suffix={s.suffix} decimals={s.decimals ?? 0} />
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{t(s.labelKey)}</p>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Every link, empowered (NinjaCart-style) */}
      <ValueChain />

      {/* Live Mandi Prices */}
      <section id="prices" className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-4 sm:px-6">
        <Reveal>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                <span className="h-1.5 w-6 rounded-full bg-gradient-to-r from-emerald-500 to-amber-500" />
                {t('mandi.kicker')}
              </p>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t('mandi.title')}</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> {t('mandi.live')}
              </span>
              <Link to="/marketplace" className="group flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                {t('mandi.viewAll')} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {mandiGrid.length ? <MarqueeTicker rows={mandiRows} /> : (
        <div className="mx-auto max-w-7xl px-4 sm:px-6"><div className="h-16 animate-pulse rounded-xl bg-muted" /></div>
      )}

      {/* Mandi grid */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {mandiGrid.length ? mandiGrid.map((p) => (
            <Reveal key={p.id}>
              <Tilt>
                <MandiCard product={p} />
              </Tilt>
            </Reveal>
          )) : Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />)}
        </div>
        <Reveal delay={100}>
          <MandiIntelligence />
        </Reveal>
      </section>

      {/* What Agrolink does */}
      <section className="border-y bg-secondary/30 py-14">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <div className="relative group">
              <img
                src="/assets/images/farmer-smile.jpg"
                alt="Farmer standing in a harvest-ready field"
                className="aspect-[4/3] w-full rounded-2xl object-cover shadow-lg transition-transform duration-500 group-hover:scale-[1.02]"
                loading="lazy"
              />
              <div className="absolute -bottom-5 left-5 flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 shadow-lg">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><TrendingUp className="h-5 w-5" /></span>
                <div>
                  <p className="text-sm font-bold">{t('what.gate')}</p>
                  <p className="text-xs text-muted-foreground">{t('what.gateSub')}</p>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div>
              <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                  <span className="h-1.5 w-6 rounded-full bg-gradient-to-r from-emerald-500 to-amber-500" />
                  {t('what.kicker')}
                </p>
                <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t('what.title')}</h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  {t('what.desc')}
                </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  { icon: BarChart3, key: 'what.ai' },
                  { icon: Globe, key: 'what.multi' },
                  { icon: Wallet, key: 'what.escrow' },
                ].map((f, i) => (
                  <div key={f.key} className="flex items-center gap-2.5 rounded-xl border bg-card px-3.5 py-3 transition-colors hover:bg-accent hover:text-accent-foreground">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${chipCls(i)}`}><f.icon className="h-4 w-4" /></span>
                    <span className="text-sm font-semibold">{t(f.key)}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Farm-to-fork freshness (Crofarm / FreshToHome style) */}
      <FarmToFork />

      {/* Our farms gallery */}
      <section id="gallery" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-14 sm:px-6">
        <Reveal>
          <SectionHeading kicker={t('gal.kicker')} title={t('gal.title')} />
        </Reveal>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {GALLERY.map((g, i) => (
            <Reveal key={g.src} delay={i * 70} className={g.src.includes('hero-farm') ? 'h-full sm:col-span-2 sm:row-span-2' : 'h-full'}>
              <Tilt max={6} className="h-full">
                <div className="group relative h-full min-h-[9rem] overflow-hidden rounded-2xl border">
                  <img
                    src={g.src}
                    alt={t(g.labelKey)}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute bottom-3 left-3 flex translate-y-2 items-center gap-1.5 text-sm font-semibold text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <MapPin className="h-4 w-4" /> {t(g.labelKey)}
                  </div>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Latest Leads */}
      <section id="leads" className="mx-auto max-w-7xl scroll-mt-20 space-y-14 px-4 py-6 sm:px-6">
        {grouped.map((s, i) => (
          <Reveal key={s.id} delay={i % 2 ? 100 : 0}>
            <LeadsSection {...s} />
          </Reveal>
        ))}
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="border-y bg-secondary/30 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <span className="h-1.5 w-6 rounded-full bg-gradient-to-r from-emerald-500 to-amber-500" />
              {t('testi.kicker')}
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t('testi.title')}</h2>
          </div>
          <Testimonials />
        </div>
      </section>

      {/* Grow more, grow better (Fasal / DeHaat / Samriddhi style) */}
      <GrowMore />

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-14 sm:px-6">
        <Reveal>
          <div className="mb-10 text-center">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <span className="h-1.5 w-6 rounded-full bg-gradient-to-r from-emerald-500 to-amber-500" />
              {t('steps.kicker')}
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t('steps.title')}</h2>
          </div>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.titleKey} delay={i * 110}>
              <div className="relative rounded-2xl border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
                <span className="absolute right-5 top-5 text-4xl font-extrabold text-muted/30">{i + 1}</span>
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${chipCls(i)}`}><s.icon className="h-5 w-5" /></span>
                <h3 className="mt-4 text-lg font-bold">{t(s.titleKey)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(s.descKey)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Who uses it */}
      <section id="who-uses" className="border-t bg-secondary/30 py-14">
        <div className="mx-auto max-w-7xl scroll-mt-20 px-4 sm:px-6">
          <Reveal>
            <SectionHeading kicker={t('who.kicker')} title={t('who.title')} />
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WHO_USES.map((w, i) => (
              <Reveal key={w.titleKey} delay={i * 70}>
                <div className="h-full rounded-2xl border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${chipCls(i)}`}><w.icon className="h-5 w-5" /></span>
                  <h3 className="mt-4 font-bold">{t(w.titleKey)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(w.descKey)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage */}
      <section id="coverage" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-14 sm:px-6">
        <Reveal>
          <SectionHeading kicker={t('cov.kicker')} title={t('cov.title')} />
        </Reveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.name} delay={i * 60}>
              <div className="relative overflow-hidden rounded-2xl border bg-card p-6 transition-colors hover:border-primary/40 hover:bg-secondary/60">
                <span className={`absolute inset-x-0 top-0 h-1 ${stripeCls(i)}`} />
                <h3 className="flex items-center gap-2 font-bold"><span className={`h-2.5 w-2.5 rounded-full ${dotCls(i)}`} />{c.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.crops.join(' · ')}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Features strip */}
      <section className="border-t bg-secondary/30 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <div className="mb-8 text-center">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                <span className="h-1.5 w-6 rounded-full bg-gradient-to-r from-emerald-500 to-amber-500" />
                {t('feat.kicker')}
              </p>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t('feat.title')}</h2>
            </div>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: BarChart3, titleKey: 'feat.price.t', descKey: 'feat.price.d' },
              { icon: Route, titleKey: 'feat.logi.t', descKey: 'feat.logi.d' },
              { icon: Package, titleKey: 'feat.order.t', descKey: 'feat.order.d' },
              { icon: Bot, titleKey: 'feat.bot.t', descKey: 'feat.bot.d' },
            ].map((f, i) => (
              <Reveal key={f.titleKey} delay={i * 80}>
                <div className="h-full rounded-2xl border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${chipCls(i)}`}><f.icon className="h-5 w-5" /></span>
                  <h3 className="mt-3 font-bold">{t(f.titleKey)}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t(f.descKey)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Latest news about our niche */}
      <LatestNews />

      {/* Mandi Samachar (Krishi Jagran style) */}
      <Samachar />

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-4xl scroll-mt-20 px-4 py-16 sm:px-6">
        <Reveal>
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t('faq.title')}</h2>
          </div>
        </Reveal>
        <div className="space-y-4">
          {FAQS.map((f, i) => (
            <Reveal key={f.qKey} delay={i * 60}>
              <details className="group rounded-2xl border bg-card p-5 transition-colors hover:border-primary/40">
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                  {t(f.qKey)}
                  <span className="ml-4 text-muted-foreground transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t(f.aKey)}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-green-700 to-emerald-900 px-6 py-12 text-center text-white sm:px-12">
            <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-amber-400/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-lime-300/30 blur-3xl" />
            <img src="/assets/images/paddy.jpg" alt="" aria-hidden className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-15" />
            <div className="relative">
              <Sprout className="pointer-events-none absolute -left-6 -top-10 h-40 w-40 opacity-20" />
              <CreditCard className="pointer-events-none absolute -bottom-10 -right-6 h-44 w-44 opacity-20" />
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t('cta.title')}</h2>
              <p className="mx-auto mt-3 max-w-xl text-white/80">
                {t('cta.desc')}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button asChild size="lg" variant="secondary" className="gap-2 bg-gradient-to-r from-amber-400 to-orange-500 font-bold text-emerald-950 hover:from-amber-300 hover:to-orange-400">
                  <Link to="/register">{t('cta.create')} <ArrowRight className="h-4 w-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white">
                  <Link to="/login">{t('cta.have')}</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t bg-secondary/30">
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-orange-500" />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Brand />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              {t('foot.blurb')}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Languages className="h-4 w-4 text-primary" />
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLang(l.code)}
                  className={`rounded-full border px-2.5 py-1 transition-colors ${
                    lang === l.code
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-transparent bg-card hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  {l.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-bold">{t('foot.market')}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/marketplace" className="transition-colors hover:text-foreground">{t('foot.browse')}</Link></li>
              <li><Link to="/pricing" className="transition-colors hover:text-foreground">{t('foot.price')}</Link></li>
              <li><Link to="/demand" className="transition-colors hover:text-foreground">{t('foot.demand')}</Link></li>
              <li><Link to="/logistics" className="transition-colors hover:text-foreground">{t('foot.logis')}</Link></li>
              <li><Link to="/chatbot" className="transition-colors hover:text-foreground">{t('foot.bot')}</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-bold">{t('foot.forfarmers')}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/register" className="transition-colors hover:text-foreground">{t('foot.sell')}</Link></li>
              <li><Link to="/register" className="transition-colors hover:text-foreground">{t('foot.fpo')}</Link></li>
              <li><Link to="/payment/history" className="transition-colors hover:text-foreground">{t('foot.pay')}</Link></li>
              <li><Link to="/orders" className="transition-colors hover:text-foreground">{t('foot.track')}</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-bold">{t('foot.company')}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><span className="cursor-default">{t('foot.about')}</span></li>
              <li><span className="cursor-default">{t('foot.samachar')}</span></li>
              <li><span className="cursor-default">{t('foot.partner')}</span></li>
              <li><span className="cursor-default">{t('foot.help')}</span></li>
              <li><Link to="/login" className="transition-colors hover:text-foreground">{t('foot.signin')} <code className="rounded bg-muted px-1 py-0.5">secret</code></Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6">
            <p>© {new Date().getFullYear()} Agrolink · {t('foot.bottom')}</p>
            <p className="flex items-center gap-1.5">{t('foot.sim')} <Truck className="h-3.5 w-3.5" /></p>
          </div>
        </div>
      </footer>
    </div>
  );
}