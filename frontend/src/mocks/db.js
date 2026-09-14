import { ROLES } from '@/constants/roles';
import {
  users, consumerProfiles, producerProfiles, products, orders, shipments,
  payments, priceForecasts, demandForecasts, vehicles, chatbotKnowledge, producerStats,
} from './data';

export const MOCK_MODE = true;

const FAKE_DELAY = 150;

function wait(ms = FAKE_DELAY) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let nextUserId = 1000;

const otpRequests = new Map();
let nextOtpId = 1;

function maskContact(value) {
  const v = String(value ?? '');
  if (v.length <= 2) return v;
  return `${v[0]}${'*'.repeat(Math.max(v.length - 2, 2))}${v[v.length - 1]}`;
}

function stripPassword(user) {
  const { password: _pw, ...safe } = user;
  return safe;
}

function findById(collection, id, label = 'Record') {
  const record = collection.find((item) => item.id === id);
  if (!record) throw new Error(`${label} not found (${id})`);
  return record;
}

function filterByProducer(collection, producerId) {
  return collection.filter((item) => item.producerId === producerId);
}

function decorateProduct(p) {
  const producer = producerProfiles.find((pr) => pr.id === p.producerId);
  return {
    ...p,
    producerName: producer?.name ?? 'Producer',
    producerType: producer?.type,
    producerRating: producer?.rating ?? null,
    producerVerified: producer?.verified ?? false,
    producerDistrict: producer?.location?.district,
    producerState: producer?.location?.state,
  };
}

function searchProducts({ query = '', category = null, minPrice = null, maxPrice = null, producerType = null, sort = 'relevance' } = {}) {
  let result = [...products].filter((p) => p.status === 'ACTIVE').map(decorateProduct);

  if (query) {
    const q = query.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.variety.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }
  if (category) result = result.filter((p) => p.category === category);
  if (producerType === 'FPO') result = result.filter((p) => p.isFpo);
  if (producerType === 'FARMER') result = result.filter((p) => !p.isFpo);
  if (minPrice != null) result = result.filter((p) => p.pricePerUnit >= Number(minPrice));
  if (maxPrice != null) result = result.filter((p) => p.pricePerUnit <= Number(maxPrice));

  switch (sort) {
    case 'price_asc':
      result.sort((a, b) => a.pricePerUnit - b.pricePerUnit);
      break;
    case 'price_desc':
      result.sort((a, b) => b.pricePerUnit - a.pricePerUnit);
      break;
    case 'newest':
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    default:
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  return result;
}

const CHAT_STOP = {
  en: ['does', 'what', 'which', 'where', 'when', 'will', 'would', 'your', 'this', 'that', 'there', 'with', 'help', 'please', 'tell', 'about', 'here', 'can', 'how', 'who', 'why', 'are', 'the', 'an', 'and', 'for', 'you', 'from'],
  hi: ['क्या', 'कैसे', 'है', 'हैं', 'होता', 'होती', 'होते', 'में', 'और', 'को', 'से', 'के', 'की', 'का', 'कर', 'करें', 'करते', 'करती', 'सकता', 'सकते', 'लिए', 'कौन', 'अपने', 'अपनी', 'अपना', 'मुझे', 'मैं', 'यह', 'वह', 'एक', 'नहीं', 'फिर', 'बाद', 'पर', 'भी', 'ही', 'तो', 'जाएं', 'करना'],
  pa: ['ਕੀ', 'ਕਿਵੇਂ', 'ਹੈ', 'ਹਨ', 'ਹੁੰਦਾ', 'ਹੁੰਦੀ', 'ਵਿੱਚ', 'ਅਤੇ', 'ਨੂੰ', 'ਤੋਂ', 'ਦਾ', 'ਦੀ', 'ਦੇ', 'ਨਾਲ', 'ਕਰਨ', 'ਕਰਦਾ', 'ਸਕਦਾ', 'ਸਕਦੇ', 'ਲਈ', 'ਕਿਹੜੇ', 'ਕਿਹੜੀਆਂ', 'ਆਪਣੀ', 'ਆਪਣਾ', 'ਆਪਣੇ', 'ਮੈਂ', 'ਮੈਨੂੰ', 'ਇੱਕ', 'ਬਾਅਦ', 'ਫਿਰ', 'ਤੇ', 'ਭੀ', 'ਵੀ', 'ਜਾਂ'],
  mr: ['काय', 'कसे', 'आहे', 'आहेत', 'होते', 'मध्ये', 'आणि', 'ला', 'पासून', 'चा', 'ची', 'चे', 'च्या', 'करू', 'करता', 'करतो', 'शकता', 'शकतो', 'साठी', 'कोणत्या', 'माझे', 'माझी', 'मी', 'हे', 'ते', 'एक', 'नाही', 'व', 'नंतर', 'झाल्यावर'],
  ta: ['என்ன', 'எப்படி', 'இல்', 'இந்த', 'அந்த', 'மற்றும்', 'ஒரு', 'முடியும்', 'நான்', 'நீங்கள்', 'எனக்கு', 'என்', 'வேண்டும்', 'செய்ய', 'எனது'],
};

const CHAT_FALLBACK = {
  en: 'I\'m Agro Assistant and I can help with everything on Agrolink — selling and listing produce, buying and bulk quotes, the marketplace, mandi prices and 6-month forecasts, pricing, demand, delivery and logistics, payments and escrow, FPO pooling tools, Kachi Ghani products, the latest farm news, and even demo logins. Try asking "How do I add a product?", "What payment methods are supported?" or "How does FPO pooling work?".',
  hi: 'मैं अग्रो असिस्टेंट हूं और अग्रोलिंक की हर चीज में मदद कर सकता हूं — उपज बेचना और लिस्ट करना, खरीदना, मार्केटप्लेस, मंडी भाव और 6 महीने के अनुमान, दाम, डिमांड, डिलीवरी, भुगतान और एस्क्रो, FPO पूलिंग, कच्ची घानी उत्पाद, खबरें और डेमो लॉगिन। पूछें "उपज कैसे बेचूं?", "एस्क्रो क्या है?" या "FPO पूलिंग कैसे काम करती है?"।',
  pa: 'ਮੈਂ ਅਗਰੋ ਅਸਿਸਟੈਂਟ ਹਾਂ ਅਤੇ ਅਗਰੋਲਿੰਕ ਦੀ ਹਰ ਚੀਜ਼ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ — ਉਪਜ ਵੇਚਣਾ ਅਤੇ ਲਿਸਟ ਕਰਨਾ, ਖਰੀਦਣਾ, ਮਾਰਕੀਟ, ਮੰਡੀ ਭਾਅ ਅਤੇ 6 ਮਹੀਨੇ ਦੇ ਅਨੁਮਾਨ, ਕੀਮਤ, ਡਿਮਾਂਡ, ਡਿਲੀਵਰੀ, ਭੁਗਤਾਨ ਅਤੇ ਐਸਕਰੋ, FPO ਪੂਲਿੰਗ, ਕੱਚੀ ਘਾਣੀ ਉਤਪਾਦ, ਖ਼ਬਰਾਂ ਅਤੇ ਡੈਮੋ ਲੌਗਇਨ। ਪੁੱਛੋ "ਉਪਜ ਕਿਵੇਂ ਵੇਚਾਂ?", "ਐਸਕਰੋ ਕੀ ਹੈ?" ਜਾਂ "FPO ਪੂਲਿੰਗ ਕਿਵੇਂ ਕੰਮ ਕਰਦੀ ਹੈ?"।',
  mr: 'मी अग्रो असिस्टंट आहे आणि अग्रोलिंगच्या प्रत्येक गोष्टीत मदत करू शकतो — उपज विकणे आणि लिस्ट करणे, खरेदी, मार्केटप्लेस, मंडी भाव आणि 6 महिन्यांचे अंदाज, दर, मागणी, डिलिव्हरी, पेमेंट आणि एस्क्रो, FPO पूलिंग, कच्ची घाणी उत्पादने, बातम्या आणि डेमो लॉगिन. विचारा "उपज कशी विकू?", "एस्क्रो म्हणजे काय?" किंवा "FPO पूलिंग कशी काम करते?"।',
  ta: 'நான் அக்ரோ அசிஸ்டெண்ட்; அக்ரோலிங்கின் அனைத்திலும் உதவலாம் — பயிர் விற்பனை, வாங்குதல், சந்தை, மண்டி விலை & 6 மாத கணிப்புகள், தேவை, டெலிவரி, கட்டணம் & எஸ்க்ரோ, FPO திரட்டல், கச்சி கானி பொருட்கள், செய்திகள் & டெமோ லாகின். கேளுங்கள் "பயிரை எப்படி விற்பது?", "எஸ்க்ரோ என்றால் என்ன?"',
};

function detectChatLang(text) {
  const s = String(text);
  if (/[\u0B80-\u0BFF]/.test(s)) return 'ta';
  if (/[\u0A00-\u0A7F]/.test(s)) return 'pa';
  if (/[\u0900-\u097F]/.test(s)) {
    if (/(आहे|आणि|साठी|म्हणजे|शकता|मराठी|कसा|कसी|कसे|मला|बघा|विकू|पाहू|खरेदी|मोफत|विकणे|जिल्हा)/.test(s)) return 'mr';
    return 'hi';
  }
  return 'en';
}

function chatTokens(str) {
  return new Set(
    String(str)
      .toLowerCase()
      .split(/[^\p{Script=Latin}0-9\p{Script=Devanagari}\p{Script=Gurmukhi}\p{Script=Tamil}]+/u)
      .map((t) => t.replace(/[\u0964\u0965]/gu, ''))
      .filter((t) => t.length > 1)
  );
}

export const mockDb = {
  async listUsers() {
    await wait();
    return users.map(({ password: _pw, ...u }) => u);
  },

  async findByCredentials(email, password) {
    await wait(250);
    const user = users.find(
      (u) => (u.email.toLowerCase() === String(email).toLowerCase() || u.phone === email) && u.password === password
    );
    if (!user) throw new Error('Invalid email / phone or password');
    return stripPassword(user);
  },

  async registerUser({ name, email, phone, password, role }) {
    await wait(250);
    const existing = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
    if (existing) {
      if (existing.password === password) {
        return { session: stripPassword(existing), created: false };
      }
      throw new Error('An account already exists with this email');
    }
    const id = `u${nextUserId}`;
    nextUserId += 1;
    const user = { id, name, email, phone, password, role };
    users.push(user);
    return { session: stripPassword(user), created: true };
  },

  async sendRegistrationOtp({ email, phone }) {
    await wait(300);
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const requestId = `otp${nextOtpId}`;
    nextOtpId += 1;
    otpRequests.set(requestId, {
      otp,
      contact: `${email} :: ${phone}`,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });
    return {
      requestId,
      otp,
      maskedEmail: maskContact(email),
      maskedPhone: maskContact(phone),
      ttlSeconds: 300,
    };
  },

  async verifyRegistrationOtp(requestId, otp) {
    await wait(250);
    const req = otpRequests.get(requestId);
    if (!req || req.expiresAt < Date.now()) {
      otpRequests.delete(requestId);
      throw new Error('OTP expired. Please request a new one.');
    }
    if (String(otp ?? '').trim() !== req.otp) {
      throw new Error('Incorrect OTP. Please try again.');
    }
    otpRequests.delete(requestId);
    return { verified: true };
  },

  async findUserByEmail(email) {
    await wait();
    const user = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
    if (!user) return null;
    const { password: _, ...safe } = user;
    return safe;
  },

  async getUserProfile(userId) {
    await wait();
    const user = findById(users, userId, 'User');
    const safe = stripPassword(user);
    if (user.role === ROLES.CONSUMER) {
      const profile = consumerProfiles.find((c) => c.userId === userId);
      return { ...safe, profile };
    }
    if (user.role === ROLES.FARMER || user.role === ROLES.FPO) {
      const profile = producerProfiles.find((p) => p.userId === userId);
      return { ...safe, profile };
    }
    return safe;
  },

  async getProducerByUserId(userId) {
    await wait();
    const producer = producerProfiles.find((p) => p.userId === userId);
    if (!producer) throw new Error('Producer profile not found');
    return producer;
  },

  async getProducerById(producerId) {
    await wait();
    return findById(producerProfiles, producerId, 'Producer');
  },

  async getConsumerByUserId(userId) {
    await wait();
    const consumer = consumerProfiles.find((c) => c.userId === userId);
    if (!consumer) throw new Error('Consumer profile not found');
    return consumer;
  },

  async listProducts() {
    await wait();
    return products;
  },

  async listActiveProducts() {
    await wait();
    return products.filter((p) => p.status === 'ACTIVE').map(decorateProduct);
  },

  async searchProducts(params) {
    await wait();
    return searchProducts(params);
  },

  async getProduct(productId) {
    await wait();
    return decorateProduct(findById(products, productId, 'Product'));
  },

  async productsByProducer(producerId) {
    await wait();
    return filterByProducer(products, producerId);
  },

  async getCategories() {
    await wait(50);
    return [...new Set(products.map((p) => p.category))];
  },

  async trendingProducts() {
    await wait();
    return products
      .filter((p) => p.status === 'ACTIVE')
      .map(decorateProduct)
      .sort((a, b) => b.stockQuantity - a.stockQuantity)
      .slice(0, 6);
  },

  async listOrders({ role, userId, producerId } = {}) {
    await wait();
    if (producerId) return filterByProducer(orders, producerId);
    if (role === ROLES.CONSUMER) {
      const consumer = consumerProfiles.find((c) => c.userId === userId);
      if (!consumer) return [];
      return orders.filter((o) => o.consumerId === consumer.id);
    }
    if (role === ROLES.FARMER || role === ROLES.FPO) {
      const producer = producerProfiles.find((p) => p.userId === userId);
      if (!producer) return [];
      return filterByProducer(orders, producer.id);
    }
    return orders;
  },

  async getOrder(orderId) {
    await wait();
    return findById(orders, orderId, 'Order');
  },

  async createOrder(orderData) {
    await wait();
    const id = `o${Date.now()}`;
    const order = {
      id,
      orderNumber: `AGL-2026-${String(orders.length + 1).padStart(4, '0')}`,
      createdAt: new Date().toISOString(),
      status: 'PENDING',
      paymentStatus: 'PENDING',
      timeline: [{ status: 'PENDING', at: new Date().toISOString() }],
      ...orderData,
    };
    orders.unshift(order);
    return order;
  },

  async updateOrderStatus(orderId, status, { actor } = {}) {
    await wait();
    const order = findById(orders, orderId, 'Order');
    order.status = status;
    order.timeline = order.timeline ?? [];
    order.timeline.push({ status, at: new Date().toISOString(), note: actor ? `Actioned by ${actor}` : undefined });
    return order;
  },

  async listShipments() {
    await wait();
    return shipments;
  },

  async getShipment(shipmentId) {
    await wait();
    return findById(shipments, shipmentId, 'Shipment');
  },

  async shipmentForOrder(orderId) {
    await wait();
    return shipments.find((s) => s.orderId === orderId) ?? null;
  },

  async listVehicles() {
    await wait();
    return vehicles;
  },

  async listPayments({ role, userId, producerId } = {}) {
    await wait();
    if (producerId) return payments.filter((p) => p.producerId === producerId);
    if (role === ROLES.CONSUMER) {
      const consumer = consumerProfiles.find((c) => c.userId === userId);
      if (!consumer) return [];
      return payments.filter((p) => p.consumerId === consumer.id);
    }
    return payments;
  },

  async listFpoPurchases(producerId) {
    await wait();
    return orders.filter((o) => o.isFpoPurchase && o.consumerId === producerId);
  },

  async createPayment(paymentData) {
    await wait();
    const payment = {
      id: `pay${Date.now()}`,
      paymentId: `PAY-2026-${String(payments.length + 1).padStart(4, '0')}`,
      createdAt: new Date().toISOString(),
      status: 'COMPLETED',
      ...paymentData,
    };
    payments.push(payment);
    return payment;
  },

  async updateOrderPayment(orderId, status) {
    await wait();
    const order = findById(orders, orderId, 'Order');
    order.paymentStatus = status;
    return order;
  },

  async getPriceForecast(productId) {
    await wait();
    const forecast = priceForecasts[productId];
    if (!forecast) throw new Error(`No forecast available for product ${productId}`);
    return forecast;
  },

  async listDemandForecasts() {
    await wait();
    return demandForecasts;
  },

  async getProducerStat(producerId) {
    await wait(80);
    return producerStats[producerId] ?? { productsActive: 0, pendingOrders: 0, totalRevenue: 0, avgRating: 0, ordersThisMonth: 0 };
  },

  async askChatbot(question) {
    await wait(450);
    const lang = detectChatLang(question);
    const asked = chatTokens(question);
    const stop = new Set(CHAT_STOP[lang]);
    let best = null;
    let bestScore = 0;
    for (const item of chatbotKnowledge) {
      const row = item[lang];
      if (!row) continue;
      const tokens = [...chatTokens(row.q)].filter((w) => !stop.has(w));
      const score = tokens.reduce((n, w) => n + (asked.has(w) ? 1 : 0), 0);
      if (score > bestScore) {
        best = row;
        bestScore = score;
      }
    }
    if (best && bestScore > 0) return best.a;
    return CHAT_FALLBACK[lang];
  },

  async recentFees() {
    await wait(60);
    return { commission: 12.4, logistics: 8.2 };
  },
};