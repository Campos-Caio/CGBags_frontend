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

export interface CardPaymentInput {
  cardholder_name: string;
  card_number: string;
  expiration_month: number;
  expiration_year: number;
  security_code: string;
  installments: number;
}

export async function payOrder(orderId: number, card: CardPaymentInput): Promise<Order> {
  const response = await api.post<Order>(`/orders/${orderId}/pay`, card);
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
