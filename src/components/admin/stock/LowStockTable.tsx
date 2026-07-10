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
import type { Product } from "@/types/product";

interface LowStockTableProps {
  products: Product[];
}

export function LowStockTable({ products }: LowStockTableProps) {
  if (products.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhum produto com estoque baixo.
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
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell className="font-medium text-foreground">{product.name}</TableCell>
            <TableCell className="text-muted-foreground">{product.sku}</TableCell>
            <TableCell>
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                {product.stock_quantity}
              </span>
            </TableCell>
            <TableCell className="text-muted-foreground">{product.stock_minimum}</TableCell>
            <TableCell>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/products/${product.id}`}>Adicionar estoque</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
