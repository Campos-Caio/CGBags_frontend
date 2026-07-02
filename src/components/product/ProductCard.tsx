import Image from "next/image";
import Link from "next/link";
import { PackageSearch, Truck } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StockBadge } from "@/components/product/StockBadge";
import type { Product } from "@/types/product";
import { formatCurrency } from "@/utils/currency";

interface ProductCardProps {
  product: Product;
  /** Exibe status de estoque e modelo de veículo compatível (usado no catálogo). */
  showStock?: boolean;
}

function ProductCard({ product, showStock = false }: ProductCardProps) {
  const coverImage = product.images[0]?.image_url;

  return (
    <Link
      href={`/products/${product.id}`}
      aria-label={`Ver detalhes de ${product.name}`}
      className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Card className="h-full transition-shadow hover:shadow-md">
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <PackageSearch className="size-10" aria-hidden />
            </div>
          )}
        </div>

        <CardHeader>
          <CardTitle>{product.name}</CardTitle>
          {showStock && <StockBadge stockQuantity={product.stock_quantity} />}
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-3">
          {product.description && (
            <p
              className={showStock ? "text-sm text-muted-foreground" : "line-clamp-2 text-sm text-muted-foreground"}
            >
              {product.description}
            </p>
          )}

          {showStock && product.vehicle_model && (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Truck className="size-4 shrink-0" aria-hidden />
              Compatível com {product.vehicle_model}
            </p>
          )}

          <p
            className={
              showStock
                ? "mt-auto font-heading text-xl font-semibold text-foreground"
                : "font-heading text-lg font-semibold text-foreground"
            }
          >
            {formatCurrency(product.price)}
          </p>
        </CardContent>

        <CardFooter>
          <span className={buttonVariants({ className: "w-full" })}>Ver detalhes</span>
        </CardFooter>
      </Card>
    </Link>
  );
}

export { ProductCard };
