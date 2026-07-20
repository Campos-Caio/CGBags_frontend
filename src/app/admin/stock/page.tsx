"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { LowStockTable } from "@/components/admin/stock/LowStockTable";
import { MovementsTable } from "@/components/admin/stock/MovementsTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listProductsAdmin } from "@/services/product.service";
import { getLowStockVariants, listMovements } from "@/services/stock.service";
import type { Product, ProductVariant } from "@/types/product";
import type { StockMovement, StockMovementType } from "@/types/stock";
import { getApiErrorMessage } from "@/utils/apiError";
import { getVariantDisplayLabel } from "@/utils/productVariants";
import { STOCK_MOVEMENT_TYPE_LABEL } from "@/utils/stockMovement";

const PAGE_SIZE = 20;
const MOVEMENT_TYPES: StockMovementType[] = [
  "PURCHASE",
  "SALE",
  "ADJUSTMENT",
  "RETURN",
  "INITIAL_LOAD",
];

export default function AdminStockPage() {
  const [lowStockVariants, setLowStockVariants] = useState<ProductVariant[]>([]);
  const [isLoadingLowStock, setIsLoadingLowStock] = useState(true);

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoadingMovements, setIsLoadingMovements] = useState(true);
  const [variantId, setVariantId] = useState<number | "">("");
  const [movementType, setMovementType] = useState<StockMovementType | "">("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    getLowStockVariants()
      .then((data) => setLowStockVariants(data))
      .catch((error) => {
        toast.error(getApiErrorMessage(error, "Não foi possível carregar o estoque baixo."));
      })
      .finally(() => setIsLoadingLowStock(false));
  }, []);

  useEffect(() => {
    listProductsAdmin()
      .then((data) => setAllProducts(data))
      .catch((error) => {
        toast.error(getApiErrorMessage(error, "Não foi possível carregar os produtos."));
      });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadMovements() {
      await Promise.resolve();
      if (cancelled) return;
      setIsLoadingMovements(true);

      try {
        const data = await listMovements({
          variant_id: variantId === "" ? undefined : variantId,
          movement_type: movementType === "" ? undefined : movementType,
          skip: page * PAGE_SIZE,
          limit: PAGE_SIZE,
        });
        if (!cancelled) setMovements(data);
      } catch (error) {
        if (!cancelled) {
          toast.error(getApiErrorMessage(error, "Não foi possível carregar as movimentações."));
        }
      } finally {
        if (!cancelled) setIsLoadingMovements(false);
      }
    }

    loadMovements();

    return () => {
      cancelled = true;
    };
  }, [variantId, movementType, page]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/products"
          className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Voltar para produtos
        </Link>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Movimentações de estoque
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Para adicionar ou retirar estoque de uma variante específica, edite o produto — aqui é
          só o histórico e o alerta de estoque baixo.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estoque baixo</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingLowStock ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>
          ) : (
            <LowStockTable variants={lowStockVariants} products={allProducts} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Movimentações</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Select
            value={variantId === "" ? "all" : String(variantId)}
            onValueChange={(value) => {
              setPage(0);
              setVariantId(value === "all" ? "" : Number(value));
            }}
          >
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as variantes</SelectItem>
              {allProducts.flatMap((p) =>
                p.variants
                  .filter((v) => !v.is_custom)
                  .map((v) => (
                    <SelectItem key={v.id} value={String(v.id)}>
                      {p.name} — {getVariantDisplayLabel(v)}
                    </SelectItem>
                  ))
              )}
            </SelectContent>
          </Select>
          <Select
            value={movementType || "all"}
            onValueChange={(value) => {
              setPage(0);
              setMovementType(value === "all" ? "" : (value as StockMovementType));
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {MOVEMENT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {STOCK_MOVEMENT_TYPE_LABEL[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {isLoadingMovements ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>
          ) : (
            <MovementsTable movements={movements} />
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={movements.length < PAGE_SIZE}
          onClick={() => setPage((p) => p + 1)}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}
