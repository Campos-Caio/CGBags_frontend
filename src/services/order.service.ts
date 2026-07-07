import { api } from "@/lib/api";
import type { Order } from "@/types/order";

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
