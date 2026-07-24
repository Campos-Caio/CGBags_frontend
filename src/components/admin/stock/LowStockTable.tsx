"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StockActionsPanel } from "@/components/admin/stock/StockActionsPanel";
import type { Product, ProductVariant } from "@/types/product";

interface LowStockTableProps {
  variants: ProductVariant[];
  products: Product[];
  onStockChange?: (variant: ProductVariant, newQuantity: number) => void;
}

export function LowStockTable({ variants, products, onStockChange }: LowStockTableProps) {
  const [stockVariant, setStockVariant] = useState<ProductVariant | null>(null);

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

  const activeVariant = stockVariant
    ? variants.find((v) => v.id === stockVariant.id) ?? stockVariant
    : null;

  return (
    <>
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
                <Button variant="outline" size="sm" onClick={() => setStockVariant(variant)}>
                  Adicionar estoque
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={activeVariant !== null} onOpenChange={(open) => !open && setStockVariant(null)}>
        <DialogContent>
          {activeVariant && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Estoque — {productName(activeVariant.product_id)}
                  {activeVariant.label ? ` — ${activeVariant.label}` : ""} (
                  {activeVariant.stock_quantity} unidades)
                </DialogTitle>
              </DialogHeader>
              <StockActionsPanel
                mode="single"
                variantId={activeVariant.id}
                stockQuantity={activeVariant.stock_quantity}
                onStockChange={(qty) => {
                  onStockChange?.(activeVariant, qty);
                  setStockVariant({ ...activeVariant, stock_quantity: qty });
                }}
                bare
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
