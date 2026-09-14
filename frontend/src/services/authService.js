import { mockDb, MOCK_MODE } from '@/mocks/db';
import { httpPost, httpGet } from '@/api/client';
import { API } from '@/constants/apiEndpoints';

export const authService = {
  async login(credentials) {
    if (!MOCK_MODE) {
      const res = await httpPost(API.AUTH.LOGIN, credentials);
      return res;
    }
    const user = await mockDb.findByCredentials(credentials.email ?? credentials.phone, credentials.password);
    return {
      token: `mock-jwt-${user.id}-${Date.now()}`,
      user,
    };
  },

  async register(payload) {
    if (!MOCK_MODE) return httpPost(API.AUTH.REGISTER, payload);
    const { session } = await mockDb.registerUser(payload);
    return { token: `mock-jwt-${session.id}-${Date.now()}`, user: session };
  },

  async sendRegistrationOtp(payload) {
    if (!MOCK_MODE) return httpPost(API.AUTH.SEND_OTP, payload);
    return mockDb.sendRegistrationOtp(payload);
  },

  async verifyRegistrationOtp(requestId, otp) {
    if (!MOCK_MODE) return httpPost(API.AUTH.VERIFY_OTP, { requestId, otp });
    return mockDb.verifyRegistrationOtp(requestId, otp);
  },

  async me() {
    if (!MOCK_MODE) return httpGet(API.AUTH.ME);
    const stored = localStorage.getItem('agrolink_user');
    if (!stored) throw new Error('Not authenticated');
    const basic = JSON.parse(stored);
    return mockDb.getUserProfile(basic.user?.id ?? basic.id);
  },

  async forgotPassword(email) {
    if (!MOCK_MODE) return httpPost(API.AUTH.FORGOT_PASSWORD, { email });
    const user = await mockDb.findUserByEmail(email);
    if (!user) throw new Error('No account found for that email');
    return { message: 'Reset link has been sent to your email (mock)' };
  },

  async resetPassword(token, password) {
    if (!MOCK_MODE) return httpPost(API.AUTH.RESET_PASSWORD, { token, password });
    return { message: 'Password updated (mock)' };
  },
};