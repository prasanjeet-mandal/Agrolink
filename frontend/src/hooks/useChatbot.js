import { useChatbotContext } from '@/context/ChatbotContext';

export function useChatbot() {
  const { open, setOpen, toggle, messages, typing, sendMessage, reset } = useChatbotContext();
  return { open, setOpen, toggle, messages, typing, sendMessage, reset };
}