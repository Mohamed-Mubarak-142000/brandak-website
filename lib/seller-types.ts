/**
 * Store-owner response shapes (the `data` of the envelope), copied from
 * `brandak app/src/api/types.ts`. Keep the two in step when the API changes.
 */

import type { BrandStatus, OrderDetail, OrderStatus, OrderSummary, PublicBrand, ShippingZone, StoreType } from './types';

type ISODate = string;

export type UploadPurpose = 'PRODUCT_IMAGE' | 'BRAND_LOGO' | 'BRAND_COVER' | 'PAYMENT_PROOF' | 'REVIEW_IMAGE' | 'CLAIM_IMAGE';

export interface UploadResult {
  id: string;
  purpose: UploadPurpose;
  url: string | null;
  mime: string;
  size: number;
}

export interface BrandPickup {
  enabled: boolean;
  address: string;
  governorate: string | null;
  hours: string;
  mapUrl: string;
}

export interface BrandSettings {
  shippingZones: ShippingZone[];
  /** null = no delivery outside the listed zones. */
  defaultShippingFee: number | null;
  freeShippingThreshold: number | null;
  minOrderAmount: number;
  processingDays: number;
  shippingPolicy: string;
  returnPolicy: string;
  /** 0 = no returns. */
  returnDays?: number;
  pickup?: BrandPickup;
  allowResellers?: boolean;
  acceptsOrders: boolean;
  /** Edited on /seller/assistant. */
  assistant?: { enabled?: boolean; name?: string; tone?: string; extraInfo?: string };
}

/** `brands/me`. */
export interface OwnerBrand {
  id: string;
  name: string;
  slug: string;
  storeType: StoreType;
  description: string;
  logoUrl: string | null;
  coverUrl: string | null;
  categoryIds: string[];
  status: BrandStatus;
  statusReason: string | null;
  contact: PublicBrand['contact'];
  socialLinks?: PublicBrand['socialLinks'];
  settings: BrandSettings;
  subscriptionEndsAt: ISODate | null;
  isVisible: boolean;
  ratingAvg: number;
  ratingCount: number;
  createdAt: ISODate;
}

/** `brand/analytics/overview`. */
export interface BrandOverview {
  commission?: { rate: number; balance: number; dueBy: ISODate | null; blocked: boolean; pendingSettlement: boolean };
  range: { from: ISODate; to: ISODate };
  orders: { count: number; changePct: number | null; pendingNow: number; byStatus: Partial<Record<OrderStatus, number>> };
  salesValue: number;
  salesChangePct: number | null;
  deliveredRevenue: number;
  averageOrderValue: number;
  daily: { date: string; orders: number; sales: number }[];
  topProducts: { productId: string; title: string; imageUrl: string | null; quantity: number; revenue: number }[];
  lowStock: {
    productId: string;
    title: string;
    imageUrl: string | null;
    variants: { id: string; size: string | null; color: string | null; stock: number }[];
  }[];
  plan: unknown;
}

/** `brand/commissions`. */
export interface CommissionStatus {
  commissionRate: number;
  settlementDays: number;
  maxUnpaidBalance: number;
  balance: number;
  dueSince: ISODate | null;
  dueBy: ISODate | null;
  blocked: boolean;
  pendingSettlement: { id: string; amount: number; createdAt: ISODate } | null;
}

export interface CustomerTrust {
  delivered: number;
  refused: number;
  level: 'NEW' | 'GOOD' | 'RISKY';
}

/** `brand/orders` rows carry the customer. */
export interface SellerOrderSummary extends OrderSummary {
  customer?: { name: string; phone: string };
}

/** `brand/orders/:id`. */
export interface SellerOrderDetail extends OrderDetail {
  customer?: { name: string; phone: string };
  items: (OrderDetail['items'][number] & { sku?: string })[];
  resale?: { margin: number } | null;
  /** The platform's commission once delivered. */
  commission?: { rate: number; base: number; amount: number } | null;
  /** The customer's delivery record across all stores. */
  customerTrust?: CustomerTrust;
}
