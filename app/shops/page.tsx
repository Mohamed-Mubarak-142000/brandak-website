import type { Metadata } from 'next';

import { listingMetadata, StoreListing, type ListingSearchParams } from '@/components/stores/StoreListing';

export const metadata: Metadata = listingMetadata('SHOP');

export default function Page({ searchParams }: { searchParams: ListingSearchParams }) {
  return <StoreListing type="SHOP" searchParams={searchParams} />;
}
