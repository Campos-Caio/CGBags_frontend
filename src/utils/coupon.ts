import type { DiscountType } from "@/types/coupon";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";

export const DISCOUNT_TYPE_LABEL: Record<DiscountType, string> = {
  PERCENTAGE: "Percentual",
  FIXED: "Valor fixo",
};

/** "10%" para percentual, "R$ 20,00" para fixo — mesma regra usada no resumo do checkout e na tabela de admin. */
export function formatCouponValue(discountType: DiscountType, value: string | number): string {
  if (discountType === "PERCENTAGE") {
    return `${value}%`;
  }
  return formatCurrency(value);
}

/** "Sempre", "A partir de X", "Até X" ou "X - Y", conforme o que estiver preenchido. */
export function formatCouponValidity(startsAt: string | null, endsAt: string | null): string {
  if (!startsAt && !endsAt) return "Sempre";
  if (startsAt && !endsAt) return `A partir de ${formatDate(startsAt)}`;
  if (!startsAt && endsAt) return `Até ${formatDate(endsAt)}`;
  return `${formatDate(startsAt!)} - ${formatDate(endsAt!)}`;
}
