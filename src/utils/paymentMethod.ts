import type { PaymentMethod } from "@/types/finance";

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  CREDIT_CARD: "Cartão de crédito",
  DEBIT_CARD: "Cartão de débito",
  PIX: "Pix",
  MANUAL: "Manual",
};
