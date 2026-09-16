import { ROLES } from '@/constants/roles';
import { PRODUCER_TYPES } from '@/constants/producerTypes';
import { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHODS } from '@/constants';

function series(startValue, { drift = 1, volatility = 0.08, count = 30, startOffset = 30 }) {
  const points = [];
  let value = startValue;
  const now = Date.now();
  for (let i = count - 1; i >= 0; i -= 1) {
    points.push({ at: now - i * 24 * 60 * 60 * 1000, value: Number(value.toFixed(2)) });
    value = value * (1 + (Math.random() - 0.48) * volatility + drift * 0.005);
  }
  return points.slice(startOffset);
}

function forecastFrom(history, { months = 6, volatility = 0.05 } = {}) {
  const last = history[history.length - 1];
  const points = [];
  let value = last.value;
  const start = new Date(last.at);
  for (let i = 1; i <= months; i += 1) {
    const at = new Date(start);
    at.setMonth(at.getMonth() + i);
    value = value * (1 + (Math.random() - 0.45) * volatility + 0.012);
    points.push({ at: at.getTime(), value: Number(value.toFixed(2)) });
  }
  return points;
}

const LAT_LNG = {
  punjab: { lat: 30.9, lng: 75.85 },
  maharashtra: { lat: 19.75, lng: 75.7 },
  uttarPradesh: { lat: 26.85, lng: 80.95 },
  karnataka: { lat: 12.97, lng: 77.59 },
  tamilNadu: { lat: 10.79, lng: 78.7 },
  gujarat: { lat: 22.3, lng: 70.8 },
  bihar: { lat: 25.6, lng: 85.1 },
  westBengal: { lat: 23.2, lng: 88.25 },
  madhyaPradesh: { lat: 23.25, lng: 77.4 },
};

export const users = [
  {
    id: 'u1', name: 'Meera Sharma', email: 'meera@example.com', phone: '9876543210',
    password: 'secret', role: ROLES.CONSUMER,
  },
  {
    id: 'u2', name: 'Amit Patel', email: 'amit@example.com', phone: '9812345670',
    password: 'secret', role: ROLES.CONSUMER,
  },
  {
    id: 'u3', name: 'Harpreet Singh', email: 'harpreet@example.com', phone: '9834567890',
    password: 'secret', role: ROLES.FARMER,
  },
  {
    id: 'u4', name: 'Ramesh Kumar', email: 'ramesh@example.com', phone: '9871000001',
    password: 'secret', role: ROLES.FARMER,
  },
  {
    id: 'u5', name: 'Lakshmi Reddy', email: 'lakshmi@example.com', phone: '9845000002',
    password: 'secret', role: ROLES.FARMER,
  },
  {
    id: 'u6', name: 'Punjab Agri FPO', email: 'fpo.punjab@example.com', phone: '9855000003',
    password: 'secret', role: ROLES.FPO,
  },
  {
    id: 'u7', name: 'Sahyadri Farmers Co-op', email: 'fpo.sahyadri@example.com', phone: '9866000004',
    password: 'secret', role: ROLES.FPO,
  },
];

export const consumerProfiles = [
  {
    id: 'c1', userId: 'u1',
    fullName: 'Meera Sharma',
    deliveryAddress: { line1: '12, Green Park', city: 'Delhi', state: 'Delhi', pincode: '110016', lat: 28.56, lng: 77.2 },
    preferredCategories: ['Vegetables', 'Fruits', 'Grains & Pulses'],
  },
  {
    id: 'c2', userId: 'u2',
    fullName: 'Amit Patel',
    deliveryAddress: { line1: '8A, Hill Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400050', lat: 19.06, lng: 72.83 },
    preferredCategories: ['Vegetables', 'Spices', 'Dairy'],
  },
];

export const producerProfiles = [
  {
    id: 'p1', userId: 'u3', type: PRODUCER_TYPES.FARMER, farmer: true,
    name: 'Harpreet Singh',
    farmName: 'Harpreet Farms',
    location: { state: 'Punjab', district: 'Ludhiana', village: 'Raikot', lat: 30.65, lng: 75.6 },
    landSizeAcres: 12,
    crops: ['Wheat', 'Mustard', 'Potato'],
    certifications: ['Organic (In-transition)'],
    rating: 4.8,
    verified: true,
    farmDescription: 'Family farm growing certified organic wheat and mustard since 1998.',
    bankDetails: { accountName: 'Harpreet Singh', bank: 'Punjab National Bank', accountLast4: '2214', ifsc: 'PUNB0012300' },
    upiId: 'harpreet@okhdfc',
  },
  {
    id: 'p2', userId: 'u4', type: PRODUCER_TYPES.FARMER, farmer: true,
    name: 'Ramesh Kumar',
    farmName: 'Ramesh Agri',
    location: { state: 'Uttar Pradesh', district: 'Kanpur', village: 'Bhitauli', lat: 26.45, lng: 80.33 },
    landSizeAcres: 8,
    crops: ['Paddy', 'Potato'],
    certifications: [],
    rating: 4.5,
    verified: true,
    farmDescription: 'Paddy and potato farmer in the Gangetic plains.',
    bankDetails: { accountName: 'Ramesh Kumar', bank: 'State Bank of India', accountLast4: '9030', ifsc: 'SBIN0001801' },
    upiId: 'ramesh@oksbi',
  },
  {
    id: 'p3', userId: 'u5', type: PRODUCER_TYPES.FARMER, farmer: true,
    name: 'Lakshmi Reddy',
    farmName: 'Lakshmi Organic Farms',
    location: { state: 'Karnataka', district: 'Bengaluru Rural', village: 'Doddaballapura', lat: 13.29, lng: 77.54 },
    landSizeAcres: 18,
    crops: ['Turmeric', 'Ragi', 'Tomato'],
    certifications: ['NPOP Organic', 'FSSAI'],
    rating: 4.9,
    verified: true,
    farmDescription: 'Chemical-free turmeric and millet farm. Certified NPOP organic.',
    bankDetails: { accountName: 'Lakshmi Reddy', bank: 'Canara Bank', accountLast4: '3348', ifsc: 'CNRB0001780' },
    upiId: 'lakshmi@okaxis',
  },
  {
    id: 'p4', userId: 'u6', type: PRODUCER_TYPES.FPO, farmer: false,
    name: 'Punjab Agri FPO',
    fpoType: 'Farmer Producer Organization',
    memberFarmers: 412,
    location: { state: 'Punjab', district: 'Ludhiana', village: 'Ludhiana HUB', lat: 30.9, lng: 75.85 },
    crops: ['Wheat', 'Basmati Rice', 'Mustard Oil'],
    certifications: ['FSSAI', 'Geographical Indication (Basmati)'],
    rating: 4.7,
    verified: true,
    farmDescription: 'An FPO of 412 smallholder farmers pooling Basmati rice and wheat for direct sale.',
    bankDetails: { accountName: 'Punjab Agri FPO', bank: 'Punjab & Sind Bank', accountLast4: '6671', ifsc: 'PSIB0000555' },
    upiId: 'punjabagrifpo@okhdfc',
  },
  {
    id: 'p5', userId: 'u7', type: PRODUCER_TYPES.FPO, farmer: false,
    name: 'Sahyadri Farmers Co-op',
    fpoType: 'Farmer Cooperative Society',
    memberFarmers: 650,
    location: { state: 'Maharashtra', district: 'Pune', village: 'Baramati', lat: 17.99, lng: 74.05 },
    crops: ['Grapes', 'Onion', 'Tomato', 'Turmeric'],
    certifications: ['GlobalG.A.P.', 'FSSAI'],
    rating: 4.6,
    verified: true,
    farmDescription: '650-member cooperative aggregating grapes, onion and tomato from western Maharashtra.',
    bankDetails: { accountName: 'Sahyadri Farmers Co-op', bank: 'Bank of Maharashtra', accountLast4: '8850', ifsc: 'MAHB0001050' },
    upiId: 'sahyadrico-op@paytm',
  },
];

export const products = [
  {
    id: 'pr1', name: 'Basmati Rice (Premium)', icon: '🌾', category: 'Grains & Pulses', variety: 'Pusa 1121',
    unit: 'kg', pricePerUnit: 145, stockQuantity: 1200, minOrderQuantity: 10,
    description: 'Aged premium Basmati, single-polish, long grain. Harvested and milled by member farmers.',
    producerId: 'p4', quality: 'Premium', certification: ['FSSAI', 'GI (Basmati)'],
    location: { state: 'Punjab', district: 'Ludhiana', village: 'Member clusters' },
    isFpo: true, status: 'ACTIVE', createdAt: '2026-07-18T09:00:00Z',
  },
  {
    id: 'pr2', name: 'Mustard Oil (Kachi Ghani)', icon: '🫒', category: 'Oilseeds', variety: 'Yellow Sarson',
    unit: 'litre', pricePerUnit: 210, stockQuantity: 400, minOrderQuantity: 5,
    description: 'First-pressure cold-pressed mustard oil from yellow sarson seeds.',
    producerId: 'p4', quality: 'Premium', certification: ['FSSAI'],
    location: { state: 'Punjab', district: 'Ludhiana', village: 'Member clusters' },
    isFpo: true, status: 'ACTIVE', createdAt: '2026-07-20T09:00:00Z',
  },
  {
    id: 'pr3', name: 'Sharbati Wheat', icon: '🌾', category: 'Grains & Pulses', variety: 'Sharbati',
    unit: 'quintal', pricePerUnit: 3200, stockQuantity: 320, minOrderQuantity: 1,
    description: 'Stone-ground quality sharbati wheat, sun-dried and double cleaned.',
    producerId: 'p4', quality: 'Standard', certification: ['FSSAI'],
    location: { state: 'Punjab', district: 'Ludhiana', village: 'Member clusters' },
    isFpo: true, status: 'ACTIVE', createdAt: '2026-07-25T09:00:00Z',
  },
  {
    id: 'pr4', name: 'Fresh Potatoes', icon: '🥔', category: 'Vegetables', variety: 'Kufri Jyoti',
    unit: 'kg', pricePerUnit: 28, stockQuantity: 8000, minOrderQuantity: 50,
    description: 'Freshly harvested firm potatoes, graded and washed. Bulk truck-load lots available.',
    producerId: 'p2', quality: 'Standard', certification: [],
    location: { state: 'Uttar Pradesh', district: 'Kanpur', village: 'Bhitauli' },
    isFpo: false, status: 'ACTIVE', createdAt: '2026-08-02T09:00:00Z',
  },
  {
    id: 'pr5', name: 'Organic Wheat Flour (Atta)', icon: '🌾', category: 'Grains & Pulses', variety: 'Organic Lokvan',
    unit: 'kg', pricePerUnit: 62, stockQuantity: 1500, minOrderQuantity: 25,
    description: 'Whole-wheat flour milled from certified organic wheat. Low GI, high fibre.',
    producerId: 'p1', quality: 'Premium', certification: ['Organic (In-transition)'],
    location: { state: 'Punjab', district: 'Ludhiana', village: 'Raikot' },
    isFpo: false, status: 'ACTIVE', createdAt: '2026-08-05T09:00:00Z',
  },
  {
    id: 'pr6', name: 'Tomatoes (Ripe Gassed-free)', icon: '🍅', category: 'Vegetables', variety: 'Hybrid',
    unit: 'kg', pricePerUnit: 34, stockQuantity: 5000, minOrderQuantity: 100,
    description: 'Natural ripened tomatoes from co-op member farms. Best for processing & retail.',
    producerId: 'p5', quality: 'Standard', certification: ['GlobalG.A.P.'],
    location: { state: 'Maharashtra', district: 'Pune', village: 'Baramati' },
    isFpo: true, status: 'ACTIVE', createdAt: '2026-08-08T09:00:00Z',
  },
  {
    id: 'pr7', name: 'Thompson Seedless Grapes', icon: '🍇', category: 'Fruits', variety: 'Thompson Seedless',
    unit: 'kg', pricePerUnit: 90, stockQuantity: 1200, minOrderQuantity: 25,
    description: 'Crisp green seedless grapes, cold-chain packed for export-grade freshness.',
    producerId: 'p5', quality: 'Premium', certification: ['GlobalG.A.P.'],
    location: { state: 'Maharashtra', district: 'Pune', village: 'Baramati' },
    isFpo: true, status: 'ACTIVE', createdAt: '2026-08-10T09:00:00Z',
  },
  {
    id: 'pr8', name: 'Onions (Red)', icon: '🧅', category: 'Vegetables', variety: 'Nasik Red',
    unit: 'kg', pricePerUnit: 22, stockQuantity: 9000, minOrderQuantity: 100,
    description: 'High-tolerance red onions with good shelf life. Bulk lots ready for dispatch.',
    producerId: 'p5', quality: 'Standard', certification: [],
    location: { state: 'Maharashtra', district: 'Pune', village: 'Baramati' },
    isFpo: true, status: 'ACTIVE', createdAt: '2026-08-12T09:00:00Z',
  },
  {
    id: 'pr9', name: 'Organic Turmeric Powder', icon: '🧡', category: 'Spices', variety: 'Salem',
    unit: 'kg', pricePerUnit: 380, stockQuantity: 160, minOrderQuantity: 5,
    description: 'High-curcumin Salem turmeric, steamed-cured and ground in small batches.',
    producerId: 'p3', quality: 'Premium', certification: ['NPOP Organic'],
    location: { state: 'Karnataka', district: 'Bengaluru Rural', village: 'Doddaballapura' },
    isFpo: false, status: 'ACTIVE', createdAt: '2026-08-14T09:00:00Z',
  },
  {
    id: 'pr10', name: 'Ragi (Finger Millet)', icon: '🌾', category: 'Grains & Pulses', variety: 'Indaf-8',
    unit: 'kg', pricePerUnit: 48, stockQuantity: 600, minOrderQuantity: 10,
    description: 'Protein-rich finger millet, gluten-free, cleaned and polished.',
    producerId: 'p3', quality: 'Standard', certification: ['NPOP Organic'],
    location: { state: 'Karnataka', district: 'Bengaluru Rural', village: 'Doddaballapura' },
    isFpo: false, status: 'ACTIVE', createdAt: '2026-08-16T09:00:00Z',
  },
  {
    id: 'pr11', name: 'Fresh Tomatoes (Cherry)', icon: '🍅', category: 'Vegetables', variety: 'Cherry',
    unit: 'kg', pricePerUnit: 58, stockQuantity: 350, minOrderQuantity: 5,
    description: 'Sweet cherry tomatoes from farmer Lakshmi\'s greenhouse plots.',
    producerId: 'p3', quality: 'Premium', certification: ['FSSAI'],
    location: { state: 'Karnataka', district: 'Bengaluru Rural', village: 'Doddaballapura' },
    isFpo: false, status: 'ACTIVE', createdAt: '2026-08-18T09:00:00Z',
  },
  {
    id: 'pr12', name: 'Yellow Mustard Seeds', icon: '🟡', category: 'Oilseeds', variety: 'Pusa Bold',
    unit: 'kg', pricePerUnit: 84, stockQuantity: 900, minOrderQuantity: 25,
    description: 'High-oil-content mustard seeds cleaned and bagged in 50kg sacks.',
    producerId: 'p1', quality: 'Standard', certification: [],
    location: { state: 'Punjab', district: 'Ludhiana', village: 'Raikot' },
    isFpo: false, status: 'ACTIVE', createdAt: '2026-08-20T09:00:00Z',
  },
  {
    id: 'pr13', name: 'Fresh Cow Milk (Bulk)', icon: '🥛', category: 'Dairy', variety: 'Whole',
    unit: 'litre', pricePerUnit: 46, stockQuantity: 500, minOrderQuantity: 50,
    description: 'Twice-daily chilled bulk milk from co-op dairy network.',
    producerId: 'p5', quality: 'Standard', certification: ['FSSAI'],
    location: { state: 'Maharashtra', district: 'Pune', village: 'Baramati' },
    isFpo: true, status: 'ACTIVE', createdAt: '2026-08-22T09:00:00Z',
  },
  {
    id: 'pr14', name: 'Groundnut Kernels', icon: '🥜', category: 'Oilseeds', variety: 'TG 37A',
    unit: 'kg', pricePerUnit: 118, stockQuantity: 700, minOrderQuantity: 25,
    description: 'Hand-sorted bold groundnut kernels for oil extraction or snacking.',
    producerId: 'p1', quality: 'Standard', certification: [],
    location: { state: 'Punjab', district: 'Ludhiana', village: 'Raikot' },
    isFpo: false, status: 'ACTIVE', createdAt: '2026-08-24T09:00:00Z',
  },
  {
    id: 'pr15', name: 'Turmeric Finger (Raw)', icon: '🧡', category: 'Spices', variety: 'Salem',
    unit: 'kg', pricePerUnit: 92, stockQuantity: 800, minOrderQuantity: 10,
    description: 'Dried turmeric fingers for polishing or grinding. High curcumin content.',
    producerId: 'p3', quality: 'Premium', certification: ['NPOP Organic'],
    location: { state: 'Karnataka', district: 'Bengaluru Rural', village: 'Doddaballapura' },
    isFpo: false, status: 'ACTIVE', createdAt: '2026-08-26T09:00:00Z',
  },
];

export const orders = [
  {
    id: 'o1', orderNumber: 'AGL-2026-0001', consumerId: 'c1', consumerName: 'Meera Sharma',
    producerId: 'p4', producerName: 'Punjab Agri FPO',
    items: [
      { productId: 'pr1', productName: 'Basmati Rice (Premium)', quantity: 20, unit: 'kg', pricePerUnit: 145, total: 2900 },
      { productId: 'pr2', productName: 'Mustard Oil (Kachi Ghani)', quantity: 10, unit: 'litre', pricePerUnit: 210, total: 2100 },
    ],
    status: ORDER_STATUS.DELIVERED, paymentStatus: PAYMENT_STATUS.COMPLETED, paymentMethod: PAYMENT_METHODS.UPI,
    subtotal: 5000, deliveryFee: 0, totalAmount: 5000,
    deliveryAddress: { line1: '12, Green Park', city: 'Delhi', state: 'Delhi', pincode: '110016' },
    createdAt: '2026-08-01T10:00:00Z',
    timeline: [
      { status: ORDER_STATUS.PENDING, at: '2026-08-01T10:00:00Z' },
      { status: ORDER_STATUS.CONFIRMED, at: '2026-08-01T14:20:00Z' },
      { status: ORDER_STATUS.PROCESSING, at: '2026-08-02T09:00:00Z' },
      { status: ORDER_STATUS.READY_FOR_SHIPMENT, at: '2026-08-03T11:00:00Z' },
      { status: ORDER_STATUS.IN_TRANSIT, at: '2026-08-04T07:00:00Z' },
      { status: ORDER_STATUS.DELIVERED, at: '2026-08-05T13:30:00Z' },
    ],
  },
  {
    id: 'o2', orderNumber: 'AGL-2026-0002', consumerId: 'c2', consumerName: 'Amit Patel',
    producerId: 'p5', producerName: 'Sahyadri Farmers Co-op',
    items: [
      { productId: 'pr7', productName: 'Thompson Seedless Grapes', quantity: 40, unit: 'kg', pricePerUnit: 90, total: 3600 },
    ],
    status: ORDER_STATUS.IN_TRANSIT, paymentStatus: PAYMENT_STATUS.RELEASED, paymentMethod: PAYMENT_METHODS.ESCROW,
    subtotal: 3600, deliveryFee: 300, totalAmount: 3900,
    deliveryAddress: { line1: '8A, Hill Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400050' },
    createdAt: '2026-08-28T09:30:00Z',
    timeline: [
      { status: ORDER_STATUS.PENDING, at: '2026-08-28T09:30:00Z' },
      { status: ORDER_STATUS.CONFIRMED, at: '2026-08-28T16:00:00Z' },
      { status: ORDER_STATUS.PROCESSING, at: '2026-08-29T08:00:00Z' },
      { status: ORDER_STATUS.READY_FOR_SHIPMENT, at: '2026-08-30T12:00:00Z' },
      { status: ORDER_STATUS.IN_TRANSIT, at: '2026-08-31T06:30:00Z' },
    ],
  },
  {
    id: 'o3', orderNumber: 'AGL-2026-0003', consumerId: 'c1', consumerName: 'Meera Sharma',
    producerId: 'p1', producerName: 'Harpreet Singh',
    items: [
      { productId: 'pr5', productName: 'Organic Wheat Flour (Atta)', quantity: 50, unit: 'kg', pricePerUnit: 62, total: 3100 },
      { productId: 'pr12', productName: 'Yellow Mustard Seeds', quantity: 50, unit: 'kg', pricePerUnit: 84, total: 4200 },
    ],
    status: ORDER_STATUS.PROCESSING, paymentStatus: PAYMENT_STATUS.PENDING, paymentMethod: PAYMENT_METHODS.UPI,
    subtotal: 7300, deliveryFee: 0, totalAmount: 7300,
    deliveryAddress: { line1: '12, Green Park', city: 'Delhi', state: 'Delhi', pincode: '110016' },
    createdAt: '2026-09-05T08:00:00Z',
    timeline: [
      { status: ORDER_STATUS.PENDING, at: '2026-09-05T08:00:00Z' },
      { status: ORDER_STATUS.CONFIRMED, at: '2026-09-05T13:00:00Z' },
      { status: ORDER_STATUS.PROCESSING, at: '2026-09-06T10:00:00Z' },
    ],
  },
  {
    id: 'o4', orderNumber: 'AGL-2026-0004', consumerId: 'c2', consumerName: 'Amit Patel',
    producerId: 'p3', producerName: 'Lakshmi Reddy',
    items: [
      { productId: 'pr9', productName: 'Organic Turmeric Powder', quantity: 10, unit: 'kg', pricePerUnit: 380, total: 3800 },
      { productId: 'pr11', productName: 'Fresh Tomatoes (Cherry)', quantity: 5, unit: 'kg', pricePerUnit: 58, total: 290 },
    ],
    status: ORDER_STATUS.PENDING, paymentStatus: PAYMENT_STATUS.PENDING, paymentMethod: PAYMENT_METHODS.UPI,
    subtotal: 4090, deliveryFee: 150, totalAmount: 4240,
    deliveryAddress: { line1: '8A, Hill Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400050' },
    createdAt: '2026-09-10T11:00:00Z',
    timeline: [
      { status: ORDER_STATUS.PENDING, at: '2026-09-10T11:00:00Z' },
    ],
  },
  {
    id: 'o5', orderNumber: 'AGL-2026-0005', consumerId: 'c1', consumerName: 'Meera Sharma',
    producerId: 'p2', producerName: 'Ramesh Kumar',
    items: [
      { productId: 'pr4', productName: 'Fresh Potatoes', quantity: 200, unit: 'kg', pricePerUnit: 28, total: 5600 },
    ],
    status: ORDER_STATUS.CONFIRMED, paymentStatus: PAYMENT_STATUS.PROCESSING, paymentMethod: PAYMENT_METHODS.UPI,
    subtotal: 5600, deliveryFee: 400, totalAmount: 6000,
    deliveryAddress: { line1: '12, Green Park', city: 'Delhi', state: 'Delhi', pincode: '110016' },
    createdAt: '2026-09-11T09:00:00Z',
    timeline: [
      { status: ORDER_STATUS.PENDING, at: '2026-09-11T09:00:00Z' },
      { status: ORDER_STATUS.CONFIRMED, at: '2026-09-11T15:40:00Z' },
    ],
  },
];

export const shipments = [
  {
    id: 's1', shipmentNumber: 'SH-2026-001', orderId: 'o2',
    vehicle: { id: 'v1', type: 'Refrigerated truck', plate: 'MH 12 AB 5621', driverName: 'Suresh Yadav', driverPhone: '9922100110' },
    status: ORDER_STATUS.IN_TRANSIT,
    eta: '2026-09-13T18:00:00Z', etd: '2026-08-31T06:30:00Z',
    currentLocation: { lat: 20.49, lng: 73.78, note: 'Crossing Nashik bypass' },
    route: [
      { lat: 18.52, lng: 73.85, name: 'Origin — Baramati hub' },
      { lat: 19.21, lng: 73.16, name: 'Nashik checkpoint' },
      { lat: 19.88, lng: 72.83, name: 'Thane entry' },
      { lat: 19.06, lng: 72.83, name: 'Destination — Mumbai, Hill Road' },
    ],
    charge: 300,
  },
  {
    id: 's2', shipmentNumber: 'SH-2026-002', orderId: 'o5',
    vehicle: { id: 'v2', type: 'Truck', plate: 'UP 78 CD 1098', driverName: 'Dinesh Prajapati', driverPhone: '9775122334' },
    status: ORDER_STATUS.READY_FOR_SHIPMENT,
    eta: '2026-09-14T09:00:00Z', etd: null,
    currentLocation: { lat: 26.45, lng: 80.33, note: 'At producer farm, loading' },
    route: [
      { lat: 26.45, lng: 80.33, name: 'Origin — Bhitauli village' },
      { lat: 27.18, lng: 78.02, name: 'Agra bypass' },
      { lat: 28.56, lng: 77.2, name: 'Destination — Delhi, Green Park' },
    ],
    charge: 400,
  },
];

export const payments = [
  {
    id: 'pay1', paymentId: 'PAY-2026-0001', orderId: 'o1', orderNumber: 'AGL-2026-0001',
    consumerId: 'c1', producerId: 'p4', amount: 5000, method: PAYMENT_METHODS.UPI,
    status: PAYMENT_STATUS.COMPLETED, createdAt: '2026-08-01T10:05:00Z',
  },
  {
    id: 'pay2', paymentId: 'PAY-2026-0002', orderId: 'o2', orderNumber: 'AGL-2026-0002',
    consumerId: 'c2', producerId: 'p5', amount: 3900, method: PAYMENT_METHODS.ESCROW,
    status: PAYMENT_STATUS.RELEASED, createdAt: '2026-08-28T09:35:00Z',
  },
  {
    id: 'pay3', paymentId: 'PAY-2026-0003', orderId: 'o3', orderNumber: 'AGL-2026-0003',
    consumerId: 'c1', producerId: 'p1', amount: 7300, method: PAYMENT_METHODS.UPI,
    status: PAYMENT_STATUS.PENDING, createdAt: null,
  },
  {
    id: 'pay4', paymentId: 'PAY-2026-0004', orderId: 'o5', orderNumber: 'AGL-2026-0005',
    consumerId: 'c1', producerId: 'p2', amount: 6000, method: PAYMENT_METHODS.UPI,
    status: PAYMENT_STATUS.PROCESSING, createdAt: '2026-09-11T09:05:00Z',
  },
];

const priceHistory = {
  pr1: series(140, { drift: 0.4, volatility: 0.03, count: 90, startOffset: 30 }),
  pr6: series(32, { drift: 0.6, volatility: 0.12, count: 60, startOffset: 30 }),
  pr4: series(26, { drift: 0.2, volatility: 0.05, count: 90, startOffset: 30 }),
  pr9: series(372, { drift: 0.3, volatility: 0.04, count: 90, startOffset: 30 }),
  pr7: series(86, { drift: 0.5, volatility: 0.08, count: 90, startOffset: 30 }),
};

export const priceForecasts = Object.fromEntries(
  Object.entries(priceHistory).map(([productId, history]) => [
    productId,
    { productId, history, forecast: forecastFrom(history) },
  ])
);

export const demandForecasts = [
  {
    id: 'd1', productId: 'pr1', district: 'Ludhiana',
    history: series(1100, { drift: 0.8, volatility: 0.2, count: 60, startOffset: 30 }),
    forecast: forecastFrom(series(1100, { drift: 0.8, volatility: 0.2, count: 60, startOffset: 30 }), { months: 6 }),
  },
  {
    id: 'd2', productId: 'pr6', district: 'Pune',
    history: series(2400, { drift: -0.3, volatility: 0.25, count: 60, startOffset: 30 }),
    forecast: forecastFrom(series(2400, { drift: -0.3, volatility: 0.25, count: 60, startOffset: 30 }), { months: 6 }),
  },
  {
    id: 'd3', productId: 'pr4', district: 'Kanpur',
    history: series(4800, { drift: 0.9, volatility: 0.15, count: 60, startOffset: 30 }),
    forecast: forecastFrom(series(4800, { drift: 0.9, volatility: 0.15, count: 60, startOffset: 30 }), { months: 6 }),
  },
  {
    id: 'd4', productId: 'pr9', district: 'Bengaluru Rural',
    history: series(240, { drift: 1.1, volatility: 0.18, count: 60, startOffset: 30 }),
    forecast: forecastFrom(series(240, { drift: 1.1, volatility: 0.18, count: 60, startOffset: 30 }), { months: 6 }),
  },
];

export const vehicles = [
  { id: 'v1', type: 'Refrigerated truck', plate: 'MH 12 AB 5621', driverName: 'Suresh Yadav', driverPhone: '9922100110', status: 'ASSIGNED' },
  { id: 'v2', type: 'Truck', plate: 'UP 78 CD 1098', driverName: 'Dinesh Prajapati', driverPhone: '9775122334', status: 'ASSIGNED' },
  { id: 'v3', type: 'Pickup', plate: 'PN 45 EF 2201', driverName: 'Mahesh Kokane', driverPhone: '9833111999', status: 'AVAILABLE' },
  { id: 'v4', type: 'Refrigerated truck', plate: 'AP 09 GH 7733', driverName: 'Venkatesh Rao', driverPhone: '9611887777', status: 'MAINTENANCE' },
];

export const latLng = LAT_LNG;

export const chatbotKnowledge = [
  // ---- About the platform ----
  { en: { q: 'What is Agrolink?', a: 'Agrolink is a farm-to-market platform that connects farmers and FPOs directly with buyers — removing intermediaries so farmers earn more and buyers pay fair market prices. It is available in five languages (English, Hindi, Punjabi, Marathi and Tamil) and covers produce from listing and pricing through to delivery and payment.' }, hi: { q: 'अग्रोलिंक क्या है?', a: 'अग्रोलिंक एक फार्म-टू-मार्केट प्लेटफॉर्म है जो किसानों और FPOs को सीधे खरीदारों से जोड़ता है — बिचौलियों को हटाकर, ताकि किसान ज़्यादा कमाएं और खरीदार उचित दाम दें। यह पांच भाषाओं में उपलब्ध है।' }, pa: { q: 'ਅਗਰੋਲਿੰਕ ਕੀ ਹੈ?', a: 'ਅਗਰੋਲਿੰਕ ਇੱਕ ਫਾਰਮ-ਟੂ-ਮਾਰਕੀਟ ਪਲੇਟਫਾਰਮ ਹੈ ਜੋ ਕਿਸਾਨਾਂ ਅਤੇ FPOs ਨੂੰ ਸਿੱਧੇ ਖਰੀਦਦਾਰਾਂ ਨਾਲ ਜੋੜਦਾ ਹੈ — ਵਿਚੋਲੇ ਹਟਾ ਕੇ। ਪੰਜ ਭਾਸ਼ਾਵਾਂ ਵਿੱਚ ਉਪਲਬਧ ਹੈ।' }, mr: { q: 'अग्रोलिंक म्हणजे काय?', a: 'अग्रोलिंक हे फार्म-टू-मार्केट प्लॅटफॉर्म आहे जे शेतकरी आणि FPOs थेट खरेदीदारांशी जोडते — मध्यस्थ काढून. पाच भाषांमध्ये उपलब्ध.' }, ta: { q: 'அக்ரோலிங்க் என்றால் என்ன?', a: 'அக்ரோலிங்க் ஒரு பண்ணை-முதல்-சந்தை தளம்; விவசாயிகளையும் FPO களையும் நேரடியாக வாங்குபவர்களுடன் இணைக்கிறது. 5 மொழிகளில்.' } },
  { en: { q: 'Who is Agrolink for?', a: 'Agrolink serves everyone in the value chain: farmers and FPOs selling produce, individual and bulk buyers, traders, cooperatives and logistics partners. Each role has its own dashboard with the tools it needs.' }, hi: { q: 'अग्रोलिंक किसके लिए है?', a: 'उपज बेचने वाले किसान और FPO, व्यक्तिगत और थोक खरीदार, व्यापारी, सहकारी समितियां और लॉजिस्टिक्स भागीदार। हर भूमिका को अपना डैशबोर्ड मिलता है।' }, pa: { q: 'ਅਗਰੋਲਿੰਕ ਕਿਸ ਲਈ ਹੈ?', a: 'ਉਪਜ ਵੇਚਣ ਵਾਲੇ ਕਿਸਾਨ ਅਤੇ FPO, ਖਰੀਦਦਾਰ, ਵਪਾਰੀ, ਸਹਿਕਾਰੀ ਅਤੇ ਲੌਜਿਸਟਿਕਸ ਭਾਈਵਾਲਾਂ ਲਈ — ਹਰ ਭੂਮਿਕਾ ਨੂੰ ਆਪਣਾ ਡੈਸ਼ਬੋਰਡ।' }, mr: { q: 'अग्रोलिंक कोणासाठी आहे?', a: 'उपज विकणारे शेतकरी आणि FPO, खरेदीदार, व्यापारी, सहकारी आणि लॉजिस्टिक्स भागीदार; प्रत्येकाला स्वतःचे डॅशबोर्ड.' }, ta: { q: 'அக்ரோலிங்க் யாருக்கு?', a: 'விவசாயிகள், FPOகள், வாங்குபவர்கள், வணிகர்கள், கூட்டுறவு & தளவாடம்; தனி டாஷ்போர்டு.' } },
  { en: { q: 'Is Agrolink free to use?', a: 'Posting produce, browsing the marketplace and using the price and forecast tools are completely free — there are no listing fees for farmers or FPOs. Transaction-linked fees such as escrow or logistics apply only when a service is actually used.' }, hi: { q: 'क्या अग्रोलिंक मुफ्त है?', a: 'हां — उपज पोस्ट करना, मार्केटप्लेस देखना और दाम/पूर्वानुमान टूल्स पूरी तरह मुफ्त हैं; किसानों या FPO पर कोई लिस्टिंग फीस नहीं। एस्क्रो या लॉजिस्टिक्स जैसी सेवा के इस्तेमाल पर ही फीस लगती है।' }, pa: { q: 'ਕੀ ਅਗਰੋਲਿੰਕ ਮੁਫਤ ਹੈ?', a: 'ਹਾਂ — ਉਪਜ ਪੋਸਟ ਕਰਨਾ, ਬਾਜ਼ਾਰ ਅਤੇ ਕੀਮਤ/ਅਨੁਮਾਨ ਟੂਲ ਪੂਰੀ ਤਰ੍ਹਾਂ ਮੁਫਤ। ਸਿਰਫ ਐਸਕਰੋ ਜਾਂ ਲੌਜਿਸਟਿਕਸ ਵਰਤਣ ਸਮੇਂ ਹੀ ਫੀਸ ਲੱਗਦੀ ਹੈ।' }, mr: { q: 'अग्रोलिंक मोफत आहे का?', a: 'हो — उपज पोस्ट करणे, बाजार आणि दर/अंदाज साधने पूर्णपणे मोफत; लिस्टिंग शुल्क नाही. एस्क्रो किंवा लॉजिस्टिक्स वापरल्यावरच शुल्क.' }, ta: { q: 'அக்ரோலிங்க் இலவசமா?', a: 'ஆம் — பதிவு, சந்தை மற்றும் விலை/கணிப்பு கருவிகள் இலவசம். எஸ்க்ரோ/தளவாடம் மட்டும் கட்டணம்.' } },
  { en: { q: 'How does Agrolink remove middlemen?', a: 'Buyers connect to producers directly through the marketplace. Orders, tracking and payments happen inside the platform, so produce moves farm-to-farm-gate without commission agents inflating the price.' }, hi: { q: 'अग्रोलिंक बिचौलिये कैसे हटाता है?', a: 'खरीदार मार्केटप्लेस के जरिए सीधे उत्पादकों से जुड़ते हैं। ऑर्डर, ट्रैकिंग और भुगतान प्लेटफॉर्म के भीतर ही होते हैं — कमीशन एजेंट के बिना।' }, pa: { q: 'ਅਗਰੋਲਿੰਕ ਵਿਚੋਲੇ ਕਿਵੇਂ ਹਟਾਉਂਦਾ ਹੈ?', a: 'ਖਰੀਦਦਾਰ ਮਾਰਕੀਟ ਰਾਹੀਂ ਸਿੱਧੇ ਉਤਪਾਦਕਾਂ ਨਾਲ ਜੁੜਦੇ ਹਨ; ਆਰਡਰ, ਟ੍ਰੈਕਿੰਗ ਅਤੇ ਭੁਗਤਾਨ ਪਲੇਟਫਾਰਮ ਵਿੱਚ ਹੀ ਹੁੰਦੇ ਹਨ।' }, mr: { q: 'अग्रोलिंक मध्यस्थ कसे काढते?', a: 'खरेदीदार मार्केटप्लेसमधून थेट उत्पादकांशी जोडले जातात; ऑर्डर, ट्रॅकिंग आणि पेमेंट प्लॅटफॉर्ममध्येच.' }, ta: { q: 'அக்ரோலிங்க் இடைத்தரகர்களை எப்படி நீக்குகிறது?', a: 'வாங்குபவர்கள் நேரடியாக உற்பத்தியாளருடன் இணைவர்; ஆர்டர், கண்காணிப்பு, கட்டணம் தளத்திலேயே.' } },
  { en: { q: 'Which languages does Agrolink support?', a: 'Agrolink is available in five languages: English, Hindi (हिंदी), Punjabi (ਪੰਜਾਬੀ), Marathi (मराठी) and Tamil (தமிழ்). Use the language switcher in the header to change language instantly.' }, hi: { q: 'अग्रोलिंक कौन सी भाषाओं में उपलब्ध है?', a: 'पांच भाषाएं: अंग्रेजी, हिंदी, पंजाबी, मराठी और तमिल। हेडर में भाषा बदलने वाले बटन से तुरंत बदलें।' }, pa: { q: 'ਅਗਰੋਲਿੰਕ ਕਿਹੜੀਆਂ ਭਾਸ਼ਾਵਾਂ ਵਿੱਚ ਉਪਲਬਧ ਹੈ?', a: 'ਪੰਜ ਭਾਸ਼ਾਵਾਂ: ਅੰਗਰੇਜ਼ੀ, ਹਿੰਦੀ, ਪੰਜਾਬੀ, ਮਰਾਠੀ ਅਤੇ ਤਮਿਲ — ਹੈਡਰ ਤੋਂ ਬਦਲੋ।' }, mr: { q: 'अग्रोलिंक कोणत्या भाषांमध्ये उपलब्ध आहे?', a: 'पाच भाषा: इंग्रजी, हिंदी, पंजाबी, मराठी आणि तमिळ — हेडरमधून बदला.' }, ta: { q: 'அக்ரோலிங்க் எந்த மொழிகளில் உள்ளது?', a: '5 மொழிகள்: ஆங்கிலம், ஹிந்தி, பஞ்சாபி, மராத்தி, தமிழ் — தலைப்புப் பட்டியில் மாற்றலாம்.' } },

  // ---- Selling (farmer + FPO) ----
  { en: { q: 'How do I sell my produce?', a: 'Register as a Farmer or FPO, complete your producer profile, then use "Add Product" to list your produce with category, variety, quantity, unit and your asking price. Buyers can find you in the marketplace, and you confirm each incoming order from your dashboard.' }, hi: { q: 'मैं अपनी उपज कैसे बेचूं?', a: 'किसान या FPO के रूप में रजिस्टर करें, प्रोड्यूसर प्रोफाइल पूरी करें, फिर "Add Product" से उपज को श्रेणी, किस्म, मात्रा, इकाई और कीमत के साथ लिस्ट करें। खरीदार आपको मार्केटप्लेस में पाएंगे, और आप डैशबोर्ड से हर ऑर्डर कन्फर्म करते हैं।' }, pa: { q: 'ਮੈਂ ਆਪਣੀ ਉਪਜ ਕਿਵੇਂ ਵੇਚਾਂ?', a: 'ਕਿਸਾਨ ਜਾਂ FPO ਵਜੋਂ ਰਜਿਸਟਰ ਕਰੋ, ਪ੍ਰੋਫਾਈਲ ਪੂਰੀ ਕਰੋ, ਫਿਰ Add Product ਨਾਲ ਉਪਜ ਲਿਸਟ ਕਰੋ। ਖਰੀਦਦਾਰ ਤੁਹਾਨੂੰ ਮਾਰਕੀਟ ਵਿੱਚ ਲੱਭਦੇ ਹਨ, ਆਰਡਰ ਡੈਸ਼ਬੋਰਡ ਤੋਂ ਪੱਕੇ ਕਰੋ।' }, mr: { q: 'माझी उपज कशी विकू?', a: 'शेतकरी किंवा FPO म्हणून नोंदणी करा, प्रोफाइल पूर्ण करा, नंतर Add Product ने उपज लिस्ट करा. खरेदीदार तुम्हाला मार्केटप्लेसमध्ये शोधतात; ऑर्डर डॅशबोर्डवरून कन्फर्म करा.' }, ta: { q: 'என் பயிரை எப்படி விற்பது?', a: 'விவசாயி/FPO ஆக பதிவு செய்து, Add Product-ல் பயிரைப் பதிவிடவும். வாங்குபவர்கள் சந்தையில் உங்களைக் காண்பார்கள்; ஆர்டர்களை டாஷ்போர்டில் உறுதி செய்யவும்.' } },
  { en: { q: 'How do I add a product on the farmer dashboard?', a: 'From your farmer dashboard open "My Products" and press "Add Product". Fill in the name, category (Grains & Pulses, Oilseeds, Spices, Vegetables, Fruits or Dairy), variety, stock quantity, unit (kg or quintal), minimum order quantity and price per unit. A quality grade can be set as Premium, A, B or Standard.' }, hi: { q: 'फार्मर डैशबोर्ड पर उत्पाद कैसे जोड़ें?', a: 'अपने डैशबोर्ड से "My Products" खोलें और "Add Product" दबाएं। नाम, श्रेणी (अनाज व दालें, तिलहन, मसाले, सब्जियां, फल या डेयरी), किस्म, स्टॉक मात्रा, इकाई (किलो या क्विंटल), न्यूनतम ऑर्डर और प्रति इकाई कीमत भरें। ग्रेड Premium, A, B या Standard भी सेट कर सकते हैं।' }, pa: { q: 'ਕਿਸਾਨ ਡੈਸ਼ਬੋਰਡ ਵਿੱਚ ਉਤਪਾਦ ਕਿਵੇਂ ਜੋੜੀਏ?', a: 'My Products ਖੋਲ੍ਹੋ ਅਤੇ Add Product ਦਬਾਓ। ਨਾਮ, ਸ਼੍ਰੇਣੀ, ਕਿਸਮ, ਮਾਤਰਾ, ਇਕਾਈ, ਘੱਟੋ-ਘੱਟ ਆਰਡਰ ਅਤੇ ਕੀਮਤ ਭਰੋ।' }, mr: { q: 'शेतकरी डॅशबोर्डवर उत्पादन कसे जोडायचे?', a: 'My Products उघडा आणि Add Product दाबा. नाव, श्रेणी, जात, स्टॉक, एकक, किमान ऑर्डर आणि दर भरा.' }, ta: { q: 'விவசாயி டாஷ்போர்டில் பொருளை எப்படி சேர்க்க?', a: 'My Products-ல் Add Product. பெயர், வகை, ரகம், அளவு, அலகு & விலையை நிரப்பவும்.' } },
  { en: { q: 'Which products can be sold on Agrolink?', a: 'Six categories are supported: Grains & Pulses (like basmati rice and sharbati wheat), Oilseeds (mustard, groundnut), Spices (salem turmeric), Vegetables (onions, potatoes, tomatoes), Fruits (grapes), and Dairy (bulk milk).' }, hi: { q: 'अग्रोलिंक पर कौन से उत्पाद बेचे जा सकते हैं?', a: 'छह श्रेणियां: अनाज और दालें (बासमती चावल, शरबती गेहूं), तिलहन (सरसों, मूंगफली), मसाले (सलेम हल्दी), सब्जियां (प्याज, आलू, टमाटर), फल (अंगूर) और डेयरी (थोक दूध)।' }, pa: { q: 'ਅਗਰੋਲਿੰਕ ਵਿੱਚ ਕਿਹੜੇ ਉਤਪਾਦ ਵੇਚੇ ਜਾ ਸਕਦੇ ਹਨ?', a: 'ਛੇ ਸ਼੍ਰੇਣੀਆਂ ਸਹਿਯੋਗ ਹਨ: ਅਨਾਜ ਅਤੇ ਦਾਲਾਂ, ਤਿਲ੍ਹਣ, ਮਸਾਲੇ, ਸਬਜ਼ੀਆਂ, ਫਲ ਅਤੇ ਡੇਅਰੀ।' }, mr: { q: 'अग्रोलिंगवर कोणती उत्पादने विकता येतात?', a: 'सहा श्रेणी: धान्ये व कडधान्ये, तेलबिया, मसाले, भाज्या, फळे आणि डेअरी.' }, ta: { q: 'அக்ரோலிங்கில் என்ன பொருட்கள் விற்கலாம்?', a: '6 வகைகள்: தானியங்கள், எண்ணெய் விதைகள், மசாலா, காய்கறிகள், பழங்கள், பால்.' } },
  { en: { q: 'How do I confirm an incoming order as a farmer?', a: 'Open "Incoming Orders" on your dashboard and select an order to review the item, quantity and buyer. Confirm it to accept, and the status moves to processing; your payment is released after the buyer confirms delivery.' }, hi: { q: 'फार्मर के रूप में आने वाला ऑर्डर कैसे कन्फर्म करें?', a: 'डैशबोर्ड पर "Incoming Orders" खोलें, आइटम, मात्रा और खरीदार देखें, फिर कन्फर्म करें। खरीदार द्वारा डिलीवरी कन्फर्म होने पर ही पेमेंट रिलीज़ होता है।' }, pa: { q: 'ਕਿਸਾਨ ਵਜੋਂ ਆਉਂਦਾ ਆਰਡਰ ਕਿਵੇਂ ਪੱਕਾ ਕਰੀਏ?', a: 'Incoming Orders ਖੋਲ੍ਹੋ, ਆਈਟਮ ਅਤੇ ਖਰੀਦਦਾਰ ਦੇਖੋ, ਪੱਕਾ ਕਰੋ। ਡਿਲੀਵਰੀ ਕਨਫਰਮ ਹੋਣ ਤੋਂ ਬਾਅਦ ਭੁਗਤਾਨ।' }, mr: { q: 'शेतकरी म्हणून येणारा ऑर्डर कसा कन्फर्म करू?', a: 'Incoming Orders उघडा, आयटम आणि खरेदीदार बघा, कन्फर्म करा. डिलिव्हरी कन्फर्म झाल्यावर पेमेंट.' }, ta: { q: 'விவசாயியாக வரும் ஆர்டரை உறுதி செய்வது எப்படி?', a: 'Incoming Orders-ல் ஆர்டரை உறுதி செய்யவும்; வாங்குபவர் டெலிவரியை உறுதி செய்ததும் பணம்.' } },
  { en: { q: 'How do FPOs use Agrolink?', a: 'FPOs get extra tools: pooling procurement, buying produce from farmers or other FPOs, selling pooled stock in bulk to buyers, managing inventory, confirming incoming and outgoing orders, and running forward contracts to hedge prices before sowing.' }, hi: { q: 'FPOs अग्रोलिंक का उपयोग कैसे करते हैं?', a: 'FPOs को अतिरिक्त टूल्स मिलते हैं: पूलिंग, किसानों या अन्य FPOs से खरीद, थोक बिक्री, इन्वेंट्री प्रबंधन और बुवाई से पहले कीमत हेज करने के लिए फॉरवर्ड कॉन्ट्रैक्ट्स।' }, pa: { q: 'FPOs ਅਗਰੋਲਿੰਕ ਦੀ ਵਰਤੋਂ ਕਿਵੇਂ ਕਰਦੇ ਹਨ?', a: 'FPOs ਨੂੰ ਪੂਲਿੰਗ, ਖਰੀਦ, ਥੋਕ ਵਿਕਰੀ, ਵਸਤੂ ਪ੍ਰਬੰਧਨ ਅਤੇ ਫਾਰਵਰਡ ਕੰਟਰੈਕਟ ਵਰਗੇ ਵਾਧੂ ਸਾਧਨ ਮਿਲਦੇ ਹਨ।' }, mr: { q: 'FPOs अग्रोलिंकचा उपयोग कसा करतात?', a: 'पूलिंग, खरेदी, घाऊक विक्री, स्टॉक व्यवस्थापन आणि फॉरवर्ड करार असे अतिरिक्त साधन मिळतात.' }, ta: { q: 'FPOகள் அக்ரோலிங்கை எப்படி பயன்படுத்துகின்றன?', a: 'திரட்டல், வாங்குதல், மொத்த விற்பனை, இருப்பு & முன்கூட்டிய ஒப்பந்தங்கள் போன்ற கருவிகள்.' } },
  { en: { q: 'How does FPO pooling work?', a: 'An FPO aggregates produce from many small holdings into one batch, then sells the pooled stock as a single larger lot. This lets members command better bulk prices and negotiate forward contracts. A single-season FPO can pool over 40 lakh quintals this way.' }, hi: { q: 'FPO पूलिंग कैसे काम करती है?', a: 'FPO कई छोटे खेतों की उपज को एक बैच में इकट्ठा करता है, फिर उसे एक बड़े लॉट के रूप में बेचता है। इससे सदस्यों को बेहतर थोक दाम और फॉरवर्ड कॉन्ट्रैक्ट्स मिलते हैं।' }, pa: { q: 'FPO ਪੂਲਿੰਗ ਕਿਵੇਂ ਕੰਮ ਕਰਦੀ ਹੈ?', a: 'FPO ਛੋਟੇ ਖੇਤਾਂ ਦੀ ਉਪਜ ਨੂੰ ਇੱਕ ਬੈਚ ਵਿੱਚ ਜੋੜਦਾ ਹੈ ਅਤੇ ਥੋਕ ਵਿੱਚ ਵੇਚਦਾ ਹੈ। ਇੱਕ ਸੀਜ਼ਨ ਵਿੱਚ 40 ਲੱਖ ਕੁਇੰਟਲ ਤੱਕ ਪੂਲ ਹੋ ਸਕਦਾ ਹੈ।' }, mr: { q: 'FPO पूलिंग कशी काम करते?', a: 'FPO लहान शेतांची उपज एकत्र करून एका मोठ्या लॉटमध्ये विकते. सदस्यांना चांगले घाऊक दर मिळतात.' }, ta: { q: 'FPO திரட்டல் எப்படி வேலை செய்கிறது?', a: 'FPO சிறு நிலங்களின் பயிரை ஒன்று திரட்டி ஒரு பெரிய சீட்டாக விற்கிறது. பருவம் ஒன்றில் 40 லட்ச குவிண்டால் வரை.' } },
  { en: { q: 'What are quality grades?', a: 'Producers label batches with a grade — Premium, A, B or Standard — so buyers know the sorting and quality level before ordering. Verified producers also accumulate a star rating from buyer feedback.' }, hi: { q: 'क्वालिटी ग्रेड क्या हैं?', a: 'उत्पादक बैच को Premium, A, B या Standard लेबल करते हैं ताकि खरीदार ऑर्डर से पहले गुणवत्ता जानें। वेरिफाइड उत्पादकों को खरीदारों की प्रतिक्रिया से स्टार रेटिंग भी मिलती है।' }, pa: { q: 'ਕੁਆਲਿਟੀ ਗ੍ਰੇਡ ਕੀ ਹਨ?', a: 'ਉਤਪਾਦਕ ਬੈਚ ਨੂੰ Premium, A, B ਜਾਂ Standard ਲੇਬਲ ਕਰਦੇ ਹਨ। ਵੇਰੀਫਾਈਡ ਉਤਪਾਦਕਾਂ ਨੂੰ ਸਟਾਰ ਰੇਟਿੰਗ ਮਿਲਦੀ ਹੈ।' }, mr: { q: 'क्वालिटी ग्रेड म्हणजे काय?', a: 'उत्पादक बॅचला Premium, A, B किंवा Standard लेबल करतात. व्हेरिफाइड उत्पादकांना स्टार रेटिंग मिळते.' }, ta: { q: 'தர தரங்கள் என்றால் என்ன?', a: 'Premium, A, B, Standard என பேட்சுகள் லேபிள்; வாங்குபவர் மதிப்பீட்டில் நட்சத்திரங்களும்.' } },
  { en: { q: 'What is verified producer status?', a: 'Producers who complete profile verification (identity and farm/business details) show a verified badge, and FPO outlets are labelled separately. Buyers trust verified listings and ratings when choosing whom to order from.' }, hi: { q: 'वेरिफाइड उत्पादक स्थिति क्या है?', a: 'जो उत्पादक पहचान और खेत/व्यवसाय सत्यापन पूरा करते हैं उन्हें verified बैज मिलता है। खरीदार वेरिफाइड लिस्टिंग और रेटिंग पर भरोसा करते हैं।' }, pa: { q: 'ਵੇਰੀਫਾਈਡ ਉਤਪਾਦਕ ਸਥਿਤੀ ਕੀ ਹੈ?', a: 'ਪਛਾਣ ਅਤੇ ਕਾਰੋਬਾਰ ਸਿੱਧ ਹੋਣ ਤੋਂ ਬਾਅਦ ਉਤਪਾਦਕ ਨੂੰ ਵੇਰੀਫਾਈਡ ਬੈਜ ਮਿਲਦਾ ਹੈ।' }, mr: { q: 'व्हेरिफाइड उत्पादक स्थिती म्हणजे काय?', a: 'ओळख व व्यवसाय पडताळणी पूर्ण झाल्यावर उत्पादकांना व्हेरिफाइड बॅज मिळतो.' }, ta: { q: 'சரிபார்க்கப்பட்ட உற்பத்தியாளர் என்பது என்ன?', a: 'அடையாளம் & வணிக சரிபார்ப்பு முடிந்தவர்களுக்கு சரிபார்க்கப்பட்ட பேட்ஜ்.' } },

  // ---- Buying ----
  { en: { q: 'How do I buy fresh produce?', a: 'Open the Marketplace, search for a crop or filter by category, price range or source (Farmer or FPO). Open a product to see photos, grades and the producer, add the quantity you want to the cart, then check out with your delivery address and a payment method.' }, hi: { q: 'मैं ताजी उपज कैसे खरीदूं?', a: 'मार्केटप्लेस खोलें, फसल खोजें या श्रेणी, कीमत या स्रोत के अनुसार फिल्टर करें। उत्पाद खोलकर तस्वीरें और ग्रेड देखें, मात्रा कार्ट में जोड़ें, फिर डिलीवरी पता और भुगतान तरीके से चेकआउट करें।' }, pa: { q: 'ਮੈਂ ਤਾਜ਼ੀ ਉਪਜ ਕਿਵੇਂ ਖਰੀਦਾਂ?', a: 'ਮਾਰਕੀਟ ਖੋਲ੍ਹੋ, ਫ਼ਸਲ ਲੱਭੋ ਜਾਂ ਫਿਲਟਰ ਕਰੋ, ਉਤਪਾਦ ਖੋਲ੍ਹੋ, ਮਾਤਰਾ ਕਾਰਟ ਵਿੱਚ ਪਾਓ ਅਤੇ ਚੈੱਕਆਉਟ ਕਰੋ।' }, mr: { q: 'मी ताजी उपज कशी खरेदी करू?', a: 'मार्केटप्लेस उघडा, पीक शोधा किंवा फिल्टर करा, उत्पादन उघडून कार्टमध्ये घाला आणि चेकआउट करा.' }, ta: { q: 'புதிய பயிரை எப்படி வாங்குவது?', a: 'சந்தையில் தேடி/வடிகட்டி, பொருளைத் திறந்து கார்ட்டில் போட்டு, முகவரி & கட்டணமுறையுடன் செக்-அவுட்.' } },
  { en: { q: 'How do I search for products?', a: 'Use the search bar in the navbar or the Marketplace page — try a crop like "basmati", "turmeric" or "onion". Combine it with filters for category, price range, producer type and sorting by price, rating or newest.' }, hi: { q: 'उत्पाद कैसे खोजूं?', a: 'नेवबार या मार्केटप्लेस के सर्च बार का उपयोग करें — "बासमती", "हल्दी" या "प्याज" जैसी फसल लिखें। श्रेणी, कीमत, उत्पादक प्रकार और सॉर्टिंग के फिल्टर भी लगाएं।' }, pa: { q: 'ਉਤਪਾਦ ਕਿਵੇਂ ਲੱਭਾਂ?', a: 'ਨੈਵਬਾਰ ਜਾਂ ਮਾਰਕੀਟ ਦੇ ਸਰਚ ਬਾਰ ਵਿੱਚ ਬਾਸਮਤੀ, ਹਲਦੀ ਜਾਂ ਪਿਆਜ਼ ਲਿਖੋ; ਸ਼੍ਰੇਣੀ, ਭਾਅ ਅਤੇ ਪ੍ਰਕਾਰ ਦੇ ਫਿਲਟਰ ਲਗਾਓ।' }, mr: { q: 'उत्पादने कशी शोधू?', a: 'सर्च बारमध्ये पीक लिहा (उदा. बासमती, हळद, कांदा); श्रेणी, दर व प्रकार फिल्टर करा.' }, ta: { q: 'பொருட்களை எப்படி தேடுவது?', a: 'தேடல் பட்டியில் பயிர் பெயர் எழுதி, வகை/விலை/ஆதார வடிகட்டிகள் சேர்க்கவும்.' } },
  { en: { q: 'How does bulk buying work?', a: 'Product cards show a minimum order quantity set by the producer. For larger or custom requirements, use "Request Quote" on a product page to send a bulk enquiry, or place a cart order for the exact quantity you need.' }, hi: { q: 'थोक खरीद कैसे काम करती है?', a: 'उत्पाद कार्ड पर उत्पादक द्वारा तय न्यूनतम ऑर्डर मात्रा दिखती है। बड़ी या खास मात्रा के लिए product पेज पर "Request Quote" से पूछें, या कार्ट से ऑर्डर करें।' }, pa: { q: 'ਥੋਕ ਖਰੀਦ ਕਿਵੇਂ ਕੰਮ ਕਰਦੀ ਹੈ?', a: 'ਕਾਰਡ ਤੇ ਘੱਟੋ-ਘੱਟ ਆਰਡਰ ਮਾਤਰਾ ਦਿਖਦੀ ਹੈ। ਵੱਡੀ ਮਾਤਰਾ ਲਈ Request Quote ਵਰਤੋ।' }, mr: { q: 'घाऊक खरेदी कशी काम करते?', a: 'कार्डवर किमान ऑर्डर मात्रा दिसते. मोठ्या प्रमाणासाठी Request Quote वापरा.' }, ta: { q: 'மொத்த வாங்குதல் எப்படி?', a: 'குறைந்த ஆர்டர் அளவைக் காட்டும்; பெரிய/தனி தேவைக்கு Request Quote.' } },
  { en: { q: 'How does the cart work?', a: 'Add items from the marketplace with the quantity you want, then open the cart to review prices and totals per producer. From checkout you choose the delivery address and payment method and place the order.' }, hi: { q: 'कार्ट कैसे काम करती है?', a: 'मार्केटप्लेस से मात्रा के साथ आइटम जोड़ें, फिर कार्ट में कीमतें देखें। चेकआउट से डिलीवरी पता और भुगतान तरीका चुनकर ऑर्डर करें।' }, pa: { q: 'ਕਾਰਟ ਕਿਵੇਂ ਕੰਮ ਕਰਦੀ ਹੈ?', a: 'ਮਾਰਕੀਟ ਤੋਂ ਆਈਟਮ ਕਾਰਟ ਵਿੱਚ ਪਾਓ, ਫਿਰ ਚੈੱਕਆਉਟ ਤੋਂ ਪਤਾ ਅਤੇ ਭੁਗਤਾਨ ਵਿਧੀ ਚੁਣੋ।' }, mr: { q: 'कार्ट कशी काम करते?', a: 'आयटम चा गाडीत टाका, नंतर पत्ता व पेमेंट निवडून ऑर्डर करा.' }, ta: { q: 'கார்ட் எப்படி வேலை செய்கிறது?', a: 'பொருட்களை கார்ட்டில் சேர்க்கலாம்; செக்-அவுட்டில் முகவரி & கட்டணமுறை.' } },
  { en: { q: 'How do I track my order?', a: 'Open "My Orders" and pick the order to see its live status — placed, confirmed, in-transit, delivered or completed — plus the assigned truck and route on the delivery tracking page. A delivery confirmation step finalises the order.' }, hi: { q: 'मैं अपना ऑर्डर कैसे ट्रैक करूं?', a: '"My Orders" खोलें और लाइव स्टेटस देखें — प्लेस्ड, कन्फर्म्ड, इन-ट्रांज़िट, डिलीवर्ड या कंप्लीटेड — साथ में वाहन और रूट। डिलीवरी कन्फर्मेशन से ऑर्डर पूरा होता है।' }, pa: { q: 'ਮੈਂ ਆਪਣਾ ਆਰਡਰ ਕਿਵੇਂ ਟ੍ਰੈਕ ਕਰਾਂ?', a: 'My Orders ਖੋਲ੍ਹੋ ਅਤੇ ਸਟੇਟਸ ਦੇਖੋ — ਪਲੇਸਡ, ਕਨਫਰਮ, ਇਨ-ਟ੍ਰਾਂਜਿਟ, ਡਿਲੀਵਰ। ਵਾਹਨ ਅਤੇ ਰੂਟ ਵੀ ਦਿਖਦਾ ਹੈ।' }, mr: { q: 'माझा ऑर्डर कसा ट्रॅक करू?', a: 'My Orders उघडून स्टेटस बघा; वाहन व मार्गही दिसतो.' }, ta: { q: 'ஆர்டரை எப்படி கண்காணிப்பது?', a: 'My Orders-ல் நிலையைப் பார்க்கலாம்; லாரி & வழியும் தெரியும்.' } },
  { en: { q: 'How do I place an order?', a: 'After adding items to the cart, go to checkout, select or enter the delivery address, choose a payment method (UPI, card, net banking or cash on delivery where available) and confirm. You will see the order summary and, if the seller offers it, escrow protection.' }, hi: { q: 'ऑर्डर कैसे दें?', a: 'कार्ट में आइटम जोड़ने के बाद चेकआउट जाएं, डिलीवरी पता चुनें, भुगतान तरीका (UPI, कार्ड, नेट बैंकिंग या COD) चुनें और कन्फर्म करें।' }, pa: { q: 'ਆਰਡਰ ਕਿਵੇਂ ਦੇਵਾਂ?', a: 'ਕਾਰਟ ਤੋਂ ਚੈੱਕਆਉਟ, ਪਤਾ ਚੁਣੋ, ਭੁਗਤਾਨ ਵਿਧੀ ਚੁਣੋ ਅਤੇ ਕਨਫਰਮ ਕਰੋ।' }, mr: { q: 'ऑर्डर कसा द्यावा?', a: 'कार्टमधून चेकआउट करा, पत्ता निवडा, UPI/कार्ड/नेट बँकिंग निवडा आणि कन्फर्म.' }, ta: { q: 'ஆர்டர் எப்படி வைப்பது?', a: 'கார்ட் → செக்-அவுட் → முகவரி & கட்டண முறை → உறுதி.' } },

  // ---- Pricing & forecasts ----
  { en: { q: 'How is pricing done?', a: 'Agrolink suggests fair market prices using forecast models trained on mandi (Agmarknet) data from your district and region. You always set the final price; our AI only recommends what the market is likely to pay.' }, hi: { q: 'दाम कैसे तय होता है?', a: 'अग्रोलिंक आपके जिले और क्षेत्र के मंडी (Agmarknet) डेटा पर आधारित मॉडल से उचित दाम सुझाता है। अंतिम दाम आप खुद तय करते हैं; AI सिर्फ सुझाव देता है।' }, pa: { q: 'ਕੀਮਤ ਕਿਵੇਂ ਤੈਅ ਹੁੰਦੀ ਹੈ?', a: 'ਅਗਰੋਲਿੰਕ ਮੰਡੀ ਡੇਟਾ ਆਧਾਰਿਤ ਮਾਡਲ ਨਾਲ ਕੀਮਤ ਸੁਝਾਉਂਦਾ ਹੈ। ਅੰਤਿਮ ਕੀਮਤ ਤੁਸੀਂ ਖੁਦ ਲਾਉਂਦੇ ਹੋ।' }, mr: { q: 'दर कसा ठरतो?', a: 'अग्रोलिंक तुमच्या जिल्हा आणि क्षेत्राच्या मंडी (Agmarknet) डेटावर आधारित मॉडेल दर सुचवते; अंतिम दर तुम्हीच ठरवता.' }, ta: { q: 'விலை எப்படி நிர்ணயிக்கப்படுகிறது?', a: 'மண்டி (Agmarknet) தரவு மாதிரி பரிந்துரை; இறுதி விலை நீங்களே நிர்ணயிப்பீர்கள்.' } },
  { en: { q: 'What are mandi price trends?', a: 'The Mandi section on the landing page shows live farm-gate and mandi rates ticker, while the Price Forecast tool plots historical daily prices from Agmarknet for any commodity and district, plus a 6-month AI projection.' }, hi: { q: 'मंडी भाव के ट्रेंड क्या हैं?', a: 'लैंडिंग पेज का मंडी सेक्शन लाइव फार्म-गेट और मंडी दर टिकर दिखाता है; Price Forecast टूल किसी भी फसल और जिले के लिए ऐतिहासिक दैनिक दर और 6 महीने का AI अनुमान दिखाता है।' }, pa: { q: 'ਮੰਡੀ ਭਾਅ ਟ੍ਰੈਂਡ ਕੀ ਹਨ?', a: 'ਮੰਡੀ ਸੈਕਸ਼ਨ ਲਾਈਵ ਭਾਅ ਟਿੱਕਰ ਦਿਖਾਉਂਦਾ ਹੈ; Price Forecast ਟੂਲ ਇਤਿਹਾਸਕ ਦਰ ਅਤੇ 6 ਮਹੀਨੇ ਦਾ ਅਨੁਮਾਨ।' }, mr: { q: 'मंडी भाव ट्रेंड काय आहेत?', a: 'मंडी सेक्शन लाइव्ह दर दाखवते; Price Forecast ऐतिहासिक दैनिक दर व 6 महिन्यांचा अंदाज.' }, ta: { q: 'மண்டி விலை போக்குகள் என்றால் என்ன?', a: 'மண்டி பிரிவு லைவ் விலை; Price Forecast-ல் 6 மாத AI கணிப்பு.' } },
  { en: { q: 'How do I see a price forecast?', a: 'Open the "Price Forecast" page, choose the commodity and district, and inspect the historical chart with the 6-month forecast line. Use it before quoting a bulk order or deciding when to sell.' }, hi: { q: 'दाम का पूर्वानुमान कैसे देखें?', a: '"Price Forecast" पेज खोलें, फसल और जिला चुनें, ऐतिहासिक चार्ट और 6 महीने की भविष्यवाणी की रेखा देखें।' }, pa: { q: 'ਕੀਮਤ ਦਾ ਪੂਰਵ-ਅਨੁਮਾਨ ਕਿਵੇਂ ਦੇਖਾਂ?', a: 'Price Forecast ਖੋਲ੍ਹੋ, ਫ਼ਸਲ ਅਤੇ ਜ਼ਿਲ੍ਹਾ ਚੁਣੋ, ਚਾਰਟ ਅਤੇ ਅਨੁਮਾਨ ਦੇਖੋ।' }, mr: { q: 'दराचा अंदाज कसा पाहू?', a: 'Price Forecast उघडा, पीक व जिल्हा निवडा, चार्ट व अंदाज रेषा बघा.' }, ta: { q: 'விலை கணிப்பை எப்படி பார்ப்பது?', a: 'Price Forecast-ல் பயிர் & மாவட்டம் தேர்ந்தெடுத்து விளக்கப்படம் பார்க்கலாம்.' } },
  { en: { q: 'What is the price calculator?', a: 'The "Calculate Price" tool converts and compares prices across units — for example kg vs quintal vs metric tonne — and adds estimated logistics cost so you can settle a farm-gate or delivered price confidently.' }, hi: { q: 'प्राइस कैलकुलेटर क्या है?', a: '"Calculate Price" टूल दाम को इकाइयों (किलो, क्विंटल, टन) में बदलता और तुलना करता है, और लॉजिस्टिक्स लागत जोड़ता है।' }, pa: { q: 'ਕੀਮਤ ਕੈਲਕੁਲੇਟਰ ਕੀ ਹੈ?', a: 'Calculate Price ਟੂਲ ਇਕਾਈਆਂ ਵਿੱਚ ਕੀਮਤ ਬਦਲਦਾ ਹੈ ਅਤੇ ਟਰਾਂਸਪੋਰਟ ਲਾਗਤ ਜੋੜਦਾ ਹੈ।' }, mr: { q: 'प्राइस कॅल्क्युलेटर म्हणजे काय?', a: 'Calculate Price दर एककांमध्ये बदलते, तुलना करते आणि वाहतूक खर्च जोडते.' }, ta: { q: 'விலை கால்குலேட்டர் என்றால் என்ன?', a: 'அலகு மாற்றம் & ஒப்பீடு; தளவாட செலவையும் சேர்க்கும்.' } },
  { en: { q: 'What is the demand forecast?', a: 'The Demand Forecast page shows projected demand for crops across districts and seasons, helping producers decide what to plant and buyers decide when to procure.' }, hi: { q: 'डिमांड फोरकास्ट क्या है?', a: 'Demand Forecast पेज जिलों और मौसमों के हिसाब से फसलों की अनुमानित मांग दिखाता है — किसानों को बुवाई और खरीदारों को खरीद का समय तय करने में मदद करता है।' }, pa: { q: 'ਡਿਮਾਂਡ ਫੋਰਕਾਸਟ ਕੀ ਹੈ?', a: 'Demand Forecast ਪੰਨਾ ਫ਼ਸਲਾਂ ਦੀ ਮੰਗ ਦਿਖਾਉਂਦਾ ਹੈ — ਕਦੋਂ ਬੀਜਣਾ ਅਤੇ ਕਦੋਂ ਖਰੀਦਣਾ।' }, mr: { q: 'डिमांड फोरकास्ट म्हणजे काय?', a: 'पिकांची अपेक्षित मागणी जिल्हा व हंगामानुसार दाखवते.' }, ta: { q: 'தேவை கணிப்பு என்றால் என்ன?', a: 'மாவட்டம் & பருவ வாரியாக பயிர் தேவை கணிப்பு.' } },
  { en: { q: 'What is the farm-gate price?', a: 'The farm-gate price is the rate received at the farm before transport and mandi charges. Agrolink prices are quoted farm-gate, so buyers pay the base commodity value and a transparent logistics fee instead of hidden commission.' }, hi: { q: 'फार्म-गेट कीमत क्या होती है?', a: 'फार्म-गेट कीमत वह दर है जो खेत पर परिवहन और मंडी शुल्क से पहले मिलती है। खरीदार बेस कीमत और पारदर्शी लॉजिस्टिक्स फीस देते हैं।' }, pa: { q: 'ਫਾਰਮ-ਗੇਟ ਕੀਮਤ ਕੀ ਹੁੰਦੀ ਹੈ?', a: 'ਖੇਤ ਵਿੱਚ ਟ੍ਰਾਂਸਪੋਰਟ ਅਤੇ ਮੰਡੀ ਖਰਚੇ ਤੋਂ ਪਹਿਲਾਂ ਮਿਲਣ ਵਾਲਾ ਭਾਅ।' }, mr: { q: 'फार्म-गेट दर म्हणजे काय?', a: 'वाहतूक आणि मंडी शुल्कापूर्वी शेतात मिळणारा दर; पारदर्शी वाहतूक शुल्क.' }, ta: { q: 'பண்ணை-வாயில் விலை என்றால் என்ன?', a: 'போக்குவரத்து & மண்டி கட்டணத்திற்கு முன் பண்ணையில் கிடைக்கும் விலை.' } },

  // ---- Payments ----
  { en: { q: 'What payment methods are supported?', a: 'Buyers can pay by UPI, debit or credit card, net banking and, where offered, cash on delivery. Producers are paid by direct settlement or by escrow once delivery is confirmed.' }, hi: { q: 'कौन से भुगतान तरीके सपोर्ट होते हैं?', a: 'खरीदार UPI, डेबिट या क्रेडिट कार्ड, नेट बैंकिंग और जहां उपलब्ध हो वहां कैश ऑन डिलीवरी से दे सकते हैं। उत्पादकों को डायरेक्ट या एस्क्रो से भुगतान मिलता है।' }, pa: { q: 'ਕਿਹੜੀਆਂ ਭੁਗਤਾਨ ਵਿਧੀਆਂ ਸਹਿਯੋਗ ਹਨ?', a: 'ਖਰੀਦਦਾਰ UPI, ਕਾਰਡ, ਨੈੱਟ ਬੈਂਕਿੰਗ ਅਤੇ ਥਾਂ-ਥਾਂ ਕੈਸ਼ ਆਨ ਡਿਲੀਵਰੀ ਨਾਲ ਦੇ ਸਕਦੇ ਹਨ।' }, mr: { q: 'कोणत्या पेमेंट पद्धती आहेत?', a: 'UPI, कार्ड, नेट बँकिंग आणि COD; उत्पादकांना डायरेक्ट किंवा एस्क्रो.' }, ta: { q: 'என்ன கட்டண முறைகள்?', a: 'UPI, அட்டை, நெட் பேங்கிங், COD; உற்பத்தியாளருக்கு நேரடி/எஸ்க்ரோ.' } },
  { en: { q: 'When will I get paid?', a: 'For direct payments, the amount is settled to your verified account within 1 working day of delivery. For escrow orders, funds are released only once the buyer confirms delivery — locking in both parties.' }, hi: { q: 'मुझे भुगतान कब मिलेगा?', a: 'डायरेक्ट भुगतान डिलीवरी के 1 कार्यदिवस के भीतर वेरिफाइड खाते में पहुंचता है। एस्क्रो ऑर्डर में खरीदार के डिलीवरी कन्फर्म करने पर ही पैसा रिलीज़ होता है।' }, pa: { q: 'ਮੈਨੂੰ ਭੁਗਤਾਨ ਕਦੋਂ ਮਿਲੇਗਾ?', a: 'ਡਿਲੀਵਰੀ ਤੋਂ 1 ਕੰਮਕਾਜੀ ਦਿਨ ਅੰਦਰ ਖਾਤੇ ਵਿੱਚ। ਐਸਕਰੋ ਵਿੱਚ ਕਨਫਰਮੇਸ਼ਨ ਤੋਂ ਬਾਅਦ।' }, mr: { q: 'मला पैसे कधी मिळतील?', a: 'डायरेक्ट - डिलिव्हरीनंतर 1 कामाच्या दिवसात; एस्क्रो - कन्फर्मेशननंतरच.' }, ta: { q: 'எப்போது பணம் கிடைக்கும்?', a: 'நேரடி - டெலிவரி முடிந்து 1 வேலைநாளில்; எஸ்க்ரோ - உறுதிக்குப் பின்.' } },
  { en: { q: 'What is escrow?', a: 'Escrow holds the buyer payment in a protected account while the order is in transit. When delivery is confirmed by the buyer, the funds are released to the producer. It protects the buyer against no-show and the producer against non-payment.' }, hi: { q: 'एस्क्रो क्या है?', a: 'एस्क्रो में खरीदार का भुगतान ऑर्डर परिवहन में रहने तक एक सुरक्षित खाते में रहता है। डिलीवरी कन्फर्म होने पर पैसा उत्पादक को मिलता है — दोनों पक्ष सुरक्षित।' }, pa: { q: 'ਐਸਕਰੋ ਕੀ ਹੈ?', a: 'ਭੁਗਤਾਨ ਸੁਰੱਖਿਅਤ ਖਾਤੇ ਵਿੱਚ ਰਹਿੰਦਾ ਹੈ; ਡਿਲੀਵਰੀ ਕਨਫਰਮ ਹੋਣ ਪਿੱਛੋਂ ਉਤਪਾਦਕ ਨੂੰ ਮਿਲਦਾ ਹੈ।' }, mr: { q: 'एस्क्रो म्हणजे काय?', a: 'पेमेंट सुरक्षित खात्यात राहते; डिलिव्हरी कन्फर्म झाल्यावर उत्पादकाला.' }, ta: { q: 'எஸ்க்ரோ என்றால் என்ன?', a: 'பணம் பாதுகாப்பு கணக்கில்; டெலிவரி உறுதியானதும் வெளியீடு.' } },
  { en: { q: 'How does FPO payment settlement work?', a: 'An FPO\'s payment for pooled stock is settled to the FPO account, which then distributes shares to member farmers per their contribution. Transactions and payouts appear in the FPO payments history.' }, hi: { q: 'FPO भुगतान सेटलमेंट कैसे काम करता है?', a: 'पूल किए गए स्टॉक का भुगतान FPO के खाते में जाता है, फिर सदस्य किसानों के योगदान के अनुसार बांटा जाता है। लेनदेन FPO payments history में दिखता है।' }, pa: { q: 'FPO ਭੁਗਤਾਨ ਸੈਟਲਮੈਂਟ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ?', a: 'ਪੂਲ ਸਟਾਕ ਦਾ ਭੁਗਤਾਨ FPO ਖਾਤੇ ਵਿੱਚ ਜਾਂਦਾ ਹੈ, ਫਿਰ ਮੈਂਬਰ ਕਿਸਾਨਾਂ ਵਿੱਚ ਵੰਡਿਆ ਜਾਂਦਾ ਹੈ।' }, mr: { q: 'FPO पेमेंट सेटलमेंट कसे काम करते?', a: 'पूल स्टॉकचे पेमेंट FPO खात्यात जाते, मग सदस्यांना वाटप.' }, ta: { q: 'FPO கட்டண தீர்வு எப்படி?', a: 'திரட்டல் பணம் FPO கணக்கில்; பங்காளிகளுக்குப் பங்கிடப்படுகிறது.' } },

  // ---- Delivery & logistics ----
  { en: { q: 'What are the delivery options?', a: 'We aggregate shipments through partner logistics. Per-order and routed options are available; eligible FPOs receive a route optimizer that combines multiple orders into one trip, cutting per-order transport cost by up to 30%.' }, hi: { q: 'डिलीवरी के क्या विकल्प हैं?', a: 'हम पार्टनर लॉजिस्टिक्स के जरिए शिपमेंट जोड़ते हैं। FPOs के लिए रूट ऑप्टिमाइजर कई ऑर्डर को एक ट्रिप में जोड़कर लागत 30% तक घटाता है।' }, pa: { q: 'ਡਿਲੀਵਰੀ ਵਿਕਲਪ ਕੀ ਹਨ?', a: 'ਪਾਰਟਨਰ ਲੌਜਿਸਟਿਕਸ ਰਾਹੀਂ; FPO ਲਈ ਰੂਟ ਓਪਟੀਮਾਈਜ਼ਰ ਖਰਚਾ 30% ਤੱਕ ਘਟਾਉਂਦਾ ਹੈ।' }, mr: { q: 'डिलिव्हरी पर्याय कोणते?', a: 'पार्टनर लॉजिस्टिक्स; रूट ऑप्टिमायझरने 30% खर्च कमी.' }, ta: { q: 'டெலிவரி விருப்பங்கள் என்ன?', a: 'தளவாட கூட்டாளர்; வழி உகப்பாக்கம் செலவை 30% குறைக்கும்.' } },
  { en: { q: 'How does route optimization work?', a: 'The Logistics route planner maps all pending orders and assigns trucks so one vehicle covers several drop points in a single circuit, minimising distance and per-order cost while keeping delivery windows.' }, hi: { q: 'रूट ऑप्टिमाइज़ेशन कैसे काम करता है?', a: 'लॉजिस्टिक्स रूट प्लानर सभी लंबित ऑर्डर को मैप करके वाहन असाइन करता है, ताकि एक वाहन कई ड्रॉप पॉइंट्स एक ही सर्किट में कवर करे।' }, pa: { q: 'ਰੂਟ ਓਪਟੀਮਾਈਜ਼ੇਸ਼ਨ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ?', a: 'ਪਲਾਨਰ ਸਾਰੇ ਪੈਡਿੰਗ ਆਰਡਰ ਮੈਪ ਕਰਕੇ ਇੱਕ ਵਾਹਨ ਨਾਲ ਕਈ ਥਾਵਾਂ ਕਵਰ ਕਰਦਾ ਹੈ।' }, mr: { q: 'रूट ऑप्टिमायझेशन कसे काम करते?', a: 'प्लॅनर प्रलंबित ऑर्डर मैप करून एकाच वाहनाने अनेक ठिकाणे कव्हर करतो.' }, ta: { q: 'வழி உகப்பாக்கம் எப்படி வேலை செய்கிறது?', a: 'பிளானர் அனைத்து நிலுவை ஆர்டர்களையும் ஒரே வாகனத்தில் பல நிறுத்தங்களை இணைக்கிறது.' } },
  { en: { q: 'How do delivery and confirmation work?', a: 'After an order ships, the Delivery page shows status and live route. The assigned driver completes delivery, and the buyer confirms on the delivery confirmation page — that action also triggers payment release.' }, hi: { q: 'डिलीवरी और कन्फर्मेशन कैसे काम करता है?', a: 'ऑर्डर भेजने के बाद Delivery पेज पर स्टेटस और लाइव रूट दिखता है। ड्राइवर डिलीवर करता है और खरीदार कन्फर्म करता है — फिर भुगतान रिलीज़ होता है।' }, pa: { q: 'ਡਿਲੀਵਰੀ ਅਤੇ ਕਨਫਰਮੇਸ਼ਨ ਕਿਵੇਂ ਕੰਮ ਕਰਦੀ ਹੈ?', a: 'ਆਰਡਰ ਭੇਜਣ ਤੋਂ ਬਾਅਦ ਸਟੇਟਸ ਅਤੇ ਰੂਟ ਦਿਖਦਾ ਹੈ; ਕਨਫਰਮੇਸ਼ਨ ਤੋਂ ਬਾਅਦ ਭੁਗਤਾਨ।' }, mr: { q: 'डिलिव्हरी व कन्फर्मेशन कसे काम करते?', a: 'ऑर्डर पाठवल्यावर स्टेटस व मार्ग दिसतो; कन्फर्मेशननंतर पेमेंट.' }, ta: { q: 'டெலிவரி & உறுதி எப்படி வேலை செய்கிறது?', a: 'நிலை & வழி தெரியும்; வாங்குபவர் உறுதிசெய்ததும் பணம் வெளியீடு.' } },
  { en: { q: 'Can I see the delivery vehicle?', a: 'Yes. Selected orders show the assigned truck, driver and a live map with stops on the Vehicle Assignment and Route Map pages of the logistics dashboard.' }, hi: { q: 'क्या मैं डिलीवरी वाहन देख सकता हूं?', a: 'हां। लॉजिस्टिक्स डैशबोर्ड के Vehicle Assignment और Route Map पेज पर वाहन, ड्राइवर और लाइव मैप दिखता है।' }, pa: { q: 'ਕੀ ਮੈਂ ਡਿਲੀਵਰੀ ਵਾਹਨ ਦੇਖ ਸਕਦਾ ਹਾਂ?', a: 'ਹਾਂ। Vehicle Assignment ਅਤੇ Route Map ਪੰਨਿਆਂ ਵਿੱਚ ਵਾਹਨ, ਡਰਾਈਵਰ ਅਤੇ ਲਾਈਵ ਮੈਪ।' }, mr: { q: 'मी डिलिव्हरी वाहन पाहू शकतो का?', a: 'हो. Vehicle Assignment व Route Map पेजेसवर वाहन, ड्रायव्हर व लाइव्ह नकाशा.' }, ta: { q: 'டெலிவரி வாகனத்தைப் பார்க்கலாமா?', a: 'ஆம். வாகனம், ஓட்டுநர் & நேரடி வரைபடம்.' } },

  // ---- Marketplace specifics ----
  { en: { q: 'What products are on the marketplace?', a: 'The marketplace lists fresh produce from verified producers, including basmati rice, sharbati wheat, kachi ghani mustard oil, potatoes, tomatoes, nasik red onions, Thompson grapes, salem turmeric and groundnut kernels, plus bulk cow milk.' }, hi: { q: 'मार्केटप्लेस पर कौन से उत्पाद हैं?', a: 'वेरिफाइड उत्पादकों की ताजी उपज — बासमती चावल, शरबती गेहूं, कच्ची घानी सरसों का तेल, आलू, टमाटर, नासिक लाल प्याज, थॉम्पसन अंगूर, सलेम हल्दी, मूंगफली दाना और थोक दूध।' }, pa: { q: 'ਮਾਰਕੀਟ ਵਿੱਚ ਕਿਹੜੇ ਉਤਪਾਦ ਹਨ?', a: 'ਤਾਜ਼ੀ ਉਪਜ — ਬਾਸਮਤੀ, ਸ਼ਰਬਤੀ ਕਣਕ, ਕੱਚੀ ਘਾਣੀ ਤੇਲ, ਆਲੂ, ਟਮਾਟਰ, ਪਿਆਜ਼, ਅੰਗੂਰ, ਹਲਦੀ, ਮੂੰਗਫਲੀ ਅਤੇ ਥੋਕ ਦੁੱਧ।' }, mr: { q: 'मार्केटप्लेसमध्ये कोणती उत्पादने आहेत?', a: 'बासमती, शरबती गहू, कच्ची घाणी तेल, बटाटा, टोमॅटो, कांदा, द्राक्षे, हळद, शेंगदाणा आणि घाऊक दूध.' }, ta: { q: 'சந்தையில் என்ன பொருட்கள்?', a: 'பாஸ்மதி, கோதுமை, எண்ணெய், உருளை, தக்காளி, வெங்காயம், திராட்சை, மஞ்சள், வேர்க்கடலை, பால்.' } },
  { en: { q: 'What is Kachi Ghani oil?', a: 'Kachi Ghani (cold-pressed) oil is extracted by crushing seeds in a wooden ghani press at low temperature without chemical solvents, preserving natural aroma and nutrients.' }, hi: { q: 'कच्ची घानी तेल क्या होता है?', a: 'कच्ची घानी (कोल्ड-प्रेस्ड) तेल बीजों को कम तापमान पर लकड़ी की घानी में बिना रसायन के दबाकर निकाला जाता है — प्राकृतिक सुगंध और पोषण बना रहता है।' }, pa: { q: 'ਕੱਚੀ ਘਾਣੀ ਦਾ ਤੇਲ ਕੀ ਹੁੰਦਾ ਹੈ?', a: 'ਬੀਜਾਂ ਨੂੰ ਘੱਟ ਤਾਪਮਾਨ ਅਤੇ ਰਸਾਇਣ ਬਿਨਾਂ ਲੱਕੜ ਦੀ ਘਾਣੀ ਵਿੱਚ ਦਬਾ ਕੇ ਕੱਢਿਆ ਜਾਂਦਾ ਹੈ।' }, mr: { q: 'कच्ची घाणी तेल म्हणजे काय?', a: 'लाकडी घाणीत कमी तापमानावर, रसायनाशिवाय बी दाबून काढलेले तेल.' }, ta: { q: 'கச்சி கானி எண்ணெய் என்றால் என்ன?', a: 'குளிர் அழுத்தத்தில், ரசாயனம் இல்லாமல் எடுக்கப்பட்ட எண்ணெய்.' } },

  // ---- News / content ----
  { en: { q: 'What news is shown on the site?', a: 'The "Latest news" section covers activity in the farm and mandi world, and Mandi Samachar shares rates and market stories. Recent highlights include higher MSP for kharif crops, eased onion export curbs, FPOs pooling 40 lakh quintals in one season, and digital mandi trades hitting a new record. News is also referenced from the price forecast screens.' }, hi: { q: 'साइट पर कौन सी खबरें दिखती हैं?', a: '"Latest news" खेत और मंडी की गतिविधियां दिखाता है। हाल की खबरें: खरीफ फसलों के लिए बढ़ा MSP, प्याज निर्यात में ढील, FPO द्वारा 40 लाख क्विंटल पूलिंग और डिजिटल मंडी ट्रेड का नया रिकॉर्ड।' }, pa: { q: 'ਸਾਈਟ ਵਿੱਚ ਕਿਹੜੀਆਂ ਖ਼ਬਰਾਂ ਦਿਖਦੀਆਂ ਹਨ?', a: 'Latest news ਖੇਤ ਅਤੇ ਮੰਡੀ ਦੀਆਂ ਖ਼ਬਰਾਂ — MSP ਵਾਧਾ, ਪਿਆਜ਼ ਨਿਰਯਾਤ, FPO ਪੂਲਿੰਗ ਅਤੇ ਡਿਜੀਟਲ ਮੰਡੀ ਰਿਕਾਰਡ।' }, mr: { q: 'साइटवर कोणत्या बातम्या दिसतात?', a: 'Latest news — MSP वाढ, कांदा निर्यात शिथिलता, FPO पूलिंग आणि डिजिटल मंडी विक्रम.' }, ta: { q: 'தளத்தில் என்ன செய்திகள்?', a: 'Latest news — MSP உயர்வு, வெங்காய ஏற்றுமதி, FPO திரட்டல், டிஜிட்டல் மண்டி சாதனை.' } },

  // ---- Demo / support ----
  { en: { q: 'How do I log in?', a: 'Sign in with the account you registered on the platform. New here? Use "Create an account" on the login page to get started.' }, hi: { q: 'लॉगिन कैसे करूं?', a: 'प्लेटफॉर्म पर पंजीकृत अपने खाते से साइन इन करें। नए हैं? लॉगिन पेज पर "Create an account" से शुरू करें।' }, pa: { q: 'ਲੌਗਇਨ ਕਿਵੇਂ ਕਰਾਂ?', a: "ਪਲੇਟਫਾਰਮ 'ਤੇ ਰਜਿਸਟਰ ਕੀਤੇ ਖਾਤੇ ਨਾਲ ਸਾਈਨ-ਇਨ ਕਰੋ। ਨਵੇਂ ਹੋ? ਲੌਗਇਨ ਪੰਨੇ 'ਤੇ Create an account ਵਰਤੋਂ।" }, mr: { q: 'लॉगिन कसे करू?', a: 'प्लॅटफॉर्मवर नोंदणी केलेल्या खात्याने साइन इन करा. नवीन आहात? लॉगिन पेजवरील Create an account वापरा.' }, ta: { q: 'லாகின் எப்படி?', a: 'பதிவு செய்த கணக்கில் உள்நுழையவும். புதியவரா? லாகின் பக்கத்தில் Create an account பயன்படுத்தவும்.' } },
  { en: { q: 'Where can I find help or the assistant?', a: 'The Agro Assistant chat is available as the floating green button on every page and on the dedicated Chatbot page. You can also use the profile and support links in the footer for account help.' }, hi: { q: 'मुझे मदद या असिस्टेंट कहां मिलेगा?', a: 'अग्रो असिस्टेंट हर पेज पर तैरते हरे बटन से और Chatbot पेज पर उपलब्ध है। फुटर में प्रोफाइल और सपोर्ट लिंक भी हैं।' }, pa: { q: 'ਮੈਨੂੰ ਮਦਦ ਜਾਂ ਅਸਿਸਟੈਂਟ ਕਿੱਥੇ ਮਿਲੇਗਾ?', a: 'ਹਰੇ ਫਲੋਟਿੰਗ ਬਟਨ ਅਤੇ Chatbot ਪੰਨੇ ਰਾਹੀਂ; ਫੁੱਟਰ ਵਿੱਚ ਪ੍ਰੋਫਾਈਲ ਅਤੇ ਸਹਾਇਤਾ ਲਿੰਕ।' }, mr: { q: 'मदद किंवा असिस्टंट कुठे मिळेल?', a: 'प्रत्येक पेजवरील हिरव्या बटणातून आणि Chatbot पेजवर; फुटरमध्ये प्रोफाइल व सपोर्ट लिंक.' }, ta: { q: 'உதவி/அசிஸ்டெண்ட் எங்கே?', a: 'ஒவ்வொரு பக்கத்திலும் பச்சை பொத்தான்; Chatbot பக்கத்திலும். Footer-உம் உதவும்.' } },
];

export const producerStats = {
  'p1': { productsActive: 3, pendingOrders: 1, totalRevenue: 124500, avgRating: 4.8, ordersThisMonth: 8 },
  'p2': { productsActive: 1, pendingOrders: 1, totalRevenue: 89300, avgRating: 4.5, ordersThisMonth: 12 },
  'p3': { productsActive: 4, pendingOrders: 1, totalRevenue: 212000, avgRating: 4.9, ordersThisMonth: 21 },
  'p4': { productsActive: 3, pendingOrders: 2, totalRevenue: 1890000, avgRating: 4.7, ordersThisMonth: 34 },
  'p5': { productsActive: 6, pendingOrders: 3, totalRevenue: 3480000, avgRating: 4.6, ordersThisMonth: 52 },
};