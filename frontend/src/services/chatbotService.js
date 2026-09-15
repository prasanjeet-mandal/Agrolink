import { httpPost } from '@/api/client';
import { API } from '@/constants/apiEndpoints';

export const chatbotService = {
  async sendMessage(question) {
    const res = await httpPost(API.AI.CHAT, { question });
    return {
      id: `chat-${Date.now()}`,
      question,
      answer: res?.answer ?? res?.response ?? res?.message ?? '',
      confidence: 0.9,
    };
  },
};