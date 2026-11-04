import { AppPerks } from '@/components/AppPerks';
import { Container } from '@/components/Container';
import { CampaignCards } from '@/components/home/CampaignCards';
import { HeroBanner } from '@/components/home/HeroBanner';
import { HomeSearch } from '@/components/home/HomeSearch';
import { HowItWorks } from '@/components/home/HowItWorks';
import { SectionsMarquee } from '@/components/home/SectionsMarquee';
import { SellerCta } from '@/components/home/SellerCta';
import { StoreLogos } from '@/components/home/StoreLogos';
import { StoreTypeFronts } from '@/components/home/StoreTypeFronts';
import { ProductGrid } from '@/components/ProductCard';
import { SectionHeader } from '@/components/SectionHeader';
import { getBrands, getCampaigns, getCategories, getFeaturedProducts, getProducts, getTerms } from '@/lib/api';
import { STORE_TYPES } from '@/lib/store-types';
import type { StoreType } from '@/lib/types';

export default async function Home() {
  const [featured, newest, categories, stores, campaigns, terms, typeCounts] = await Promise.all([
    getFeaturedProducts(),
    getProducts({ sort: 'newest', limit: 10 }),
    getCategories(),
    getBrands({ limit: 24 }),
    getCampaigns(),
    getTerms(),
    Promise.all(STORE_TYPES.map((t) => getBrands({ storeType: t.type, limit: 1 }).then((r) => r.total))),
  ]);
  const showcase = featured.length ? featured.slice(0, 10) : newest.items;

  const counts = Object.fromEntries(STORE_TYPES.map((t, i) => [t.type, typeCounts[i]])) as Record<StoreType, number>;
  const sections = categories
    .filter((c) => (c.level ?? (c.parentId ? 1 : 0)) === 0 && c.isActive !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <Container className="space-y-16 pb-16 sm:space-y-20 sm:pb-20">
      <div>
        <HeroBanner campaigns={campaigns} commissionRate={terms.commissionRate} />
        <div className="mt-10 sm:mt-14">
          <HomeSearch sections={sections} />
        </div>
      </div>

      <StoreTypeFronts counts={counts} />
      <SectionsMarquee sections={sections} />

      {showcase.length ? (
        <section>
          <SectionHeader
            title={featured.length ? 'مختارات من فاترينة' : 'وصل جديد'}
            body={featured.length ? 'منتجات اخترناها لك من المتاجر.' : 'آخر المنتجات اللي نزلت في المتاجر.'}
            href="/search"
            linkLabel="كل المنتجات"
          />
          <ProductGrid products={showcase} />
        </section>
      ) : null}

      <StoreLogos stores={stores.items} />
      <CampaignCards campaigns={campaigns} />
      <HowItWorks />
      <AppPerks />
      <SellerCta commissionRate={terms.commissionRate} />
    </Container>
  );
}
