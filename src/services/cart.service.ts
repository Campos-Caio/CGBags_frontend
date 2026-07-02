import { api } from "@/lib/api";
import type { Cart } from "@/types/cart";

export async function getCart(): Promise<Cart> {
  const response = await api.get<Cart>("/cart/");
  return response.data;
}

export async function addCartItem(productId: number, quantity: number): Promise<Cart> {
  const response = await api.post<Cart>("/cart/items", {
    product_id: productId,
    quantity,
  });
  return response.data;
}

export async function updateCartItem(itemId: number, quantity: number): Promise<Cart> {
  const response = await api.patch<Cart>(`/cart/items/${itemId}`, { quantity });
  return response.data;
}

export async function removeCartItem(itemId: number): Promise<void> {
  await api.delete(`/cart/items/${itemId}`);
}
