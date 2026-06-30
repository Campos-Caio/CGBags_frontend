import { api } from "@/lib/api";

export async function listProducts() {
  const response = await api.get("/health/");

  return response.data;
}