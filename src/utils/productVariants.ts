import type { Product, ProductVariant } from "@/types/product";
import { formatCurrency } from "@/utils/currency";

/** Variantes vendaveis de verdade — exclui "Personalizado" e inativas. */
export function getSellableVariants(product: Product): ProductVariant[] {
  return product.variants.filter((v) => !v.is_custom && v.is_active);
}

export function getCustomVariant(product: Product): ProductVariant | null {
  return product.variants.find((v) => v.is_custom && v.is_active) ?? null;
}

/** Preco unico se todas as variantes sellable custam o mesmo, senao "A partir de". */
export function getDisplayPriceLabel(product: Product): string {
  const sellable = getSellableVariants(product);
  if (sellable.length === 0) return "Sob consulta";

  const prices = sellable.map((v) => Number(v.price));
  const min = Math.min(...prices);
  const allSame = prices.every((p) => p === min);
  return allSame ? formatCurrency(min) : `A partir de ${formatCurrency(min)}`;
}

export function getAggregateStockQuantity(product: Product): number {
  return getSellableVariants(product).reduce((sum, v) => sum + v.stock_quantity, 0);
}

/** Label pra exibir no seletor de tamanho — cai pro sku se a variante nao tiver label. */
export function getVariantDisplayLabel(variant: ProductVariant): string {
  return variant.label ?? variant.sku;
}
