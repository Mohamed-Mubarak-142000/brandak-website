'use client';

import { useSyncExternalStore } from 'react';

import { loginHref, shopError } from '@/components/checkout/errors';
import { notifyCartChanged } from '@/components/header/AccountNav';
import { api, ApiError, looksSignedIn } from '@/lib/client-api';
import type { CartView, ProductDetail, Variant } from '@/lib/types';

/**
 * What the visitor picked on a product page, shared by the purchase card and the sticky bar on
 * phones (both can add to the cart). One small store per product, kept outside React.
 */
export interface PurchaseState {
  size: string | null;
  color: string | null;
  /** null until the stepper is touched: a wholesale product then starts at what's still needed. */
  qty: number | null;
  /** The visitor tried to add without choosing a size/colour. */
  missing: boolean;
  busy: boolean;
  error: string | null;
  /** Show the "added" toast. */
  added: boolean;
  /** Pieces of this product already in the cart (wholesale minimums count them). */
  inCart: number;
}

const initial: PurchaseState = { size: null, color: null, qty: null, missing: false, busy: false, error: null, added: false, inCart: 0 };
const stores = new Map<string, { state: PurchaseState; listeners: Set<() => void> }>();

function storeOf(id: string) {
  let s = stores.get(id);
  if (!s) {
    s = { state: initial, listeners: new Set() };
    stores.set(id, s);
  }
  return s;
}

export function setPurchase(id: string, patch: Partial<PurchaseState>) {
  const s = storeOf(id);
  s.state = { ...s.state, ...patch };
  s.listeners.forEach((l) => l());
}

export function usePurchaseState(id: string) {
  return useSyncExternalStore(
    (cb) => {
      const s = storeOf(id);
      s.listeners.add(cb);
      return () => s.listeners.delete(cb);
    },
    () => storeOf(id).state,
    () => initial,
  );
}

const uniq = (xs: (string | null)[]) => [...new Set(xs.filter((x): x is string => !!x))];
export const buyable = (v: Variant) => v.inStock && v.available > 0;

/** Everything derived from the choice: variant, availability, quantity limits, price. */
export function derive(product: ProductDetail, s: PurchaseState) {
  const variants = product.variants;
  const sizes = uniq(variants.map((v) => v.size));
  const colors = uniq(variants.map((v) => v.color));
  const match = (size: string | null, color: string | null) =>
    variants.find((v) => (sizes.length ? v.size === size : true) && (colors.length ? v.color === color : true));
  const selected = variants.length === 1 ? variants[0] : match(s.size, s.color);
  // Sold out everywhere → disabled; sold out only with the other current choice → still pickable (it clears that choice).
  const sizeEver = (x: string) => variants.some((v) => v.size === x && buyable(v));
  const colorEver = (x: string) => variants.some((v) => v.color === x && buyable(v));
  const sizeWith = (x: string) => variants.some((v) => v.size === x && buyable(v) && (!s.color || !colors.length || v.color === s.color));
  const colorWith = (x: string) => variants.some((v) => v.color === x && buyable(v) && (!s.size || !sizes.length || v.size === s.size));

  const minQty = product.wholesale?.minQty ?? 1;
  const stillNeeded = Math.max(0, minQty - s.inCart);
  const cap = product.wholesale ? 1000 : 20;
  const max = Math.max(1, Math.min(selected && buyable(selected) ? selected.available : cap, cap));
  const qty = Math.max(1, Math.min(s.qty ?? Math.max(1, stillNeeded), max));
  // Wholesale: the best tier the quantity reaches (all sizes together, as at checkout).
  const tier = [...(product.wholesale?.tiers ?? [])].sort((a, b) => a.minQty - b.minQty).reverse().find((t) => qty + s.inCart >= t.minQty);
  const regular = selected?.price ?? product.price;
  const unitPrice = tier && tier.price < regular ? tier.price : regular;
  const soldOut = !product.inStock || !variants.some(buyable) || (!!selected && !buyable(selected));
  const needsChoice = !selected;

  return { sizes, colors, selected, sizeEver, colorEver, sizeWith, colorWith, match, minQty, stillNeeded, max, qty, unitPrice, regular, tiered: unitPrice < regular, total: unitPrice * qty, soldOut, needsChoice };
}

export function usePurchase(product: ProductDetail) {
  const state = usePurchaseState(product.id);
  return { state, ...derive(product, state) };
}

export const OPTIONS_ID = 'purchase-options';

let toastTimer: ReturnType<typeof setTimeout> | undefined;

/**
 * Adds the chosen variant. Not signed in → the login page, back here after. Without a choice it
 * flags the options and scrolls to them. `buyNow` goes straight to this store's checkout.
 */
export async function addToCart(product: ProductDetail, navigate: (href: string) => void, buyNow = false) {
  const id = product.id;
  const s = storeOf(id).state;
  if (s.busy) return;
  const here = `/product/${id}`;
  if (!looksSignedIn()) return navigate(loginHref(here));
  const d = derive(product, s);
  if (d.needsChoice) {
    setPurchase(id, { missing: true, error: null });
    document.getElementById(OPTIONS_ID)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  if (d.soldOut || !d.selected) return;
  setPurchase(id, { busy: true, error: null, added: false });
  try {
    const view = await api.post<CartView>(`carts/${product.brand.id}/items`, { productId: id, variantId: d.selected.id, quantity: d.qty });
    const inCart = view.items.filter((i) => i.productId === id).reduce((n, i) => n + i.quantity, 0);
    notifyCartChanged();
    if (buyNow) {
      setPurchase(id, { busy: false, inCart, qty: null });
      navigate(`/checkout/${product.brand.id}`);
      return;
    }
    setPurchase(id, { busy: false, inCart, qty: null, added: true });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => setPurchase(id, { added: false }), 6000);
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) {
      setPurchase(id, { busy: false });
      return navigate(loginHref(here));
    }
    setPurchase(id, { busy: false, error: shopError(e, 'معرفناش نضيفه للسلة. جرّب تاني.') });
  }
}

/** Wholesale: how many of this product are already in the cart, so the minimum counts them. */
export async function loadInCart(product: ProductDetail) {
  if (!product.wholesale || !looksSignedIn()) return;
  try {
    const view = await api.get<CartView>(`carts/${product.brand.id}`);
    setPurchase(product.id, { inCart: view.items.filter((i) => i.productId === product.id).reduce((n, i) => n + i.quantity, 0) });
  } catch {
    // No cart yet (or a store account): nothing counted.
  }
}
