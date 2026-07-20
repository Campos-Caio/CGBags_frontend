export type DiscountType = "PERCENTAGE" | "FIXED";

export interface Coupon {
  id: number;
  code: string | null;
  discount_type: DiscountType;
  value: string;
  min_order_value: string;
  starts_at: string | null;
  ends_at: string | null;
  max_uses: number | null;
  max_uses_per_customer: number | null;
  is_active: boolean;
  times_used: number;
  created_at: string;
  updated_at: string;
}

export interface CouponCreateInput {
  code: string;
  discount_type: DiscountType;
  value: string;
  min_order_value?: string;
  starts_at?: string | null;
  ends_at?: string | null;
  max_uses?: number | null;
  max_uses_per_customer?: number | null;
  is_active?: boolean;
}

export interface CouponUpdateInput {
  code?: string;
  discount_type?: DiscountType;
  value?: string;
  min_order_value?: string;
  starts_at?: string | null;
  ends_at?: string | null;
  max_uses?: number | null;
  max_uses_per_customer?: number | null;
  is_active?: boolean;
}

export interface CouponPreview {
  code: string;
  discount_type: DiscountType;
  value: string;
  discount_amount: string;
}
