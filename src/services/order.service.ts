import axios from "axios";

import { api } from "@/lib/api";
import type { Order, OrderStatus } from "@/types/order";
import type { OrderReturn } from "@/types/orderReturn";
import type { OrderTracking } from "@/types/tracking";

export async function listMyOrders(): Promise<Order[]> {
  const response = await api.get<Order[]>("/orders/");
  return response.data;
}

export async function getMyOrderById(orderId: number): Promise<Order> {
  const response = await api.get<Order>(`/orders/${orderId}`);
  return response.data;
}

export async function checkout(
  addressId: number,
  shippingServiceId: number,
  couponCode?: string
): Promise<Order> {
  const response = await api.post<Order>("/checkout", {
    address_id: addressId,
    shipping_service_id: shippingServiceId,
    coupon_code: couponCode || undefined,
  });
  return response.data;
}

export type CardPaymentMethod = "CREDIT_CARD" | "DEBIT_CARD";

export interface CardPaymentInput {
  cardholder_name: string;
  card_number: string;
  expiration_month: number;
  expiration_year: number;
  security_code: string;
  installments: number;
  payment_method: CardPaymentMethod;
}

export async function payOrder(orderId: number, card: CardPaymentInput): Promise<Order> {
  const response = await api.post<Order>(`/orders/${orderId}/pay`, card);
  return response.data;
}

// Vem exatamente como a e.Rede devolve ("Pending"/"Approved"/"Canceled"), nao
// em maiusculas como OrderStatus — o backend usa o proprio vocabulario da
// Rede no enum (ver PixTransactionStatus, models/enums.py).
export type PixChargeStatus = "Pending" | "Approved" | "Canceled";

export interface PixCharge {
  payment_id: number;
  order_id: number;
  tid: string | null;
  reference: string;
  amount: number;
  qr_code_image: string | null;
  qr_code_data: string | null;
  expires_at: string | null;
  status: PixChargeStatus;
}

export async function payOrderPix(orderId: number): Promise<PixCharge> {
  const response = await api.post<PixCharge>(`/orders/${orderId}/pay/pix`);
  return response.data;
}

export async function getPixChargeStatus(orderId: number): Promise<PixCharge> {
  const response = await api.get<PixCharge>(`/orders/${orderId}/pay/pix/status`);
  return response.data;
}

export async function getOrderTracking(orderId: number): Promise<OrderTracking> {
  const response = await api.get<OrderTracking>(`/orders/${orderId}/tracking`);
  return response.data;
}

export async function cancelOrder(orderId: number): Promise<Order> {
  const response = await api.post<Order>(`/orders/${orderId}/cancel`);
  return response.data;
}

export async function requestOrderReturn(
  orderId: number,
  reason?: string
): Promise<OrderReturn> {
  const response = await api.post<OrderReturn>(`/orders/${orderId}/return`, {
    reason: reason || undefined,
  });
  return response.data;
}

export async function getOrderReturn(orderId: number): Promise<OrderReturn | null> {
  const response = await api.get<OrderReturn | null>(`/orders/${orderId}/return`);
  return response.data;
}

// --- Rotas administrativas ---

export interface ListOrdersAdminParams {
  status?: OrderStatus;
  search?: string;
  start?: string;
  end?: string;
  skip?: number;
  limit?: number;
}

export async function listOrdersAdmin(params?: ListOrdersAdminParams): Promise<Order[]> {
  const response = await api.get<Order[]>("/admin/orders", { params });
  return response.data;
}

export async function getOrderByIdAdmin(id: number): Promise<Order | null> {
  try {
    const response = await api.get<Order>(`/admin/orders/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function updateOrderStatusAdmin(id: number, status: OrderStatus): Promise<Order> {
  const response = await api.patch<Order>(`/admin/orders/${id}/status`, { status });
  return response.data;
}

export async function cancelOrderAdmin(id: number): Promise<Order> {
  const response = await api.post<Order>(`/admin/orders/${id}/cancel`);
  return response.data;
}

export async function markOrderPaidManuallyAdmin(id: number, note: string): Promise<Order> {
  const response = await api.post<Order>(`/admin/orders/${id}/mark-paid`, { note });
  return response.data;
}

export async function updateOrderNoteAdmin(id: number, note: string | null): Promise<Order> {
  const response = await api.patch<Order>(`/admin/orders/${id}/note`, { note });
  return response.data;
}

export interface ExportOrdersAdminParams {
  status?: OrderStatus;
  search?: string;
  start?: string;
  end?: string;
}

/** Baixa o CSV filtrado — a instancia `api` ja' injeta o Bearer token, por
 * isso usamos ela (com responseType blob) em vez de um link <a href> direto,
 * que nao carregaria o header de autenticacao. */
export async function exportOrdersAdmin(params?: ExportOrdersAdminParams): Promise<void> {
  const response = await api.get<Blob>("/admin/orders/export", {
    params,
    responseType: "blob",
  });

  const disposition = response.headers["content-disposition"] as string | undefined;
  const filenameMatch = disposition?.match(/filename="?([^"]+)"?/);
  const filename = filenameMatch?.[1] ?? "pedidos.csv";

  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
