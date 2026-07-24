import axios from "axios";

import { api } from "@/lib/api";
import type { Customer, CustomerCreateInput, CustomerUpdateInput } from "@/types/customer";
import type { Order } from "@/types/order";

export async function getMyProfile(): Promise<Customer | null> {
  try {
    const response = await api.get<Customer>("/customers/me");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function createMyProfile(data: CustomerCreateInput): Promise<Customer> {
  const response = await api.post<Customer>("/customers/me", data);
  return response.data;
}

export async function updateMyProfile(data: CustomerUpdateInput): Promise<Customer> {
  const response = await api.patch<Customer>("/customers/me", data);
  return response.data;
}

// --- Rotas administrativas ---

export interface ListCustomersAdminParams {
  search?: string;
  is_active?: boolean;
  skip?: number;
  limit?: number;
}

export async function listCustomersAdmin(params?: ListCustomersAdminParams): Promise<Customer[]> {
  const response = await api.get<Customer[]>("/customers/", { params });
  return response.data;
}

export async function getCustomerByIdAdmin(id: number): Promise<Customer | null> {
  try {
    const response = await api.get<Customer>(`/customers/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function updateCustomerAdmin(
  id: number,
  data: CustomerUpdateInput
): Promise<Customer> {
  const response = await api.patch<Customer>(`/customers/${id}`, data);
  return response.data;
}

export async function deleteCustomerAdmin(id: number): Promise<void> {
  await api.delete(`/customers/${id}`);
}

export interface ListCustomerOrdersParams {
  skip?: number;
  limit?: number;
}

export async function listCustomerOrdersAdmin(
  customerId: number,
  params?: ListCustomerOrdersParams
): Promise<Order[]> {
  const response = await api.get<Order[]>(`/customers/${customerId}/orders`, { params });
  return response.data;
}

export async function updateCustomerNoteAdmin(
  id: number,
  note: string | null
): Promise<{ id: number; internal_note: string | null }> {
  const response = await api.patch<{ id: number; internal_note: string | null }>(
    `/customers/${id}/note`,
    { note }
  );
  return response.data;
}
