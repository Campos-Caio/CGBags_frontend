import { api } from "@/lib/api";
import type { CustomQuoteRequest, CustomQuoteStatus } from "@/types/quote";

export async function createQuoteRequest(
  variantId: number,
  details: string
): Promise<CustomQuoteRequest> {
  const response = await api.post<CustomQuoteRequest>("/quotes", {
    variant_id: variantId,
    details,
  });
  return response.data;
}

export async function listMyQuoteRequests(): Promise<CustomQuoteRequest[]> {
  const response = await api.get<CustomQuoteRequest[]>("/quotes/mine");
  return response.data;
}

// --- Rotas administrativas ---

export interface ListQuotesAdminParams {
  quote_status?: CustomQuoteStatus;
  skip?: number;
  limit?: number;
}

export async function listQuoteRequestsAdmin(
  params?: ListQuotesAdminParams
): Promise<CustomQuoteRequest[]> {
  const response = await api.get<CustomQuoteRequest[]>("/admin/quotes", { params });
  return response.data;
}

export async function getQuoteRequestAdmin(id: number): Promise<CustomQuoteRequest> {
  const response = await api.get<CustomQuoteRequest>(`/admin/quotes/${id}`);
  return response.data;
}

export async function markQuoteContacted(id: number): Promise<CustomQuoteRequest> {
  const response = await api.patch<CustomQuoteRequest>(`/admin/quotes/${id}/contact`);
  return response.data;
}

export async function declineQuote(id: number, reason?: string): Promise<CustomQuoteRequest> {
  const response = await api.patch<CustomQuoteRequest>(`/admin/quotes/${id}/decline`, { reason });
  return response.data;
}

export interface ConvertQuoteInput {
  address_id: number;
  price: string;
  shipping_cost: string;
  size_description?: string;
}

export async function convertQuoteToOrder(id: number, data: ConvertQuoteInput) {
  const response = await api.post(`/admin/quotes/${id}/convert`, data);
  return response.data;
}
