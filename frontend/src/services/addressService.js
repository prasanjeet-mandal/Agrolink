import { httpGet, httpPost } from '@/api/client';
import { API } from '@/constants/apiEndpoints';
import { toAddress, fromAddress } from '@/services/normalize';

export const addressService = {
  async list() {
    const res = await httpGet(API.ADDRESSES.BASE);
    return res.map(toAddress);
  },

  async create(address) {
    const res = await httpPost(API.ADDRESSES.BASE, fromAddress(address));
    return toAddress(res);
  },

  async findOrCreate(address) {
    const current = await this.list().catch(() => []);
    const match = current.find(
      (a) =>
        (a.pincode || '').toLowerCase() === String(address.pincode ?? '').toLowerCase() &&
        (a.city || '').toLowerCase() === String(address.city ?? '').toLowerCase()
    );
    if (match) return match;
    return this.create(address);
  },
};