/**
 * Where the site sends people. Buying happens in the app: every "order" action opens the same
 * screen there through the `fatrina://` scheme (app.json), or Google Play when it isn't installed.
 */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fatrina.app').replace(/\/$/, '');

export const ANDROID_PACKAGE = 'app.fatrina';
export const PLAY_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
export const SUPPORT_EMAIL = 'mohamedmubarak142000m@gmail.com';

/** A screen in the app, written as the path after `fatrina://` (e.g. "product/123"). */
export type AppPath = string;

export const appPath = {
  home: '',
  product: (id: string) => `product/${id}`,
  brand: (slug: string) => `brand/${slug}`,
  category: (id: string) => `category/${id}`,
  offers: 'offers',
  orders: 'orders',
  sell: 'seller/apply',
};

export const deepLink = (path: AppPath) => `fatrina://${path}`;

/**
 * Android Chrome opens the app from an intent URL and falls back to Play on its own when the app
 * isn't installed — no timers or guessing needed.
 */
export const androidIntent = (path: AppPath) =>
  `intent://${path}#Intent;scheme=fatrina;package=${ANDROID_PACKAGE};S.browser_fallback_url=${encodeURIComponent(PLAY_URL)};end`;

/** The download page, remembering which app screen to open after install (shown as a QR). */
export const downloadHref = (path?: AppPath) => (path ? `/download?open=${encodeURIComponent(path)}` : '/download');
