import { BadgeCheck, ShoppingBasket, Store, Warehouse, type LucideIcon } from 'lucide-react';

import type { StoreType } from './types';

/**
 * The one place that describes each kind of store on the site. Labels, descriptions and `system`
 * are copied from `brandak app/src/features/catalog/store-types.ts` so the site and the app say the
 * same thing; `path`, `pitch` and `seo` are web-only. Adding a type = the API enum, the app's list,
 * and one entry here.
 */
export interface StoreTypeInfo {
  type: StoreType;
  /** Singular, e.g. "معرض". */
  label: string;
  /** Plural, e.g. "معارض". */
  plural: string;
  description: string;
  /** How this kind of store lists its products. */
  system: string[];
  icon: LucideIcon;
  /** The listing page for this type, e.g. "/showrooms". */
  path: string;
  /** One line for the top of the listing page, written for shoppers. */
  pitch: string;
  seo: { title: string; description: string };
}

export const STORE_TYPES: StoreTypeInfo[] = [
  {
    type: 'BRAND',
    label: 'براند',
    plural: 'براندات',
    description: 'علامة تجارية بتصمّم أو بتصنّع منتجاتها',
    system: ['كل منتج بمقاساته وألوانه، وكمية لكل مقاس ولون', 'صور لكل لون، والعميل يشوف صور اللون اللي اختاره', 'الخامة والقصّة والموسم عشان العميل يفلتر بيها'],
    icon: BadgeCheck,
    path: '/brands',
    pitch: 'براندات مصرية بتصمّم وتصنّع منتجاتها، بمقاساتها وألوانها وصور كل لون.',
    seo: {
      title: 'براندات مصرية',
      description: 'تسوّق من براندات مصرية محلية: ملابس وإكسسوارات وهاند ميد، بمقاسات وألوان واضحة ودفع عند الاستلام.',
    },
  },
  {
    type: 'SHOWROOM',
    label: 'معرض',
    plural: 'معارض',
    description: 'معرض بيعرض ويبيع تشكيلة منتجات',
    system: ['كل موديل بمواصفاته: الماركة والموديل والسعة', 'الحالة (جديد، كسر زيرو، مستعمل) والضمان', 'التوصيل والتركيب لو متاحين'],
    icon: Store,
    path: '/showrooms',
    pitch: 'معارض بتعرض موديلات بمواصفاتها وحالتها وضمانها، ومنها اللي بيوصّل ويركّب.',
    seo: {
      title: 'معارض',
      description: 'معارض أجهزة وأثاث وموبايلات في مصر: الموديل والمواصفات والحالة والضمان، والدفع عند الاستلام.',
    },
  },
  {
    type: 'WAREHOUSE',
    label: 'مخزن',
    plural: 'مخازن',
    description: 'بيع بالجملة أو بكميات من المخزن',
    system: ['جملة وقطاعي: سعر للقطعة وأسعار أقل كل ما الكمية تزيد', 'البيع بالكرتونة أو الدستة أو الشيكارة وعدد القطع فيها', 'أقل كمية للطلب لو حابب'],
    icon: Warehouse,
    path: '/warehouses',
    pitch: 'اشتري بالجملة من المخزن على طول: السعر بيقل كل ما الكمية تزيد.',
    seo: {
      title: 'مخازن جملة',
      description: 'مخازن بتبيع جملة وقطاعي في مصر: أسعار الكميات، والبيع بالكرتونة والدستة، والدفع عند الاستلام.',
    },
  },
  {
    type: 'SHOP',
    label: 'محل',
    plural: 'محلات',
    description: 'محل تجزئة بيبيع للمستهلك مباشرة',
    system: ['منتجات بالقطعة أو الوزن أو العلبة', 'الماركة والحجم والصلاحية لكل منتج', 'الكمية المتاحة بتتحدث مع كل طلب'],
    icon: ShoppingBasket,
    path: '/shops',
    pitch: 'محلات الحي بتاعتك أونلاين: بالقطعة أو الوزن أو العلبة، والكمية متحدّثة.',
    seo: {
      title: 'محلات',
      description: 'محلات تجزئة في مصر بتبيع بالقطعة والوزن والعلبة، بأسعار واضحة ودفع عند الاستلام.',
    },
  },
];

/** Stores created before storeType existed have none and count as BRAND, as in the API. */
export const storeTypeInfo = (type?: StoreType | null) => STORE_TYPES.find((s) => s.type === type) ?? STORE_TYPES[0];
