export const PRODUCER_TYPES = {
  FARMER: 'FARMER',
  FPO: 'FPO',
};

export const PRODUCER_TYPE_LABELS = {
  [PRODUCER_TYPES.FARMER]: 'Farmer',
  [PRODUCER_TYPES.FPO]: 'FPO / Producer Organization',
};

export const PRODUCER_SUBTYPES = {
  [PRODUCER_TYPES.FARMER]: ['Individual Farmer'],
  [PRODUCER_TYPES.FPO]: [
    'Farmer Producer Organization',
    'Multi-State Cooperative',
    'Producer Cooperative',
    'Farmer Cooperative Society',
  ],
};