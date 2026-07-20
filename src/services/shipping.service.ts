import { api } from "@/lib/api";
import type { FreightOption } from "@/types/shipping";

export async function calculateFreight(postalCode: string): Promise<FreightOption[]> {
  const response = await api.get<FreightOption[]>("/cart/frete", {
    params: { postal_code: postalCode },
  });
  return response.data;
}
