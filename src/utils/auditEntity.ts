/** Valores exatos usados em AuditService.log("X", ...) no backend — o filtro
 * de entidade e' comparacao exata (==), entao a UI oferece so' esses valores
 * em vez de um campo livre onde o admin teria que acertar a grafia/caixa. */
export const AUDIT_ENTITIES = [
  "User",
  "Customer",
  "Address",
  "Product",
  "ProductVariant",
  "Category",
  "Order",
  "Coupon",
  "Shipment",
  "CustomQuoteRequest",
  "PixWebhook",
] as const;

/** "PRODUCT_CREATED" -> "Product created" — nao ha' tradução completa pro
 * catalogo de ~40 AuditAction; formatacao generica e' mais barata e ainda
 * legivel do que traduzir cada valor manualmente. */
export function formatAuditAction(action: string): string {
  const lower = action.toLowerCase().replace(/_/g, " ");
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}
