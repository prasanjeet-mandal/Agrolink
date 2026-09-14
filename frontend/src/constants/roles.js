export const ROLES = {
  CONSUMER: 'CONSUMER',
  FARMER: 'FARMER',
  FPO: 'FPO',
  ADMIN: 'ADMIN',
};

export const ROLE_LABELS = {
  [ROLES.CONSUMER]: 'Consumer',
  [ROLES.FARMER]: 'Farmer',
  [ROLES.FPO]: 'FPO',
  [ROLES.ADMIN]: 'Admin',
};

export const ROLE_ROUTES = {
  [ROLES.CONSUMER]: '/consumer',
  [ROLES.FARMER]: '/producer/farmer',
  [ROLES.FPO]: '/producer/fpo',
  [ROLES.ADMIN]: '/admin',
};