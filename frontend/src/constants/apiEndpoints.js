export const API = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    SEND_OTP: '/api/auth/otp/send',
    VERIFY_OTP: '/api/auth/otp/verify',
    ME: '/api/auth/me',
  },
  USERS: {
    BASE: '/api/users',
    PROFILE: '/api/users/profile',
  },
  PRODUCERS: {
    BASE: '/api/producers',
    PROFILE: '/api/producers/profile',
    STATS: '/api/producers/stats',
  },
  CONSUMERS: {
    BASE: '/api/consumers',
    PROFILE: '/api/consumers/profile',
    DASHBOARD: '/api/consumers/dashboard',
  },
  PRODUCTS: {
    BASE: '/api/products',
    MY: '/api/products/mine',
    SEARCH: '/api/products/search',
    CATEGORIES: '/api/products/categories',
  },
  MARKETPLACE: {
    BASE: '/api/marketplace',
    TRENDING: '/api/marketplace/trending',
  },
  ORDERS: {
    BASE: '/api/orders',
    MY: '/api/orders/mine',
    SELLER: '/api/orders/seller',
    TRACK: '/api/orders/track',
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
    MY: '/api/payments/mine',
    CREATE: '/api/payments/create',
    VERIFY: '/api/payments/verify',
  },
  AI: {
    CHAT: '/ai/chat',
    PRICE_FORECAST: '/ai/price-forecast',
    DEMAND_FORECAST: '/ai/demand-forecast',
  },
};