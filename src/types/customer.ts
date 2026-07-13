import type { Address } from "@/types/address";
import type { User } from "@/types/auth";

export type PersonType = "PF" | "PJ";

export interface Customer {
  id: number;
  user_id: number;
  person_type: PersonType;
  full_name: string;
  cpf_cnpj: string;
  state_registration: string | null;
  phone: string;
  birth_date: string | null;
  is_active: boolean;
  created_at: string;
  user?: User;
  addresses?: Address[];
  /** Só vem preenchido na listagem admin (GET /customers/) — usado pro aviso de exclusão. */
  cart_item_count?: number;
}

export interface CustomerCreateInput {
  person_type: PersonType;
  full_name: string;
  cpf_cnpj: string;
  state_registration?: string;
  phone: string;
  birth_date?: string;
}

/** person_type e cpf_cnpj são imutáveis após o cadastro — o backend não os aceita neste endpoint. */
export interface CustomerUpdateInput {
  full_name?: string;
  phone?: string;
  birth_date?: string;
  is_active?: boolean;
}
