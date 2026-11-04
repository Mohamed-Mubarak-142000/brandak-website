import { AppPerks } from '@/components/AppPerks';
import { Container } from '@/components/Container';
import { CampaignCards } from '@/components/home/CampaignCards';
import { CategoryRail } from '@/components/home/CategoryRail';
import { Hero } from '@/components/home/Hero';
import { HowItWorks } from '@/components/home/HowItWorks';
import { SellerCta } from '@/components/home/SellerCta';
import { StoreTypeFronts } from '@/components/home/StoreTypeFronts';
import { TrustStrip } from '@/components/home/TrustStrip';
import { ProductGrid } from '@/components/ProductCard';
import { SectionHeader } from '@/components/SectionHeader';
import { StoreGrid } from '@/components/StoreCard';
import { getBrands, getCampaigns, getCategories, getFeaturedProducts, getProducts, getTerms } from '@/lib/api';
import { STORE_TYPES } from '@/lib/store-types';
import type { StoreType } from '@/lib/types';

export default async function Home() {
  const [newest, featured, categories, stores, campaigns, terms, ...typeCounts] = await Promise.all([
    getProducts({ sort: 'newest', limit: 10 }),
    getFeaturedProducts(),
    getCategories(),
    getBrands({ sort: 'rating', limit: 6 }),
    getCampaigns(),
    getTerms(),
    ...STORE_TYPES.map((t) => getBrands({ storeType: t.type, limit: 1 }).then((r) => r.total)),
  ]);

  const counts = Object.fromEntries(STORE_TYPES.map((t, i) => [t.type, typeCounts[i] as number])) as Record<StoreType, number>;
  const sections = categories
    .filter((c) => (c.level ?? 0) === 0 && !c.parentId && c.isActive !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const showcase = featured.length ? featured : newest.items;

  return (
    <>
      <Hero products={newest.items} />
      <TrustStrip />

      <Container className="mt-14 space-y-16 sm:mt-20 sm:space-y-24">
        <StoreTypeFronts counts={counts} />
        <CategoryRail categories={sections} />

        {showcase.length ? (
          <section>
            <SectionHeader
              title={featured.length ? 'مختارات من فاترينة' : 'وصل جديد'}
              body={featured.length ? undefined : 'آخر المنتجات اللي نزلت في المتاجر.'}
              href={featured.length ? '/offers' : '/search'}
            />
            <ProductGrid products={showcase.slice(0, 10)} />
          </section>
        ) : null}

        {stores.items.length ? (
          <section>
            <SectionHeader title="اتفرّج على المتاجر" href="/stores" linkLabel="كل المتاجر" />
            <StoreGrid stores={stores.items} />
          </section>
        ) : null}

        <CampaignCards campaigns={campaigns} />
        <HowItWorks />
        <AppPerks />
        <SellerCta commissionRate={terms.commissionRate} />
      </Container>
    </>
  );
}
