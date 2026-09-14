import { Bot } from 'lucide-react';
import { useChatbotContext } from '@/context/ChatbotContext';
import { PageHeader } from '@/components/common';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ChatWindow from './ChatWindow';

export default function Chatbot() {
  const { messages, typing, sendMessage, reset } = useChatbotContext();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agro Assistant"
        description="Ask about pricing, delivery, payments or produce on Agrolink."
        actions={
          messages.length ? (
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={reset}>
              Clear chat
            </Button>
          ) : null
        }
      />

      <Card className="mx-auto flex h-[70vh] max-w-3xl flex-col overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </span>
            Agro Assistant
          </CardTitle>
          <CardDescription>Trained on Agrolink farms, prices and routes.</CardDescription>
        </CardHeader>

        <div className="min-h-0 flex-1">
          <ChatWindow
            messages={messages}
            typing={typing}
            onSend={sendMessage}
          />
        </div>
      </Card>
    </div>
  );
}