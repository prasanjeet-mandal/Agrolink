export const API = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    GOOGLE: '/api/auth/google',
    GOOGLE_SIGNUP: '/api/auth/google/complete',
    REFRESH: '/api/auth/refresh',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    SEND_OTP: '/api/auth/otp/send',
    VERIFY_OTP: '/api/auth/otp/verify',
    ME: '/api/auth/me',
  },
  USERS: {
    BASE: '/api/users',
    ME: '/api/users/me',
    ME_PROFILE: '/api/users/me/profile',
  },
  PRODUCERS: {
    BASE: '/api/producers',
  },
  CONSUMERS: {
    BASE: '/api/consumers',
  },
  PRODUCTS: {
    BASE: '/api/products',
    MY: '/api/products/mine',
    CATEGORIES: '/api/categories',
  },
  CATEGORIES: {
    BASE: '/api/categories',
  },
  MARKETPLACE: {
    BASE: '/api/products',
  },
  ORDERS: {
    BASE: '/api/orders',
    CHECKOUT: '/api/orders/checkout',
    SELLER: '/api/orders/seller',
  },
  ADDRESSES: {
    BASE: '/api/addresses',
  },
  CART: {
    BASE: '/api/cart',
    ITEMS: '/api/cart/items',
  },
  PRICING: {
    BASE: '/api/pricing',
    CALCULATE: '/api/pricing/calculate',
    FORECAST: '/api/pricing/forecast',
    TREND: '/api/pricing/trend',
  },
  DEMAND: {
    BASE: '/api/demand',
    FORECAST: '/api/demand/forecast',
  },
  LOGISTICS: {
    BASE: '/api/logistics',
    MINE: '/api/logistics/mine',
    SHIPMENTS: '/api/logistics/shipments',
    VEHICLES: '/api/logistics/vehicles',
    ROUTES: '/api/logistics/routes',
  },
  DELIVERY: {
    BASE: '/api/delivery',
    STATUS: '/api/delivery/status',
    CONFIRM: '/api/delivery/confirm',
  },
  PAYMENTS: {
    BASE: '/api/payments',
    CREATE: '/api/payments/orders',
    VERIFY: '/api/payments/orders',
  },
  AI: {
    CHAT: '/api/ai/chat',
  },
  ADMIN: {
    BASE: '/api/admin',
    ORDERS: '/api/admin/orders',
    REVIEWS: '/api/admin/reviews',
    USERS: '/api/admin/users',
    PRODUCTS: '/api/admin/products',
    STATS: '/api/admin/stats',
  },
};