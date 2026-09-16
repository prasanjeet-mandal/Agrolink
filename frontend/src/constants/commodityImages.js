export const COMMODITY_IMAGES = {
  'apple': '/assets/products/commodities/apple-127.jpg',
  'bajra-pearl-millet': '/assets/products/commodities/bajra-pearl-millet-12.jpg',
  'banana': '/assets/products/commodities/banana-121.jpg',
  'barley': '/assets/products/commodities/barley-10.jpg',
  'basmati-rice': '/assets/products/commodities/basmati-rice-1.jpg',
  'beetroot': '/assets/products/commodities/beetroot-106.jpg',
  'bitter-gourd': '/assets/products/commodities/bitter-gourd-113.jpg',
  'black-pepper': '/assets/products/commodities/black-pepper-138.jpg',
  'bottle-gourd': '/assets/products/commodities/bottle-gourd-111.jpg',
  'brinjal-eggplant': '/assets/products/commodities/brinjal-eggplant-100.jpg',
  'cabbage': '/assets/products/commodities/cabbage-86.jpg',
  'capsicum-bell-pepper': '/assets/products/commodities/capsicum-bell-pepper-95.jpg',
  'cardamom': '/assets/products/commodities/cardamom-139.jpg',
  'carrot': '/assets/products/commodities/carrot-103.jpg',
  'cauliflower': '/assets/products/commodities/cauliflower-81.jpg',
  'chana-dal': '/assets/products/commodities/chana-dal-42.jpg',
  'chickpea': '/assets/products/commodities/chickpea-51.jpg',
  'coconut': '/assets/products/commodities/coconut-130.jpg',
  'coriander-seed': '/assets/products/commodities/coriander-seed-134.jpg',
  'cumin-seed': '/assets/products/commodities/cumin-seed-135.jpg',
  'fenugreek': '/assets/products/commodities/fenugreek-137.jpg',
  'garlic': '/assets/products/commodities/garlic-77.jpg',
  'ghee': '/assets/products/commodities/ghee-259.jpg',
  'grapes': '/assets/products/commodities/grapes-129.jpg',
  'green-chili': '/assets/products/commodities/green-chili-91.jpg',
  'guava': '/assets/products/commodities/guava-123.jpg',
  'maize-corn': '/assets/products/commodities/maize-corn-22.jpg',
  'mango': '/assets/products/commodities/mango-122.jpg',
  'masoor-dal': '/assets/products/commodities/masoor-dal-55.jpg',
  'milk': '/assets/products/commodities/milk-143.jpg',
  'moong-dal': '/assets/products/commodities/moong-dal-37.jpg',
  'mosambi-sweet-lime': '/assets/products/commodities/mosambi-sweet-lime-131.jpg',
  'mustard-seed': '/assets/products/commodities/mustard-seed-136.jpg',
  'oats-grain': '/assets/products/commodities/oats-grain-31.jpg',
  'okra-ladies-finger': '/assets/products/commodities/okra-ladies-finger-118.jpg',
  'onion': '/assets/products/commodities/onion-73.jpg',
  'orange': '/assets/products/commodities/orange-128.jpg',
  'paddy-rice': '/assets/products/commodities/paddy-rice-26.jpg',
  'paneer': '/assets/products/commodities/paneer-144.jpg',
  'papaya': '/assets/products/commodities/papaya-126.jpg',
  'pineapple': '/assets/products/commodities/pineapple-140.jpg',
  'pomegranate': '/assets/products/commodities/pomegranate-124.jpg',
  'potato': '/assets/products/commodities/potato-69.jpg',
  'ragi-finger-millet': '/assets/products/commodities/ragi-finger-millet-17.jpg',
  'red-chili': '/assets/products/commodities/red-chili-133.jpg',
  'sesame-seed': '/assets/products/commodities/sesame-seed-142.jpg',
  'sorghum-jowar': '/assets/products/commodities/sorghum-jowar-60.jpg',
  'soybean': '/assets/products/commodities/soybean-257.jpg',
  'spinach-palak': '/assets/products/commodities/spinach-palak-242.jpg',
  'sunflower-seed': '/assets/products/commodities/sunflower-seed-141.jpg',
  'tomato': '/assets/products/commodities/tomato-64.jpg',
  'toor-dal-arhar': '/assets/products/commodities/toor-dal-arhar-36.jpg',
  'turmeric': '/assets/products/commodities/turmeric-132.jpg',
  'urad-dal': '/assets/products/commodities/urad-dal-46.jpg',
  'watermelon': '/assets/products/commodities/watermelon-125.jpg',
  'wheat-flour': '/assets/products/commodities/wheat-flour-6.jpg',
};

const normalize = (s) => String(s ?? '').toLowerCase().trim().replace(/\s+/g, ' ');

export function commodityImageOf(name) {
  const key = normalize(name);
  if (COMMODITY_IMAGES[key]) return COMMODITY_IMAGES[key];
  for (const [k, v] of Object.entries(COMMODITY_IMAGES)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return null;
}

