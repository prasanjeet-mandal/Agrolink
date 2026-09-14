import * as React from 'react';
import { chatbotService } from '@/services/chatbotService';

const ChatbotContext = React.createContext(null);

export function ChatbotProvider({ children }) {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState([]);
  const [typing, setTyping] = React.useState(false);

  const sendMessage = React.useCallback(async (text) => {
    if (!text.trim()) return;
    const userMsg = { id: `m-${Date.now()}`, role: 'user', content: text, at: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);
    try {
      const reply = await chatbotService.sendMessage(text);
      const botMsg = { id: `m-${Date.now()}`, role: 'bot', content: reply.answer, at: new Date().toISOString() };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `m-${Date.now()}`, role: 'bot', content: 'Sorry, I could not reach the assistant right now.', at: new Date().toISOString() },
      ]);
    } finally {
      setTyping(false);
    }
  }, []);

  const reset = React.useCallback(() => {
    setMessages([]);
    setTyping(false);
  }, []);

  const value = React.useMemo(
    () => ({ open, setOpen, toggle: () => setOpen((o) => !o), messages, typing, sendMessage, reset }),
    [open, messages, typing, sendMessage, reset]
  );

  return <ChatbotContext.Provider value={value}>{children}</ChatbotContext.Provider>;
}

export function useChatbotContext() {
  const ctx = React.useContext(ChatbotContext);
  if (!ctx) throw new Error('useChatbotContext must be used within ChatbotProvider');
  return ctx;
}