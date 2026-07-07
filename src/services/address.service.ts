import { api } from "@/lib/api";
import type { Address, AddressCreateInput, AddressUpdateInput } from "@/types/address";

export async function listMyAddresses(): Promise<Address[]> {
  const response = await api.get<Address[]>("/customers/me/addresses");
  return response.data;
}

export async function createMyAddress(data: AddressCreateInput): Promise<Address> {
  const response = await api.post<Address>("/customers/me/addresses", data);
  return response.data;
}

export async function updateMyAddress(
  addressId: number,
  data: AddressUpdateInput
): Promise<Address> {
  const response = await api.patch<Address>(`/customers/me/addresses/${addressId}`, data);
  return response.data;
}

export async function deleteMyAddress(addressId: number): Promise<void> {
  await api.delete(`/customers/me/addresses/${addressId}`);
}
