"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Boxes, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { RowActionsMenu, type RowAction } from "@/components/admin/data/RowActionsMenu";
import { EmptyState } from "@/components/admin/feedback/EmptyState";
import { StatusToggle } from "@/components/admin/feedback/StatusToggle";
import { StockActionsPanel } from "@/components/admin/stock/StockActionsPanel";
import { deleteProduct, deleteProductVariant, updateProduct, updateProductVariant } from "@/services/product.service";
import type { Category } from "@/types/category";
import type { Product, ProductVariant } from "@/types/product";
import { getApiErrorMessage } from "@/utils/apiError";
import { confirmToast } from "@/utils/confirmToast";
import { formatCurrency } from "@/utils/currency";

interface ProductRow {
  product: Product;
  variant: ProductVariant;
  isOnlyVariant: boolean;
}

function buildRows(products: Product[]): ProductRow[] {
  return products.flatMap((product) =>
    product.variants.map((variant) => ({
      product,
      variant,
      isOnlyVariant: product.variants.length === 1,
    }))
  );
}

function rowDisplayName(row: ProductRow): string {
  if (row.isOnlyVariant || !row.variant.label) return row.product.name;
  return `${row.product.name} — ${row.variant.label}`;
}

interface ProductsTableProps {
  products: Product[];
  categories: Category[];
  onProductsChange: (products: Product[]) => void;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}

export function ProductsTable({
  products,
  categories,
  onProductsChange,
  hasActiveFilters = false,
  onClearFilters,
}: ProductsTableProps) {
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [stockVariant, setStockVariant] = useState<ProductVariant | null>(null);

  function categoryName(categoryId: number): string {
    return categories.find((c) => c.id === categoryId)?.name ?? "-";
  }

  function updateVariantIn(productId: number, variant: ProductVariant) {
    onProductsChange(
      products.map((p) =>
        p.id === productId ? { ...p, variants: p.variants.map((v) => (v.id === variant.id ? variant : v)) } : p
      )
    );
  }

  async function handleToggleActive(row: ProductRow) {
    setTogglingId(row.variant.id);
    try {
      if (row.isOnlyVariant) {
        const updated = await updateProduct(row.product.id, { is_active: !row.product.is_active });
        onProductsChange(
          products.map((p) => (p.id === row.product.id ? { ...p, is_active: updated.is_active } : p))
        );
      } else {
        const updated = await updateProductVariant(row.product.id, row.variant.id, {
          is_active: !row.variant.is_active,
        });
        updateVariantIn(row.product.id, updated);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível atualizar o status."));
    } finally {
      setTogglingId(null);
    }
  }

  function handleDelete(row: ProductRow) {
    const label = rowDisplayName(row);
    confirmToast(`Excluir "${label}"?`, () => performDelete(row), { confirmLabel: "Excluir" });
  }

  async function performDelete(row: ProductRow) {
    setDeletingId(row.variant.id);
    try {
      if (row.isOnlyVariant) {
        await deleteProduct(row.product.id);
        onProductsChange(products.filter((p) => p.id !== row.product.id));
      } else {
        await deleteProductVariant(row.product.id, row.variant.id);
        onProductsChange(
          products.map((p) =>
            p.id === row.product.id
              ? { ...p, variants: p.variants.filter((v) => v.id !== row.variant.id) }
              : p
          )
        );
      }
      toast.success("Excluído.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível excluir."));
    } finally {
      setDeletingId(null);
    }
  }

  function handleStockChange(row: ProductRow, newQuantity: number) {
    const updated = { ...row.variant, stock_quantity: newQuantity };
    updateVariantIn(row.product.id, updated);
    setStockVariant(updated);
  }

  const rows = buildRows(products);

  if (rows.length === 0) {
    return hasActiveFilters ? (
      <EmptyState
        message="Nenhum resultado para estes filtros."
        action={onClearFilters ? { label: "Limpar filtros", onClick: onClearFilters } : undefined}
      />
    ) : (
      <EmptyState
        message="Nenhum produto encontrado."
        action={{ label: "Novo produto", href: "/admin/products/new" }}
      />
    );
  }

  const stockRow = stockVariant ? rows.find((r) => r.variant.id === stockVariant.id) ?? null : null;

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Estoque</TableHead>
            <TableHead>Status</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const { product, variant } = row;
            const isActive = row.isOnlyVariant ? product.is_active : variant.is_active;
            const lowStock = !variant.is_custom && variant.stock_quantity <= variant.stock_minimum;

            return (
              <TableRow key={variant.id}>
                <TableCell>
                  <div className="relative size-10 overflow-hidden rounded-md bg-muted">
                    {product.images[0] && (
                      <Image
                        src={product.images[0].image_url}
                        alt=""
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  {rowDisplayName(row)}
                  {variant.is_custom && (
                    <Badge variant="accent" size="sm" className="ml-1.5">
                      Personalizado
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">{variant.sku}</TableCell>
                <TableCell className="text-muted-foreground">{categoryName(product.category_id)}</TableCell>
                <TableCell className="font-medium text-foreground">
                  {variant.is_custom ? "Sob consulta" : formatCurrency(variant.price ?? "0")}
                </TableCell>
                <TableCell>
                  {variant.is_custom ? (
                    "-"
                  ) : lowStock ? (
                    <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                      {variant.stock_quantity}
                    </span>
                  ) : (
                    <span className="font-medium text-foreground">{variant.stock_quantity}</span>
                  )}
                </TableCell>
                <TableCell>
                  <StatusToggle
                    active={isActive}
                    disabled={togglingId === variant.id}
                    onToggle={() => handleToggleActive(row)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1.5">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" aria-label="Editar produto" asChild>
                          <Link href={`/admin/products/${product.id}`}>
                            <Pencil className="size-3.5" aria-hidden />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Editar produto</TooltipContent>
                    </Tooltip>
                    <RowActionsMenu
                      actions={[
                        ...(!variant.is_custom
                          ? [
                              {
                                label: "Gerenciar estoque",
                                icon: Boxes,
                                onClick: () => setStockVariant(variant),
                              } satisfies RowAction,
                            ]
                          : []),
                        {
                          label: "Excluir",
                          icon: Trash2,
                          variant: "destructive",
                          disabled: deletingId === variant.id,
                          onClick: () => handleDelete(row),
                        },
                      ]}
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Dialog open={stockRow !== null} onOpenChange={(open) => !open && setStockVariant(null)}>
        <DialogContent>
          {stockRow && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Estoque — {rowDisplayName(stockRow)} ({stockRow.variant.stock_quantity} unidades)
                </DialogTitle>
              </DialogHeader>
              <StockActionsPanel
                variantId={stockRow.variant.id}
                stockQuantity={stockRow.variant.stock_quantity}
                onStockChange={(qty) => handleStockChange(stockRow, qty)}
                bare
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
