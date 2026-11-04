import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { btn } from '@/components/auth/fields';
import { nationalPhone } from '@/components/auth/validation';
import { Container } from '@/components/Container';
import { ApplyForm } from '@/components/seller/apply/ApplyForm';
import { getMyBrand } from '@/components/seller/data';
import { StatusBanner } from '@/components/seller/StatusBanner';
import { getCategories, getTerms } from '@/lib/api';
import { num, percent } from '@/lib/format';
import { requireSession } from '@/lib/session';

export const metadata: Metadata = {
  title: 'افتح متجرك',
  robots: { index: false, follow: false },
};

export default async function ApplyPage() {
  const { user } = await requireSession('/seller/apply');

  // Already owns a store: show where it stands instead of a second application.
  if (user.brand) {
    const brand = await getMyBrand();
    // The layout frames the page when it could load the store; otherwise frame it here.
    const content = (
      <div className="flex flex-col gap-5">
        <h1 className="text-page font-extrabold">{brand ? brand.name : 'متجرك'}</h1>
        {brand ? <StatusBanner brand={brand} /> : null}
        <div className="rounded-panel border border-line bg-surface p-5">
          <p className="font-bold">عندك متجر على فاترينة بالفعل.</p>
          <p className="mt-1 text-ui text-ink-2">كل حساب بيدير متجر واحد. كمّل من لوحة متجرك.</p>
          <Link href="/seller" className={`${btn.primary} mt-4`}>
            لوحة متجري
            <ArrowLeft aria-hidden className="size-4" />
          </Link>
        </div>
      </div>
    );
    return brand ? content : <Container className="py-6 sm:py-10">{content}</Container>;
  }

  const [categories, terms] = await Promise.all([getCategories(), getTerms()]);

  return (
    <Container className="py-6 sm:py-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="min-w-0">
          <h1 className="text-page font-extrabold">افتح متجرك على فاترينة</h1>
          <p className="mt-1 mb-6 text-ui text-ink-2 sm:text-body">
            عندك معرض أو مخزن أو محل أو براند؟ وصّل منتجاتك لعملاء في كل محافظات مصر، والدفع كاش عند الاستلام.
          </p>
          <ApplyForm categories={categories.filter((c) => !c.parentId)} terms={terms} defaults={{ phone: nationalPhone(user.phone), email: user.email }} />
        </div>
        <aside aria-label="الخطوات" className="rounded-panel border border-line bg-surface p-5 lg:sticky lg:top-45">
          <h2 className="font-extrabold">إزاي بتشتغل</h2>
          <ol className="mt-4 flex flex-col gap-4">
            {[
              ['قدّم بيانات نشاطك', 'الاسم والأقسام وطرق التواصل والصور'],
              ['فريقنا يراجع الطلب', 'عادةً خلال يوم عمل، وهيوصلك إشعار'],
              [`ادفع ${percent(terms.commissionRate)} بس لما تبيع`, 'مفيش اشتراك ولا رسوم فتح متجر'],
              ['ابدأ تبيع', 'ضيف منتجاتك واستقبل الطلبات من هنا أو من التطبيق'],
            ].map(([title, body], i) => (
              <li key={title} className="flex gap-3">
                <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-soft font-bold text-accent">
                  {num(i + 1)}
                </span>
                <span>
                  <span className="block text-ui font-bold">{title}</span>
                  <span className="block text-meta text-ink-2">{body}</span>
                </span>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </Container>
  );
}
