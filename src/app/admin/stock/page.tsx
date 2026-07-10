"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { LowStockTable } from "@/components/admin/stock/LowStockTable";
import { MovementsTable } from "@/components/admin/stock/MovementsTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listProductsAdmin } from "@/services/product.service";
import { getLowStockProducts, listMovements } from "@/services/stock.service";
import type { Product } from "@/types/product";
import type { StockMovement, StockMovementType } from "@/types/stock";
import { getApiErrorMessage } from "@/utils/apiError";
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
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [isLoadingLowStock, setIsLoadingLowStock] = useState(true);

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoadingMovements, setIsLoadingMovements] = useState(true);
  const [productId, setProductId] = useState<number | "">("");
  const [movementType, setMovementType] = useState<StockMovementType | "">("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    getLowStockProducts()
      .then((data) => setLowStockProducts(data))
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
          product_id: productId === "" ? undefined : productId,
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
  }, [productId, movementType, page]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Estoque</h1>

      <Card>
        <CardHeader>
          <CardTitle>Estoque baixo</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingLowStock ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>
          ) : (
            <LowStockTable products={lowStockProducts} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Movimentações</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <select
            value={productId}
            onChange={(e) => {
              setPage(0);
              setProductId(e.target.value === "" ? "" : Number(e.target.value));
            }}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
          >
            <option value="">Todos os produtos</option>
            {allProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            value={movementType}
            onChange={(e) => {
              setPage(0);
              setMovementType(e.target.value as StockMovementType | "");
            }}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
          >
            <option value="">Todos os tipos</option>
            {MOVEMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {STOCK_MOVEMENT_TYPE_LABEL[type]}
              </option>
            ))}
          </select>
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
