'use client';

import { useCallback, useState, useSyncExternalStore } from 'react';

import { aiError, retryable } from '@/components/seller/assistant/errors';
import { ApiError, api } from '@/lib/client-api';

export interface CopilotMsg {
  key: string;
  role: 'user' | 'assistant';
  text: string;
  at: string;
}
interface Thread {
  conversationId?: string;
  messages: CopilotMsg[];
}
interface CopilotReply {
  conversationId: string;
  reply: { text: string };
}

const EMPTY: Thread = { messages: [] };
const MAX_KEPT = 60;
const storageKey = (brandId: string) => `fatrina:copilot:${brandId}`;

/**
 * One chat per store, kept in localStorage (when the browser allows it) and shared by the full page
 * and the floating dock through this tiny store.
 */
const cache = new Map<string, Thread>();
const listeners = new Set<() => void>();

function read(brandId: string): Thread {
  const hit = cache.get(brandId);
  if (hit) return hit;
  let thread = EMPTY;
  try {
    const raw = window.localStorage.getItem(storageKey(brandId));
    const parsed = raw ? (JSON.parse(raw) as Thread) : null;
    if (parsed && Array.isArray(parsed.messages)) thread = { conversationId: parsed.conversationId, messages: parsed.messages.filter((m) => m && typeof m.text === 'string') };
  } catch {
    // Private mode / blocked storage: start empty.
  }
  cache.set(brandId, thread);
  return thread;
}

function write(brandId: string, next: Thread) {
  const kept = { conversationId: next.conversationId, messages: next.messages.slice(-MAX_KEPT) };
  cache.set(brandId, kept);
  try {
    if (!kept.messages.length && !kept.conversationId) window.localStorage.removeItem(storageKey(brandId));
    else window.localStorage.setItem(storageKey(brandId), JSON.stringify(kept));
  } catch {
    // Not saved; the chat still works for this visit.
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (!e.key?.startsWith('fatrina:copilot:')) return;
    cache.delete(e.key.slice('fatrina:copilot:'.length));
    l();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener('storage', onStorage);
  };
}

const rid = () => Math.random().toString(36).slice(2, 12);

export interface CopilotError {
  text: string;
  /** The message that failed, to send again. */
  retry: string | null;
}

/** The copilot chat for a store: messages, sending, errors (429 daily limit, 503 busy → retry). */
export function useCopilot(brandId: string | null) {
  const thread = useSyncExternalStore(
    subscribe,
    () => (brandId ? read(brandId) : EMPTY),
    () => EMPTY,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<CopilotError | null>(null);
  /** The latest reply, for the screen-reader live region. */
  const [announce, setAnnounce] = useState('');

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim().slice(0, 1000);
      if (!text || !brandId || busy) return false;
      setError(null);
      const start = read(brandId);
      const userMsg: CopilotMsg = { key: rid(), role: 'user', text, at: new Date().toISOString() };
      write(brandId, { ...start, messages: [...start.messages, userMsg] });
      setBusy(true);
      setAnnounce('');
      try {
        const res = await api.post<CopilotReply>('brand/copilot/messages', { conversationId: start.conversationId, text });
        const now = read(brandId);
        write(brandId, { conversationId: res.conversationId, messages: [...now.messages, { key: rid(), role: 'assistant', text: res.reply.text, at: new Date().toISOString() }] });
        setAnnounce(res.reply.text);
        return true;
      } catch (e) {
        // Take the unanswered message back out; the error offers to send it again.
        const now = read(brandId);
        write(brandId, { ...now, messages: now.messages.filter((m) => m.key !== userMsg.key) });
        const limit = e instanceof ApiError && e.code === 'COPILOT_DAILY_LIMIT';
        setError({ text: aiError(e, 'مساعدك مردّش. جرّب تاني.'), retry: !limit && retryable(e) ? text : null });
        return false;
      } finally {
        setBusy(false);
      }
    },
    [brandId, busy],
  );

  const reset = useCallback(() => {
    if (!brandId) return;
    write(brandId, EMPTY);
    setError(null);
    setAnnounce('');
  }, [brandId]);

  return { messages: thread.messages, busy, error, announce, send, reset, dismissError: () => setError(null) };
}
