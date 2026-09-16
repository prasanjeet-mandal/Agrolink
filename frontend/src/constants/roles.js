export const ROLES = {
  CONSUMER: 'CONSUMER',
  FARMER: 'FARMER',
  FPO: 'FPO',
  DELIVERY_PARTNER: 'DELIVERY_PARTNER',
  ADMIN: 'ADMIN',
};

export const ROLE_LABELS = {
  [ROLES.CONSUMER]: 'Consumer',
  [ROLES.FARMER]: 'Farmer',
  [ROLES.FPO]: 'FPO',
  [ROLES.DELIVERY_PARTNER]: 'Delivery Partner',
  [ROLES.ADMIN]: 'Admin',
};

export const ROLE_ROUTES = {
  [ROLES.CONSUMER]: '/consumer',
  [ROLES.FARMER]: '/producer/farmer',
  [ROLES.FPO]: '/producer/fpo',
  [ROLES.DELIVERY_PARTNER]: '/delivery-partner',
  [ROLES.ADMIN]: '/admin',
};