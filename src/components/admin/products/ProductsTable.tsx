"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteProduct, updateProduct } from "@/services/product.service";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";
import { getApiErrorMessage } from "@/utils/apiError";
import { confirmToast } from "@/utils/confirmToast";
import { formatCurrency } from "@/utils/currency";

interface ProductsTableProps {
  products: Product[];
  categories: Category[];
  onProductsChange: (products: Product[]) => void;
}

export function ProductsTable({ products, categories, onProductsChange }: ProductsTableProps) {
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function categoryName(categoryId: number): string {
    return categories.find((c) => c.id === categoryId)?.name ?? "-";
  }

  async function handleToggleActive(product: Product) {
    setTogglingId(product.id);
    try {
      const updated = await updateProduct(product.id, { is_active: !product.is_active });
      onProductsChange(
        products.map((p) => (p.id === product.id ? { ...p, is_active: updated.is_active } : p))
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível atualizar o status do produto."));
    } finally {
      setTogglingId(null);
    }
  }

  function handleDelete(product: Product) {
    confirmToast(`Excluir o produto "${product.name}"?`, () => performDelete(product), {
      confirmLabel: "Excluir",
    });
  }

  async function performDelete(product: Product) {
    setDeletingId(product.id);
    try {
      await deleteProduct(product.id);
      onProductsChange(products.filter((p) => p.id !== product.id));
      toast.success("Produto excluído.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível excluir este produto."));
    } finally {
      setDeletingId(null);
    }
  }

  if (products.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Nenhum produto encontrado.</p>;
  }

  return (
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
        {products.map((product) => (
          <TableRow key={product.id}>
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
            <TableCell className="font-medium text-foreground">{product.name}</TableCell>
            <TableCell className="text-muted-foreground">{product.sku}</TableCell>
            <TableCell className="text-muted-foreground">
              {categoryName(product.category_id)}
            </TableCell>
            <TableCell>{formatCurrency(product.price)}</TableCell>
            <TableCell>
              {product.stock_quantity}
              {product.stock_quantity <= product.stock_minimum && (
                <span className="ml-1.5 rounded-full bg-destructive/10 px-1.5 py-0.5 text-xs text-destructive">
                  baixo
                </span>
              )}
            </TableCell>
            <TableCell>
              <button
                type="button"
                disabled={togglingId === product.id}
                onClick={() => handleToggleActive(product)}
                className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/70 disabled:opacity-50"
              >
                {product.is_active ? "Ativo" : "Inativo"}
              </button>
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-1.5">
                <Button variant="outline" size="sm" aria-label="Editar produto" asChild>
                  <Link href={`/admin/products/${product.id}`}>
                    <Pencil className="size-3.5" aria-hidden />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Excluir produto"
                  disabled={deletingId === product.id}
                  onClick={() => handleDelete(product)}
                >
                  <Trash2 className="size-3.5" aria-hidden />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
