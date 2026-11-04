'use client';

import { useSyncExternalStore } from 'react';

import { CART_CHANGED, notifyCartChanged, SESSION_CHANGED } from '@/components/header/AccountNav';
import { api, ApiError, looksSignedIn } from '@/lib/client-api';
import type { CartSummary, CartView, PricedLine } from '@/lib/types';

/*
 * What's in the visitor's carts, by product, shared by every product card on the page (so a card
 * can turn its "add" button into − n +). Loaded once (`carts` then each store's cart), reloaded
 * when anything announces a cart change, and updated in place after the cards' own edits.
 */
export type Line = PricedLine & { brandId: string };
type Status = 'idle' | 'loading' | 'ready' | 'out' | 'seller';

let byProduct = new Map<string, Line[]>();
let status: Status = 'idle';
let version = 0;
let selfChange = false;
const listeners = new Set<() => void>();
let watching = false;

function emit() {
  version++;
  listeners.forEach((l) => l());
}

function index(views: CartView[]) {
  const next = new Map<string, Line[]>();
  for (const v of views) {
    for (const item of v.items) {
      const list = next.get(item.productId) ?? [];
      list.push({ ...item, brandId: v.brand.id });
      next.set(item.productId, list);
    }
  }
  return next;
}

/** Replaces one store's lines with a fresh cart view from the API. */
function applyView(brandId: string, view: CartView | null) {
  const next = new Map<string, Line[]>();
  for (const [pid, lines] of byProduct) {
    const kept = lines.filter((l) => l.brandId !== brandId);
    if (kept.length) next.set(pid, kept);
  }
  if (view) for (const [pid, lines] of index([view])) next.set(pid, [...(next.get(pid) ?? []), ...lines]);
  byProduct = next;
  emit();
}

async function load() {
  if (!looksSignedIn()) {
    status = 'out';
    byProduct = new Map();
    emit();
    return;
  }
  status = 'loading';
  try {
    const carts = (await api.get<CartSummary[]>('carts')) ?? [];
    const views = await Promise.all(carts.map((c) => api.get<CartView>(`carts/${c.brand.id}`).catch(() => null)));
    byProduct = index(views.filter((v): v is CartView => !!v));
    status = 'ready';
  } catch (e) {
    byProduct = new Map();
    status = e instanceof ApiError && e.code === 'SELLER_ACCOUNT' ? 'seller' : e instanceof ApiError && e.status === 401 ? 'out' : 'ready';
  }
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!watching) {
    watching = true;
    window.addEventListener(CART_CHANGED, () => {
      // Our own edits already updated the store; others (product page, cart page) need a reload.
      if (selfChange) return;
      void load();
    });
    window.addEventListener(SESSION_CHANGED, () => void load());
    void load();
  }
  return () => listeners.delete(cb);
}

function announce() {
  selfChange = true;
  notifyCartChanged();
  selfChange = false;
}

export const cartLines = {
  async add(productId: string, brandId: string, variantId: string, quantity: number) {
    const view = await api.post<CartView>(`carts/${brandId}/items`, { productId, variantId, quantity });
    applyView(brandId, view);
    announce();
  },
  async setQuantity(line: Line, quantity: number) {
    const view = await api.patch<CartView>(`carts/${line.brandId}/items/${line.itemId}`, { quantity });
    applyView(line.brandId, view);
    announce();
  },
  async remove(line: Line) {
    const view = await api.delete<CartView | null>(`carts/${line.brandId}/items/${line.itemId}`);
    applyView(line.brandId, view ?? null);
    announce();
  },
};

/** This product's lines in the cart, plus whether the visitor can shop at all. */
export function useCartLines(productId: string) {
  useSyncExternalStore(subscribe, () => version, () => 0);
  return { status, lines: byProduct.get(productId) ?? [] };
}
