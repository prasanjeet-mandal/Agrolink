import { ROLES } from '@/constants/roles';

export const mapRole = (role) => {
  if (role === 'BUYER') return ROLES.CONSUMER;
  if (role === 'DELIVERY_PARTNER') return 'DELIVERY_PARTNER';
  if (role === 'FARMER' || role === 'FPO' || role === 'ADMIN') return role;
  return role ?? ROLES.CONSUMER;
};

export const toUser = (u) => ({
  id: u.userId ?? u.id,
  name: u.fullName ?? u.name,
  email: u.email,
  phone: u.phone ?? '',
  role: mapRole(u.role),
});

export const toSession = (res) => ({
  token: res.token,
  user: toUser(res),
});

const parseLocation = (loc) => {
  if (!loc) return { state: '', district: '', village: '' };
  if (typeof loc === 'object') {
    return {
      state: loc.state ?? '',
      district: loc.district ?? '',
      village: loc.village ?? '',
    };
  }
  const parts = String(loc).split(',').map((s) => s.trim()).filter(Boolean);
  return {
    state: parts[parts.length - 1] ?? '',
    district: parts[parts.length - 2] ?? '',
    village: parts.slice(0, -2).join(' ') ?? '',
  };
};

export const toProduct = (p) => {
  const location = parseLocation(p.location);
  return {
    id: p.id,
    name: p.name,
    icon: p.imageUrl ?? null,
    category: p.categoryName ?? '',
    variety: p.variety ?? p.name ?? '',
    unit: p.unit ?? '',
    pricePerUnit: Number(p.price ?? 0),
    stockQuantity: Number(p.availableQuantity ?? 0),
    minOrderQuantity: p.minOrderQuantity ?? 1,
    description: p.description ?? '',
    producerId: String(p.sellerId ?? ''),
    producerName: p.sellerName ?? '',
    producerType: p.sellerRole === 'FPO' ? 'FPO' : 'FARMER',
    isFpo: p.sellerRole === 'FPO',
    quality: p.quality ?? 'Standard',
    certification: p.certification ?? [],
    location,
    producerRating: p.sellerRating ?? null,
    producerVerified: p.sellerVerified ?? true,
    producerDistrict: location.district,
    producerState: location.state,
    status: p.status ?? 'ACTIVE',
    latitude: p.latitude ?? null,
    longitude: p.longitude ?? null,
    createdAt: p.createdAt ?? new Date().toISOString(),
  };
};

const FE_STATUS = {
  PLACED: 'PENDING',
  PACKED: 'PROCESSING',
  SHIPPED: 'READY_FOR_SHIPMENT',
  OUT_FOR_DELIVERY: 'IN_TRANSIT',
};

const BE_STATUS = {
  PENDING: 'PLACED',
  PROCESSING: 'PACKED',
  READY_FOR_SHIPMENT: 'SHIPPED',
  IN_TRANSIT: 'OUT_FOR_DELIVERY',
};

export const toOrderStatus = (s) => FE_STATUS[s] ?? s ?? 'PENDING';

export const toBackendStatus = (s) => BE_STATUS[s] ?? s;

export const mapPaymentStatus = (s) => (s === 'PAID' ? 'COMPLETED' : s ?? 'PENDING');

export const toBackendPaymentStatus = (s) => (s === 'COMPLETED' ? 'PAID' : s);

const toOrderItem = (i) => ({
  productId: i.productId,
  productName: i.productName ?? '',
  quantity: Number(i.quantity ?? 0),
  unit: i.unit ?? '',
  pricePerUnit: Number(i.unitPrice ?? 0),
  total: Number(i.lineTotal ?? 0),
  producerId: i.producerId ?? null,
  producerName: i.producerName ?? '',
});

export const toOrder = (o) => {
  const items = (o.items ?? []).map(toOrderItem);
  const deliveryFee = Number(o.deliveryFee ?? 0);
  const totalAmount = Number(o.totalAmount ?? 0);
  return {
    id: o.id,
    orderNumber: o.orderNumber ?? `AGL-2026-${String(o.id).padStart(4, '0')}`,
    consumerId: o.consumerId ?? null,
    consumerName: o.buyerName ?? '',
    producerId: items[0]?.producerId ?? o.producerId ?? null,
    producerName: items[0]?.producerName ?? o.producerName ?? '',
    items,
    status: toOrderStatus(o.status),
    paymentStatus: mapPaymentStatus(o.paymentStatus),
    paymentMethod: o.paymentMethod ?? 'UPI',
    subtotal: totalAmount - deliveryFee,
    deliveryFee,
    totalAmount,
    deliveryAddress: o.deliveryAddress
      ? {
          line1: o.deliveryAddress.addressLine ?? '',
          city: o.deliveryAddress.city ?? '',
          state: o.deliveryAddress.state ?? '',
          pincode: o.deliveryAddress.pincode ?? '',
        }
      : {},
    createdAt: o.createdAt ?? new Date().toISOString(),
    timeline: [{ status: toOrderStatus(o.status), at: o.createdAt ?? new Date().toISOString() }],
  };
};

export const toLogistics = (l) => ({
  id: l.id,
  orderId: l.orderId,
  orderNumber: l.orderNumber ?? `AGL-2026-${String(l.orderId).padStart(5, '0')}`,
  deliveryPartnerId: l.deliveryPartnerId ?? null,
  status: l.status ?? 'CREATED',
  pickupLocation: l.pickupLocation ?? 'Pickup',
  deliveryLocation: l.deliveryLocation ?? 'Delivery',
  distanceKm: l.distanceKm ?? null,
  etaMinutes: l.etaMinutes ?? null,
  routeSummary: l.routeSummary ?? '',
  buyerName: l.buyerName ?? '',
  items: (l.items ?? []).map((i) => ({
    productId: i.productId,
    productName: i.productName ?? '',
    quantity: Number(i.quantity ?? 0),
    unit: i.unit ?? '',
    unitPrice: Number(i.unitPrice ?? 0),
    lineTotal: Number(i.lineTotal ?? 0),
  })),
  totalAmount: Number(l.totalAmount ?? 0),
  deliveryAddress: l.deliveryAddress
    ? {
        line1: l.deliveryAddress.line1 ?? '',
        city: l.deliveryAddress.city ?? '',
        state: l.deliveryAddress.state ?? '',
        pincode: l.deliveryAddress.pincode ?? '',
      }
    : {},
  createdAt: l.createdAt ?? null,
    pickupLatitude: l.pickupLatitude ?? null,
    pickupLongitude: l.pickupLongitude ?? null,
    deliveryLatitude: l.deliveryLatitude ?? null,
    deliveryLongitude: l.deliveryLongitude ?? null,
    currentLatitude: l.currentLatitude ?? null,
    currentLongitude: l.currentLongitude ?? null,
    locationUpdatedAt: l.locationUpdatedAt ?? null,
});

export const toAddress = (a) => ({
  id: a.id,
  line1: a.addressLine ?? '',
  village: a.village ?? '',
  city: a.city ?? '',
  district: a.district ?? '',
  state: a.state ?? '',
  pincode: a.pincode ?? '',
  type: a.addressType ?? 'HOME',
  latitude: a.latitude ?? null,
  longitude: a.longitude ?? null,
});

export const fromAddress = (a) => ({
  addressLine: a.line1,
  village: a.village ?? a.district ?? '',
  city: a.city ?? '',
  district: a.district ?? a.city ?? '',
  state: a.state,
  pincode: a.pincode,
  addressType: a.type ?? 'HOME',
  latitude: a.latitude ?? null,
  longitude: a.longitude ?? null,
});

export const toPublicProducer = (me) => {
  const role = mapRole(me.role);
  const isFpo = role === ROLES.FPO;
  const farmName = me.organizationName ?? (isFpo ? me.fullName : `${me.fullName ?? 'Producer'}'s Farm`);
  return {
    id: String(me.id),
    userId: me.id,
    type: isFpo ? 'FPO' : 'FARMER',
    farmer: !isFpo,
    name: me.fullName ?? me.organizationName ?? 'Producer',
    farmName: farmName || (isFpo ? 'FPO' : 'Producer'),
    location: {
      state: me.state ?? '',
      district: me.district ?? '',
      village: me.village ?? '',
    },
    landSizeAcres: 0,
    pincode: me.pincode ?? '',
    crops: [],
    certifications: [],
    rating: null,
    verified: true,
    farmDescription: me.description ?? '',
    bankDetails: null,
    upiId: '',
    phone: me.phone ?? '',
  };
};

export const toProducerProfile = toPublicProducer;

export const toUserProfile = (u) => {
  const base = toUser(u);
  if (base.role === ROLES.CONSUMER) {
    return {
      ...base,
      profile: {
        id: `c${u.id}`,
        userId: u.id,
        fullName: u.fullName ?? base.name,
        deliveryAddress: {},
        preferredCategories: [],
      },
    };
  }
  if (base.role === ROLES.FARMER || base.role === ROLES.FPO) {
    return {
      ...base,
      profile: {
        id: `p${u.id}`,
        userId: u.id,
        type: base.role,
        farmer: base.role === ROLES.FARMER,
        name: u.fullName ?? base.name,
        farmName: '',
        location: {},
        landSizeAcres: 0,
        crops: [],
        certifications: [],
        rating: null,
        verified: true,
        farmDescription: '',
        bankDetails: null,
        upiId: '',
      },
    };
  }
  return { ...base, profile: null };
};