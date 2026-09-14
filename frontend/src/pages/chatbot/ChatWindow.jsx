import * as React from 'react';
import { Loader2, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Message from './Message';
import SuggestionChips from './SuggestionChips';

export default function ChatWindow({ messages, typing, onSend }) {
  const [draft, setDraft] = React.useState('');
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const send = (text) => {
    const value = (text ?? draft).trim();
    if (!value || typing) return;
    onSend(value);
    setDraft('');
  };

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        {!messages.length ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <Sparkles className="h-8 w-8 text-primary" />
            <p className="max-w-sm text-sm text-muted-foreground">
              Hi! I can help you understand pricing, demand, delivery options and how to list or buy produce. Try a question below.
            </p>
            <SuggestionChips onPick={send} disabled={typing} />
          </div>
        ) : (
          <>
            {messages.map((m) => <Message key={m.id} message={m} />)}
            {typing ? (
              <div className="flex items-end gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" />
                </span>
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">thinking…</span>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>

      <div className="border-t p-3">
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') send();
            }}
            placeholder="e.g. How do I sell my produce?"
          />
          <Button size="icon" onClick={() => send()} disabled={!draft.trim() || typing} aria-label="Send message">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Agro Assistant supports pricing, demand, delivery and payments questions.
        </p>
      </div>
    </div>
  );
}