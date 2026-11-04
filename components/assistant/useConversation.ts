'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { api, ApiError, errorMessage } from '@/lib/client-api';
import type { ProductCard } from '@/lib/types';

/**
 * One chat with a store's assistant. The visitor id and the last 30 messages live in localStorage
 * so a chat survives reloads; every storage call is guarded, so private windows still work (the
 * chat just isn't remembered).
 */

export type AssistantAction = 'login' | 'orders' | 'whatsapp' | 'open_app';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  products?: ProductCard[];
  actions?: AssistantAction[];
  unanswered?: boolean;
}

interface Reply {
  conversationId: string;
  reply: { text: string; products?: ProductCard[]; actions?: AssistantAction[]; unanswered?: boolean };
}

export type ChatErrorKind = 'store_limit' | 'visitor_limit' | 'disabled' | 'retry' | 'fatal';
export interface ChatError {
  kind: ChatErrorKind;
  message: string;
}

const VISITOR_KEY = 'fatrina.visitor';
const KEEP = 30;
const chatKey = (slug: string) => `fatrina.chat.${slug}`;
const VISITOR_RE = /^[A-Za-z0-9_.:-]{1,64}$/;

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* storage full or blocked: the chat just isn't remembered */
  }
}

const randomId = () => {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  } catch {
    /* insecure context */
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
};

let memoryVisitor: string | null = null;
function visitorId() {
  const saved = read(VISITOR_KEY);
  if (saved && VISITOR_RE.test(saved)) return saved;
  memoryVisitor ??= randomId();
  write(VISITOR_KEY, memoryVisitor);
  return memoryVisitor;
}

function loadChat(slug: string): { conversationId: string | null; messages: ChatMessage[] } {
  const raw = read(chatKey(slug));
  if (!raw) return { conversationId: null, messages: [] };
  try {
    const parsed = JSON.parse(raw) as { conversationId?: unknown; messages?: unknown };
    const messages = Array.isArray(parsed.messages)
      ? (parsed.messages as ChatMessage[]).filter((m) => m && typeof m.text === 'string' && (m.role === 'user' || m.role === 'assistant') && typeof m.id === 'string')
      : [];
    return { conversationId: typeof parsed.conversationId === 'string' ? parsed.conversationId : null, messages: messages.slice(-KEEP) };
  } catch {
    return { conversationId: null, messages: [] };
  }
}

function toChatError(e: unknown): ChatError {
  if (!(e instanceof ApiError)) return { kind: 'retry', message: 'حصلت مشكلة. جرّب تاني.' };
  if (e.code === 'ASSISTANT_DISABLED' || (e.status === 404 && e.code !== 'NETWORK')) return { kind: 'disabled', message: 'المساعد مش متاح دلوقتي.' };
  if (e.code === 'ASSISTANT_DAILY_LIMIT') {
    const reason = Array.isArray(e.details) ? (e.details[0] as { reason?: string } | undefined)?.reason : undefined;
    return reason === 'visitor'
      ? { kind: 'visitor_limit', message: 'وصلت لحد الرسايل النهارده، جرّب بكرة' }
      : { kind: 'store_limit', message: 'المساعد خد راحة النهارده، كلّم المتجر على واتساب' };
  }
  if (e.code === 'VALIDATION_ERROR') return { kind: 'fatal', message: 'الرسالة دي مينفعش تتبعت. جرّب تكتبها بشكل تاني.' };
  if (e.status === 503) return { kind: 'retry', message: 'المساعد مشغول شوية. جرّب كمان لحظة.' };
  return { kind: 'retry', message: errorMessage(e) };
}

export function useConversation(slug: string, productId?: string) {
  // The chat panel only mounts in the browser after a click, so reading storage here is safe.
  const [initial] = useState(() => loadChat(slug));
  const [messages, setMessages] = useState<ChatMessage[]>(initial.messages);
  const [conversationId, setConversationId] = useState<string | null>(initial.conversationId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ChatError | null>(null);
  /** True while a reply takes longer than usual, so the panel can say it's still working. */
  const [slow, setSlow] = useState(false);
  const slowTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const failedText = useRef<string | null>(null);
  const busyRef = useRef(false);
  const generation = useRef(0);

  useEffect(() => {
    if (!messages.length && !conversationId) write(chatKey(slug), null);
    else write(chatKey(slug), JSON.stringify({ conversationId, messages: messages.slice(-KEEP) }));
  }, [slug, messages, conversationId]);

  const request = useCallback(
    async (text: string): Promise<void> => {
      const gen = generation.current;
      busyRef.current = true;
      setBusy(true);
      setError(null);
      setSlow(false);
      clearTimeout(slowTimer.current);
      slowTimer.current = setTimeout(() => gen === generation.current && setSlow(true), 8_000);
      const body = {
        ...(conversationId ? { conversationId } : {}),
        visitorId: visitorId(),
        text,
        ...(productId ? { productId } : {}),
      };
      try {
        let res: Reply | undefined;
        // A busy model or a dropped connection usually clears in a moment: try once more quietly
        // before showing an error (the server refunds failed calls, so this costs no quota).
        for (let attempt = 0; !res; attempt++) {
          try {
            res = await api.post<Reply>(`brands/${encodeURIComponent(slug)}/assistant/messages`, body);
          } catch (e) {
            const transient = e instanceof ApiError && (e.status === 503 || e.status === 504 || e.code === 'NETWORK');
            if (!transient || attempt > 0 || gen !== generation.current) throw e;
            await new Promise((r) => setTimeout(r, 1_500));
          }
        }
        if (gen !== generation.current) return; // the chat was reset meanwhile
        const reply = res.reply;
        failedText.current = null;
        setConversationId(res.conversationId);
        setMessages((m) =>
          [
            ...m,
            {
              id: randomId(),
              role: 'assistant' as const,
              text: reply.text,
              products: reply.products?.slice(0, 6) ?? [],
              actions: reply.actions ?? [],
              unanswered: !!reply.unanswered,
            },
          ].slice(-KEEP),
        );
      } catch (e) {
        if (gen !== generation.current) return;
        const err = toChatError(e);
        failedText.current = err.kind === 'retry' ? text : null;
        setError(err);
      } finally {
        if (gen === generation.current) {
          clearTimeout(slowTimer.current);
          busyRef.current = false;
          setBusy(false);
          setSlow(false);
        }
      }
    },
    [slug, productId, conversationId],
  );

  const send = useCallback(
    (raw: string) => {
      const text = raw.trim().slice(0, 500);
      if (!text || busyRef.current) return false;
      setMessages((m) => [...m, { id: randomId(), role: 'user' as const, text }].slice(-KEEP));
      void request(text);
      return true;
    },
    [request],
  );

  const retry = useCallback(() => {
    const text = failedText.current;
    if (text && !busyRef.current) void request(text);
  }, [request]);

  const reset = useCallback(() => {
    generation.current += 1;
    failedText.current = null;
    busyRef.current = false;
    clearTimeout(slowTimer.current);
    setSlow(false);
    setBusy(false);
    setError(null);
    setMessages([]);
    setConversationId(null);
  }, []);

  return { messages, busy, slow, error, send, retry, reset };
}
