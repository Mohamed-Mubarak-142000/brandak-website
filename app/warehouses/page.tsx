import type { Metadata } from 'next';

import { listingMetadata, StoreListing, type ListingSearchParams } from '@/components/stores/StoreListing';

export const metadata: Metadata = listingMetadata('WAREHOUSE');

export default function Page({ searchParams }: { searchParams: ListingSearchParams }) {
  return <StoreListing type="WAREHOUSE" searchParams={searchParams} />;
}
