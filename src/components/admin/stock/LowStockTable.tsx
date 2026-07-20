import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Product, ProductVariant } from "@/types/product";

interface LowStockTableProps {
  variants: ProductVariant[];
  products: Product[];
}

export function LowStockTable({ variants, products }: LowStockTableProps) {
  function productName(productId: number): string {
    return products.find((p) => p.id === productId)?.name ?? "-";
  }

  if (variants.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhuma variante com estoque baixo.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Produto</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Estoque atual</TableHead>
          <TableHead>Estoque mínimo</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {variants.map((variant) => (
          <TableRow key={variant.id}>
            <TableCell className="font-medium text-foreground">
              {productName(variant.product_id)}
              {variant.label && (
                <span className="block text-xs font-normal text-muted-foreground">
                  {variant.label}
                </span>
              )}
            </TableCell>
            <TableCell className="text-muted-foreground">{variant.sku}</TableCell>
            <TableCell>
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                {variant.stock_quantity}
              </span>
            </TableCell>
            <TableCell className="text-muted-foreground">{variant.stock_minimum}</TableCell>
            <TableCell>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/products/${variant.product_id}`}>Adicionar estoque</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
