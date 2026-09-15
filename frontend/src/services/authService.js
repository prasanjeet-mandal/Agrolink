import { httpPost, httpGet } from '@/api/client';
import { API } from '@/constants/apiEndpoints';
import { toSession, toUser, toUserProfile } from '@/services/normalize';

export const authService = {
  async login(credentials) {
    const res = await httpPost(API.AUTH.LOGIN, { email: credentials.email, password: credentials.password });
    return toSession(res);
  },

  async register(payload, otpToken) {
    const body = {
      fullName: payload.name,
      email: payload.email,
      phone: payload.phone,
      password: payload.password,
      role: payload.role,
    };
    if (payload.role === 'DELIVERY_PARTNER') {
      body.vehicleNumber = payload.vehicleNumber;
      body.drivingLicense = payload.drivingLicense;
    }
    if (otpToken) body.otpToken = otpToken;
    const res = await httpPost(API.AUTH.REGISTER, body);
    return toSession(res);
  },

  async sendRegistrationOtp(payload) {
    return httpPost(API.AUTH.SEND_OTP, { email: payload.email, phone: payload.phone });
  },

  async verifyRegistrationOtp(requestId, code, payload) {
    return httpPost(API.AUTH.VERIFY_OTP, {
      requestId,
      phone: payload.phone,
      code,
      email: payload.email,
    });
  },

  async me() {
    const res = await httpGet(API.AUTH.ME);
    return toUser(res);
  },

  async getFullProfile() {
    const res = await httpGet(API.USERS.ME);
    return toUserProfile(res);
  },

  async forgotPassword(email) {
    return httpPost(API.AUTH.FORGOT_PASSWORD, { email });
  },

  async resetPassword(token, password) {
    return httpPost(API.AUTH.RESET_PASSWORD, { token, password });
  },
};