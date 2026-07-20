import axios from "axios";

import { api } from "@/lib/api";
import type { Coupon, CouponCreateInput, CouponPreview, CouponUpdateInput } from "@/types/coupon";

export async function validateCoupon(code: string): Promise<CouponPreview> {
  const response = await api.post<CouponPreview>("/coupons/validate", { code });
  return response.data;
}

// --- Rotas administrativas ---

export interface ListCouponsAdminParams {
  is_active?: boolean;
  skip?: number;
  limit?: number;
}

export async function listCouponsAdmin(params?: ListCouponsAdminParams): Promise<Coupon[]> {
  const response = await api.get<Coupon[]>("/admin/coupons", { params });
  return response.data;
}

export async function getCouponByIdAdmin(id: number): Promise<Coupon | null> {
  try {
    const response = await api.get<Coupon>(`/admin/coupons/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function createCouponAdmin(data: CouponCreateInput): Promise<Coupon> {
  const response = await api.post<Coupon>("/admin/coupons", data);
  return response.data;
}

export async function updateCouponAdmin(id: number, data: CouponUpdateInput): Promise<Coupon> {
  const response = await api.patch<Coupon>(`/admin/coupons/${id}`, data);
  return response.data;
}

export async function deleteCouponAdmin(id: number): Promise<void> {
  await api.delete(`/admin/coupons/${id}`);
}
