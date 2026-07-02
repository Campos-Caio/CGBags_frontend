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
