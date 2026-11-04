import { Banknote, ShieldCheck, Truck } from 'lucide-react';

import { Container } from '@/components/Container';

const ITEMS = [
  { icon: ShieldCheck, title: 'متاجر متراجعة', body: 'كل متجر بنراجعه قبل ما يظهر' },
  { icon: Truck, title: 'توصيل لكل المحافظات', body: 'ومصاريف الشحن قدامك قبل ما تطلب' },
  { icon: Banknote, title: 'الدفع عند الاستلام', body: 'بتدفع كاش لما الطلب يوصلك' },
];

export function TrustStrip() {
  return (
    <section aria-label="ليه فاترينة" className="border-y border-line bg-sunken/60">
      <Container>
        <ul className="grid divide-line py-2 sm:grid-cols-3 sm:divide-x sm:py-0">
          {ITEMS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex items-center gap-3 py-3 sm:justify-center sm:px-4 sm:py-5">
              <Icon aria-hidden className="size-6 shrink-0 text-brand" />
              <p className="text-ui leading-snug">
                <span className="block font-bold">{title}</span>
                <span className="text-ink-2">{body}</span>
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
