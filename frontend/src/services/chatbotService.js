import { mockDb, MOCK_MODE } from '@/mocks/db';
import { httpPost } from '@/api/client';
import { API } from '@/constants/apiEndpoints';

export const chatbotService = {
  async sendMessage(question) {
    if (!MOCK_MODE) return httpPost(API.AI.CHAT, { question });
    const answer = await mockDb.askChatbot(question);
    return {
      id: `chat-${Date.now()}`,
      question,
      answer,
      confidence: 0.9,
    };
  },
};