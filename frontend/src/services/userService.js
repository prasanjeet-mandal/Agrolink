import { mockDb, MOCK_MODE } from '@/mocks/db';
import { httpGet } from '@/api/client';
import { API } from '@/constants/apiEndpoints';

export const userService = {
  async getProfile(userId) {
    if (!MOCK_MODE) return httpGet(`${API.USERS.PROFILE}/${userId}`);
    return mockDb.getUserProfile(userId);
  },
};