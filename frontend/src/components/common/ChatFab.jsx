import * as React from 'react';
import { Bot, X } from 'lucide-react';
import { useChatbotContext } from '@/context/ChatbotContext';
import ChatWindow from '@/pages/chatbot/ChatWindow';

const MARGIN = 12;
const FAB_SIZE = 56;
const WIDTH = 380;
const HEIGHT = 560;

const clamp = (v, min, max) => Math.min(Math.max(v, min), Math.max(min, max));

function fitToViewport(x, y, w, h) {
  if (typeof window === 'undefined') return { x, y };
  return {
    x: clamp(x, MARGIN, Math.max(window.innerWidth - w - MARGIN, MARGIN)),
    y: clamp(y, MARGIN, Math.max(window.innerHeight - h - MARGIN, MARGIN)),
  };
}

export default function ChatFab() {
  const { open, setOpen, messages, typing, sendMessage } = useChatbotContext();

  const [fabPos, setFabPos] = React.useState(() => ({
    x: (typeof window !== 'undefined' ? window.innerWidth : 1280) - FAB_SIZE - 24,
    y: (typeof window !== 'undefined' ? window.innerHeight : 800) - FAB_SIZE - 24,
  }));
  const [panelPos, setPanelPos] = React.useState(null);

  const fabPosRef = React.useRef(fabPos);
  const panelRef = React.useRef(null);
  const fabDrag = React.useRef(null);
  const panelDrag = React.useRef(null);

  const openPanel = React.useCallback(() => {
    setPanelPos((prev) => {
      if (prev) return prev;
      const from = fabPosRef.current;
      return fitToViewport(from.x + FAB_SIZE - WIDTH, from.y - HEIGHT, WIDTH, HEIGHT);
    });
    setOpen(true);
  }, [setOpen]);

  const startFabDrag = (e) => {
    if (e.button !== 0) return;
    fabDrag.current = {
      dx: e.clientX - fabPosRef.current.x,
      dy: e.clientY - fabPosRef.current.y,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onFabDrag = (e) => {
    const d = fabDrag.current;
    if (!d) return;
    if (!d.moved && Math.abs(e.clientX - d.startX) + Math.abs(e.clientY - d.startY) > 6) {
      d.moved = true;
    }
    if (d.moved) {
      const next = fitToViewport(e.clientX - d.dx, e.clientY - d.dy, FAB_SIZE, FAB_SIZE);
      fabPosRef.current = next;
      setFabPos(next);
    }
  };

  const endFabDrag = () => {
    const wasDrag = fabDrag.current?.moved;
    fabDrag.current = null;
    if (!wasDrag) openPanel();
  };

  const startPanelDrag = (e) => {
    if (e.button !== 0) return;
    if (e.target.closest?.('[data-no-drag]')) return;
    const rect = panelRef.current?.getBoundingClientRect();
    if (!rect) return;
    panelDrag.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPanelDrag = (e) => {
    const d = panelDrag.current;
    if (!d || !panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    setPanelPos(fitToViewport(e.clientX - d.dx, e.clientY - d.dy, rect.width, rect.height));
  };

  const endPanelDrag = () => { panelDrag.current = null; };

  return (
    <>
      {!open ? (
        <button
          type="button"
          onPointerDown={startFabDrag}
          onPointerMove={onFabDrag}
          onPointerUp={endFabDrag}
          onPointerCancel={endFabDrag}
          aria-label="Open agro assistant"
          className="fixed z-[90] flex touch-none select-none items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-700 text-white shadow-lg ring-2 ring-amber-400/50 transition-transform hover:scale-105"
          style={{ left: fabPos.x, top: fabPos.y, width: FAB_SIZE, height: FAB_SIZE }}
        >
          <Bot className="h-6 w-6" />
          <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 animate-pulse rounded-full bg-amber-400 ring-2 ring-background" />
        </button>
      ) : null}

      {open ? (
        <div
          ref={panelRef}
          style={{ left: panelPos?.x ?? fabPos.x + FAB_SIZE - WIDTH, top: panelPos?.y ?? fabPos.y - HEIGHT }}
          className="fixed z-[80] flex w-[min(380px,calc(100vw-1.5rem))] h-[min(560px,calc(100vh-7rem))] flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl"
        >
          <header
            onPointerDown={startPanelDrag}
            onPointerMove={onPanelDrag}
            onPointerUp={endPanelDrag}
            onPointerCancel={endPanelDrag}
            className="flex h-12 shrink-0 cursor-move touch-none select-none items-center justify-between border-b bg-gradient-to-r from-emerald-600 via-green-700 to-emerald-800 px-4 text-white"
          >
            <span className="flex items-center gap-2 text-sm font-bold">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                <Bot className="h-4 w-4" />
              </span>
              Agro Assistant
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              data-no-drag
              aria-label="Close chat"
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/15"
            >
              <X className="h-4 w-4" />
            </button>
          </header>
          <div className="min-h-0 flex-1">
            <ChatWindow messages={messages} typing={typing} onSend={sendMessage} />
          </div>
        </div>
      ) : null}
    </>
  );
}