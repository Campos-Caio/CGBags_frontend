import type { ReactNode } from "react";

import type { Product } from "@/types/product";

interface ProductGridProps {
  products: Product[];
  renderItem: (product: Product) => ReactNode;
  emptyMessage?: string;
}

function ProductGrid({
  products,
  renderItem,
  emptyMessage = "Nenhum produto encontrado.",
}: ProductGridProps) {
  if (products.length === 0) {
    return <p className="text-center text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
      {products.map((product) => (
        <div key={product.id}>{renderItem(product)}</div>
      ))}
    </div>
  );
}

export { ProductGrid };
