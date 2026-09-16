import {
  LayoutDashboard,
  Package,
  PackagePlus,
  ShoppingCart,
  ListOrdered,
  Banknote,
  Store,
  TrendingUp,
  BarChart3,
  Truck,
  PackageCheck,
  CreditCard,
  UserCircle2,
  MessageSquare,
  Search,
} from 'lucide-react';
import { ROLES } from '@/constants/roles';

const sharedFooterNav = [
  { label: 'Marketplace', to: '/marketplace', icon: Store },
  { label: 'Pricing', to: '/pricing', icon: TrendingUp },
  { label: 'Demand', to: '/demand', icon: BarChart3 },
];

const sharedConsumerNav = [
  { label: 'My Orders', to: '/orders', icon: ListOrdered },
  { label: 'Track Delivery', to: '/delivery', icon: PackageCheck },
  { label: 'Payments', to: '/payment/history', icon: CreditCard },
];

export const NAVIGATION = {
  [ROLES.CONSUMER]: [
    { title: 'Main', items: [
      { label: 'Dashboard', to: '/consumer', icon: LayoutDashboard, end: true },
      { label: 'Marketplace', to: '/marketplace', icon: Store },
      { label: 'Search Products', to: '/consumer/search', icon: Search },
      { label: 'Cart', to: '/consumer/cart', icon: ShoppingCart },
      { label: 'Pricing', to: '/pricing', icon: TrendingUp },
    ] },
    { title: 'Your activity', items: [
      { label: 'My Orders', to: '/orders', icon: ListOrdered },
      { label: 'Track Delivery', to: '/delivery', icon: PackageCheck },
      { label: 'Payments', to: '/payment/history', icon: CreditCard },
    ] },
  ],
  [ROLES.FARMER]: [
    { title: 'Farm', items: [
      { label: 'Dashboard', to: '/producer/farmer', icon: LayoutDashboard, end: true },
      { label: 'Profile', to: '/producer/farmer/profile', icon: UserCircle2 },
    ] },
    { title: 'My produce', items: [
      { label: 'My Products', to: '/producer/farmer/products', icon: Package },
      { label: 'Add Product', to: '/producer/farmer/products/add', icon: PackagePlus },
      { label: 'Incoming Orders', to: '/producer/farmer/orders/incoming', icon: ListOrdered },
      { label: 'Payments', to: '/producer/farmer/payments', icon: Banknote },
    ] },
    { title: 'Insights', items: [
      { label: 'Marketplace', to: '/marketplace', icon: Store },
      { label: 'Pricing', to: '/pricing', icon: TrendingUp },
      { label: 'Demand', to: '/demand', icon: BarChart3 },
      { label: 'Delivery', to: '/delivery', icon: PackageCheck },
      { label: 'AI Assistant', to: '/chatbot', icon: MessageSquare },
    ] },
  ],
  [ROLES.FPO]: [
    { title: 'Organization', items: [
      { label: 'Dashboard', to: '/producer/fpo', icon: LayoutDashboard, end: true },
      { label: 'Profile', to: '/producer/fpo/profile', icon: UserCircle2 },
    ] },
    { title: 'Products', items: [
      { label: 'Add Product', to: '/producer/fpo/products/add', icon: PackagePlus },
      { label: 'Manage Products', to: '/producer/fpo/products', icon: Package },
      { label: 'Buy Products', to: '/producer/fpo/products/buy', icon: ShoppingCart },
      { label: 'Sell Products', to: '/producer/fpo/products/sell', icon: Store },
    ] },
    { title: 'Orders & money', items: [
      { label: 'Incoming Orders', to: '/producer/fpo/orders/incoming', icon: ListOrdered },
      { label: 'Outgoing Orders', to: '/producer/fpo/orders/outgoing', icon: PackageCheck },
      { label: 'Payments', to: '/producer/fpo/payments', icon: Banknote },
    ] },
    { title: 'Logistics', items: [
      { label: 'Logistics', to: '/logistics', icon: Truck },
      { label: 'Delivery', to: '/delivery', icon: PackageCheck },
    ] },
    { title: 'Insights', items: [
      { label: 'Pricing', to: '/pricing', icon: TrendingUp },
      { label: 'Demand', to: '/demand', icon: BarChart3 },
      { label: 'AI Assistant', to: '/chatbot', icon: MessageSquare },
    ] },
  ],
  [ROLES.DELIVERY_PARTNER]: [
    { title: 'Deliveries', items: [
      { label: 'Dashboard', to: '/delivery-partner', icon: LayoutDashboard, end: true },
      { label: 'Assigned Deliveries', to: '/delivery-partner/deliveries', icon: ListOrdered },
    ] },
    { title: 'Account', items: [
      { label: 'Profile', to: '/profile', icon: UserCircle2 },
    ] },
  ],
  [ROLES.ADMIN]: [
    { title: 'Manage', items: [
      { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
      { label: 'Orders', to: '/admin', icon: ListOrdered, end: true },
    ] },
    { title: 'Account', items: [
      { label: 'Profile', to: '/profile', icon: UserCircle2 },
    ] },
  ],
};

export { sharedFooterNav, sharedConsumerNav };