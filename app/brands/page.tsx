import type { Metadata } from 'next';

import { listingMetadata, StoreListing, type ListingSearchParams } from '@/components/stores/StoreListing';

export const metadata: Metadata = listingMetadata('BRAND');

export default function Page({ searchParams }: { searchParams: ListingSearchParams }) {
  return <StoreListing type="BRAND" searchParams={searchParams} />;
}
