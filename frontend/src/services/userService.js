import { httpGet } from '@/api/client';
import { API } from '@/constants/apiEndpoints';
import { ROLES } from '@/constants/roles';
import { toUserProfile, toProducerProfile } from '@/services/normalize';

export const userService = {
  async getProfile(_userId) {
    const res = await httpGet(API.USERS.ME);
    const base = toUserProfile(res);
    if (base.role === ROLES.FARMER || base.role === ROLES.FPO) {
      const producer = await httpGet(API.USERS.ME_PROFILE);
      return { ...base, profile: toProducerProfile(producer) };
    }
    return base;
  },
};