import {
  Baby,
  Bath,
  BookOpen,
  BrickWall,
  Cake,
  Car,
  CookingPot,
  Footprints,
  Gift,
  Hand,
  House,
  LayoutGrid,
  Pill,
  Plug,
  Puzzle,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Sofa,
  Sparkles,
  SprayCan,
  Tag,
  Watch,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';

import { SectionHeader } from '@/components/SectionHeader';
import type { Category } from '@/lib/types';

/** The icons the API's sections use (lucide names); anything new falls back to a tag. */
const ICONS: Record<string, LucideIcon> = {
  shirt: Shirt,
  footprints: Footprints,
  watch: Watch,
  sparkles: Sparkles,
  hand: Hand,
  baby: Baby,
  cake: Cake,
  gift: Gift,
  plug: Plug,
  sofa: Sofa,
  smartphone: Smartphone,
  car: Car,
  bath: Bath,
  home: House,
  house: House,
  'shopping-basket': ShoppingBasket,
  'cooking-pot': CookingPot,
  'brick-wall': BrickWall,
  'spray-can': SprayCan,
  'book-open': BookOpen,
  pill: Pill,
  puzzle: Puzzle,
  grid: LayoutGrid,
};

export const categoryIcon = (name?: string) => (name && ICONS[name]) || Tag;

/** Top-level sections: a swipeable rail on phones, a grid on desktop. */
export function CategoryRail({ categories }: { categories: Category[] }) {
  if (!categories.length) return null;
  return (
    <section>
      <SectionHeader title="الأقسام" />
      <ul className="rail -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-8 lg:overflow-visible lg:px-0">
        {categories.map((c) => {
          const Icon = categoryIcon(c.icon);
          return (
            <li key={c._id} className="w-24 shrink-0 lg:w-auto">
              <Link
                href={`/category/${c._id}`}
                className="group flex h-full min-h-28 flex-col items-center gap-2 rounded-card border border-line bg-surface px-2 py-4 text-center transition-colors hover:border-brand"
              >
                <span className="grid size-11 place-items-center rounded-full bg-sunken text-accent group-hover:bg-accent-soft">
                  <Icon aria-hidden className="size-5" />
                </span>
                <span className="text-meta font-semibold leading-snug">{c.nameAr}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
