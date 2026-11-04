import type { Metadata } from 'next';

import { AddressesManager } from '@/components/account/AddressesManager';
import { LoadError, PageTitle } from '@/components/account/PageTitle';
import { authed, requireSession } from '@/lib/session';
import type { Address } from '@/lib/types';

export const metadata: Metadata = {
  title: 'العناوين',
  robots: { index: false, follow: false },
};

export default async function AddressesPage() {
  const { user, token } = await requireSession('/account/addresses');
  const res = await authed<Address[]>('addresses/me', token);

  return (
    <>
      <PageTitle title="العناوين" body="عناوين التوصيل بتاعتك. الافتراضي بيتختار لوحده وقت الطلب." />
      {res.ok && res.data ? <AddressesManager initial={res.data} me={{ name: user.name, phone: user.phone }} /> : <LoadError what="عناوينك" retryHref="/account/addresses" />}
    </>
  );
}
