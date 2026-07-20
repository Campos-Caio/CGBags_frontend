"use client";

import { useState } from "react";

import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { DefinitionRow } from "@/components/ui/definition-row";
import { CustomQuoteRequestForm } from "@/components/product/CustomQuoteRequestForm";
import { StockBadge } from "@/components/product/StockBadge";
import type { Product } from "@/types/product";
import { formatCurrency } from "@/utils/currency";
import { getProductSpecs, getVariantSpecs } from "@/utils/productSpecs";
import { getCustomVariant, getSellableVariants, getVariantDisplayLabel } from "@/utils/productVariants";
import { getStockStatus } from "@/utils/stock";

interface ProductPurchasePanelProps {
  product: Product;
}

function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const sellableVariants = getSellableVariants(product);
  const customVariant = getCustomVariant(product);
  const allOptions = customVariant ? [...sellableVariants, customVariant] : sellableVariants;

  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    sellableVariants[0]?.id ?? customVariant?.id ?? null
  );

  const selectedVariant = allOptions.find((v) => v.id === selectedVariantId) ?? null;

  if (!selectedVariant) {
    return <p className="mt-3 text-sm text-muted-foreground">Produto indisponível no momento.</p>;
  }

  const stockStatus = selectedVariant.is_custom ? null : getStockStatus(selectedVariant.stock_quantity);
  const specs = [...getVariantSpecs(selectedVariant), ...getProductSpecs(product)];

  return (
    <div>
      {stockStatus && <StockBadge stockQuantity={selectedVariant.stock_quantity} />}

      <h1 className="mt-3 font-heading text-2xl font-semibold text-foreground sm:text-3xl">
        {product.name}
      </h1>

      <p className="mt-3 font-heading text-2xl font-semibold text-foreground">
        {selectedVariant.is_custom ? "Sob consulta" : formatCurrency(selectedVariant.price ?? "0")}
      </p>

      {product.description && (
        <p className="mt-6 text-base text-muted-foreground">{product.description}</p>
      )}

      {allOptions.length > 1 && (
        <div className="mt-6">
          <span className="text-sm font-medium text-foreground">Tamanho</span>
          <div className="mt-1.5 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {allOptions.map((variant) => (
              <label
                key={variant.id}
                className={`flex cursor-pointer items-center justify-center rounded-lg border p-2.5 text-center text-sm font-medium transition-colors ${
                  selectedVariantId === variant.id
                    ? "border-ring bg-muted/30 text-foreground"
                    : "border-border text-muted-foreground hover:bg-muted/20"
                }`}
              >
                <input
                  type="radio"
                  name="variant"
                  value={variant.id}
                  checked={selectedVariantId === variant.id}
                  onChange={() => setSelectedVariantId(variant.id)}
                  className="sr-only"
                />
                {getVariantDisplayLabel(variant)}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        {selectedVariant.is_custom ? (
          <CustomQuoteRequestForm variantId={selectedVariant.id} productName={product.name} />
        ) : (
          <AddToCartButton
            variantId={selectedVariant.id}
            disabled={stockStatus === "out-of-stock"}
          />
        )}
      </div>

      {specs.length > 0 && (
        <dl className="mt-8 divide-y divide-border border-t border-border">
          {specs.map((spec) => (
            <DefinitionRow key={spec.label} label={spec.label} value={spec.value} />
          ))}
        </dl>
      )}
    </div>
  );
}

export { ProductPurchasePanel };
