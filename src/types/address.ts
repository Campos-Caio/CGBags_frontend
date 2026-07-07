export type AddressType = "SHIPPING" | "BILLING";

export interface Address {
  id: number;
  customer_id: number;
  name: string;
  zip_code: string;
  street: string;
  number: string;
  district: string;
  city: string;
  state: string;
  complement: string | null;
  address_type: AddressType;
  is_default: boolean;
  created_at: string;
}

export interface AddressCreateInput {
  name: string;
  zip_code: string;
  street: string;
  number: string;
  district: string;
  city: string;
  state: string;
  complement?: string;
  address_type: AddressType;
  is_default?: boolean;
}

export type AddressUpdateInput = Partial<AddressCreateInput>;
