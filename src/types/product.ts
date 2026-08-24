export interface PricingTier {
  id: string;
  label: string;
  units: number;
  patchesPerUnit: number;
  price: number;
  compareAtPrice: number;
  pricePerUnit: number;
  badge?: string;
  isPopular?: boolean;
}

export interface Benefit {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface UsageStep {
  step: number;
  title: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ComparisonRow {
  feature: string;
  velnora: boolean | string;
  patches: boolean | string;
  pills: boolean | string;
}

export type OrderPaymentMethod = "card" | "cod";

export interface OrderAddress {
  fullName: string;
  phone: string;
  emirate: string;
  city: string;
  addressLine1: string;
  addressLine2?: string;
}
