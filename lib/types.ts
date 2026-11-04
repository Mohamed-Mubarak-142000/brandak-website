/**
 * The public part of the API's response shapes (the `data` of the envelope), copied from
 * `brandak app/src/api/types.ts`. Keep the two in step when the API changes.
 */

type ISODate = string;

/** Kind of business behind a store. Labels, icons and pages live in lib/store-types.ts. */
export type StoreType = 'BRAND' | 'SHOWROOM' | 'WAREHOUSE' | 'SHOP';

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
}

export interface Category {
  _id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  parentId: string | null;
  /** 0 = section, 1 = category, 2 = sub-category. */
  level?: number;
  ancestors?: string[];
  /** A lucide icon name, e.g. "shirt". */
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  storeTypes?: StoreType[];
}

export interface Governorate {
  code: string;
  ar: string;
  en: string;
}

export interface ShippingZone {
  governorate: string;
  fee: number;
}

export interface PublicBrand {
  id: string;
  name: string;
  slug: string;
  storeType: StoreType;
  description: string;
  logoUrl: string | null;
  coverUrl: string | null;
  categoryIds: string[];
  contact: { phone?: string; email?: string; whatsapp?: string };
  socialLinks?: { instagram?: string; facebook?: string; tiktok?: string; website?: string };
  shipping: {
    zones: ShippingZone[];
    defaultFee: number | null;
    freeShippingThreshold: number | null;
    minOrderAmount: number;
    processingDays: number;
    shippingPolicy: string;
    returnPolicy: string;
    /** Days after delivery to ask for a return; 0 = no returns. */
    returnDays?: number;
    pickup?: { enabled: boolean; address?: string; governorate?: string | null; hours?: string; mapUrl?: string | null };
    allowResellers?: boolean;
    acceptsOrders: boolean;
  };
  ratingAvg: number;
  ratingCount: number;
}

export interface BrandMini {
  id: string;
  name?: string;
  slug?: string;
  logoUrl?: string | null;
}

/** A running sale on a product; price is already the sale price. */
export interface ActiveSale {
  percent: number;
  endsAt: ISODate;
  campaignId: string | null;
}

export interface Wholesale {
  minQty: number;
  tiers: { minQty: number; price: number }[];
  /** The wholesale unit, e.g. a carton (كرتونة) of 24 pieces; quantities stay in pieces. */
  pack?: { unit: string; qty: number } | null;
}

export interface ProductCard {
  id: string;
  title: string;
  price: number;
  compareAtPrice: number | null;
  sale?: ActiveSale | null;
  imageUrl: string | null;
  inStock: boolean;
  ratingAvg: number;
  ratingCount: number;
  brand: BrandMini;
  wholesale?: Wholesale | null;
  /** What one unit is (قطعة, كيلو, كرتونة...). */
  unit?: string;
  /** Paid placement (shown with a "مُموَّل" tag). */
  sponsored?: boolean;
}

export interface Variant {
  id: string;
  size: string | null;
  color: string | null;
  price: number;
  inStock: boolean;
  available: number;
}

export type SpecValue = string | number | boolean;

export interface ProductDetail extends ProductCard {
  description: string;
  images: string[];
  /** Same order as images: the colour each photo shows; null = every colour. */
  imageColors?: (string | null)[];
  categoryId: string;
  /** "ملابس › رجالي › تيشيرتات". */
  categoryPath?: string;
  tags: string[];
  variants: Variant[];
  /** What the variant fields are called in this category ("المساحة" for phones). */
  sizeLabel?: string;
  colorLabel?: string;
  sizeGuide?: string | null;
  specs?: { key: string; label: string; value: SpecValue; unit: string | null }[];
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  images?: string[];
  reply?: { text: string; at: ISODate } | null;
  verifiedPurchase: true;
  createdAt: ISODate;
}

export interface Campaign {
  _id: string;
  nameAr: string;
  slug: string;
  descriptionAr: string;
  startsAt: ISODate;
  endsAt: ISODate;
  minPercent: number;
  color: string;
}

export interface CommissionTerms {
  /** 0.05 = 5%. */
  commissionRate: number;
  settlementDays: number;
  maxUnpaidBalance: number;
}

// ---------- Account (signed-in customer) ----------
// Copied from `brandak app/src/api/types.ts`; keep in step.

export type OrderStatus = 'AWAITING_CONFIRMATION' | 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUSED';
export type BrandStatus = 'PENDING_REVIEW' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  roles: ('CUSTOMER' | 'SUPER_ADMIN')[];
  status: 'ACTIVE' | 'SUSPENDED';
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: ISODate;
}
/** `users/me`: the user plus the store they own, if any. */
export interface Me extends PublicUser {
  brand: { id: string; role: 'OWNER' } | null;
}
export interface AuthResult {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

export interface Address {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  governorate: string;
  governorateName: string;
  city: string;
  area: string;
  street: string;
  building: string;
  floor: string;
  apartment: string;
  landmark: string;
  location: { lat: number; lng: number } | null;
  isDefault: boolean;
}

// ---------- Cart & checkout ----------
export interface CartBrand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
}
export interface CartSummary {
  brand: CartBrand;
  itemsCount: number;
  updatedAt: ISODate;
}
/** BELOW_MIN_QTY: a wholesale product with fewer pieces than its minimum (all sizes together). */
export type LineIssue = 'UNAVAILABLE' | 'OUT_OF_STOCK' | 'INSUFFICIENT_STOCK' | 'BELOW_MIN_QTY';
export interface PricedLine {
  itemId: string;
  productId: string;
  variantId: string;
  title: string;
  imageUrl: string | null;
  size: string | null;
  color: string | null;
  sku: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  available: number;
  minQty?: number;
  issue: LineIssue | null;
}
export interface CartView {
  brand: CartBrand;
  acceptingOrders: boolean;
  items: PricedLine[];
  subtotal: number;
  hasIssues: boolean;
}
export interface Quote {
  items: PricedLine[];
  subtotal: number;
  shippingFee: number;
  discountTotal: number;
  grandTotal: number;
  coupon?: { code: string; discount: number } | null;
  currency: 'EGP';
  paymentMethods: ['COD'];
  points?: { balance: number; usable: number; usableDiscount: number; used: number; discount: number } | null;
  fulfillment?: 'DELIVERY' | 'PICKUP';
}

// ---------- Orders ----------
export interface OrderSummary {
  id: string;
  orderNumber: string;
  brand: { id: string; name: string; slug: string; phone?: string };
  status: OrderStatus;
  statusLabelAr: string;
  itemsCount: number;
  grandTotal: number;
  currency: string;
  paymentMethod: 'COD';
  paymentStatus: 'UNPAID' | 'PAID';
  createdAt: ISODate;
  previewImageUrl?: string | null;
}
export interface OrderItem {
  productId: string;
  variantId: string;
  title: string;
  imageUrl?: string;
  size?: string;
  color?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}
export interface OrderDetail extends Omit<OrderSummary, 'previewImageUrl'> {
  items: OrderItem[];
  /** null for orders collected from the store. */
  address: Address | null;
  fulfillment?: 'DELIVERY' | 'PICKUP';
  points?: { used: number; discount: number; earned: number } | null;
  gift?: { message: string; hidePrices: boolean } | null;
  pickup?: { address: string; governorate: string | null; hours: string; mapUrl: string } | null;
  subtotal: number;
  shippingFee: number;
  discountTotal: number;
  notes: string;
  cancelReason: string | null;
  deliveredAt: ISODate | null;
  history: { status: OrderStatus; at: ISODate; actor: 'CUSTOMER' | 'BRAND' | 'ADMIN' | 'SYSTEM'; note: string | null }[];
  allowedNextStatuses: OrderStatus[];
  coupon?: { code: string; discount: number; fundedBy: 'BRAND' | 'PLATFORM' } | null;
  shipment?: { carrier: string; trackingNumber: string; trackingUrl: string | null; shippedAt: ISODate } | null;
}

export interface WishlistItem {
  productId: string;
  addedAt: ISODate;
  available: boolean;
  product: ProductCard | null;
}
