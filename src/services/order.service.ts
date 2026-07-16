import axios from "axios";

import { api } from "@/lib/api";
import type { Order, OrderStatus } from "@/types/order";

export async function listMyOrders(): Promise<Order[]> {
  const response = await api.get<Order[]>("/orders/");
  return response.data;
}

export async function getMyOrderById(orderId: number): Promise<Order> {
  const response = await api.get<Order>(`/orders/${orderId}`);
  return response.data;
}

export async function checkout(addressId: number, shippingServiceId: number): Promise<Order> {
  const response = await api.post<Order>("/checkout", {
    address_id: addressId,
    shipping_service_id: shippingServiceId,
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

export async function cancelOrder(orderId: number): Promise<Order> {
  const response = await api.post<Order>(`/orders/${orderId}/cancel`);
  return response.data;
}

// --- Rotas administrativas ---

export interface ListOrdersAdminParams {
  status?: OrderStatus;
  search?: string;
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
