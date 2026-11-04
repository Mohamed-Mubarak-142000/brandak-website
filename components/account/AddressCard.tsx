import { MapPin, Phone } from 'lucide-react';

import type { Address } from '@/lib/types';

import { formatPhone } from '@/components/auth/validation';

export const addressLine = (a: Pick<Address, 'street' | 'building' | 'floor' | 'apartment' | 'area' | 'city' | 'governorateName'>) =>
  [a.street, a.building && `عمارة ${a.building}`, a.floor && `الدور ${a.floor}`, a.apartment && `شقة ${a.apartment}`, a.area, a.city, a.governorateName]
    .filter(Boolean)
    .join('، ');

/** A saved address; `actions` sits at the end of the title row. */
export function AddressCard({ address, actions }: { address: Address; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 rounded-panel border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center gap-2">
        <MapPin aria-hidden className="size-4 text-accent" />
        <p className="font-bold">{address.label || 'عنوان'}</p>
        {address.isDefault ? <span className="rounded-full bg-sunken px-2 py-0.5 text-meta font-bold text-ink-2">الافتراضي</span> : null}
        {actions ? <div className="ms-auto flex items-center gap-1">{actions}</div> : null}
      </div>
      <p className="text-ui text-ink">{address.recipientName}</p>
      <p className="text-ui text-ink-2">{addressLine(address)}</p>
      {address.landmark ? <p className="text-meta text-ink-3">{address.landmark}</p> : null}
      <p className="mt-1 flex items-center gap-1.5 text-meta text-ink-3">
        <Phone aria-hidden className="size-3.5" />
        <bdi dir="ltr">{formatPhone(address.phone)}</bdi>
      </p>
    </div>
  );
}
