import 'server-only';

import { cache } from 'react';

import type { OwnerBrand } from '@/lib/seller-types';
import { authed, getSession } from '@/lib/session';

/** The signed-in owner's store (`brands/me`), once per request: the layout and the page share it. */
export const getMyBrand = cache(async () => {
  const { session } = await getSession();
  if (!session?.user.brand) return null;
  const res = await authed<OwnerBrand>('brands/me', session.token);
  return res.ok && res.data ? res.data : null;
});
