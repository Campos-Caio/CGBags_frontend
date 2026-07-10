"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { ProductsTable } from "@/components/admin/products/ProductsTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listCategories } from "@/services/category.service";
import { listProductsAdmin } from "@/services/product.service";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";
import { getApiErrorMessage } from "@/utils/apiError";

const PAGE_SIZE = 20;

type StatusFilter = "all" | "active" | "inactive";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(0);

  useEffect(() => {
    listCategories()
      .then((data) => setCategories(data))
      .catch((error) => {
        toast.error(getApiErrorMessage(error, "Não foi possível carregar as categorias."));
      });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      await Promise.resolve();
      if (cancelled) return;
      setIsLoading(true);

      try {
        const data = await listProductsAdmin({
          search: search || undefined,
          category_id: categoryId === "" ? undefined : categoryId,
          is_active: status === "all" ? undefined : status === "active",
          skip: page * PAGE_SIZE,
          limit: PAGE_SIZE,
        });
        if (!cancelled) setProducts(data);
      } catch (error) {
        if (!cancelled) {
          toast.error(getApiErrorMessage(error, "Não foi possível carregar os produtos."));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [search, categoryId, status, page]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Produtos</h1>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="size-3.5" aria-hidden />
            Novo produto
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Input
            placeholder="Buscar por nome ou descrição"
            value={search}
            onChange={(e) => {
              setPage(0);
              setSearch(e.target.value);
            }}
            className="max-w-xs"
          />
          <select
            value={categoryId}
            onChange={(e) => {
              setPage(0);
              setCategoryId(e.target.value === "" ? "" : Number(e.target.value));
            }}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
          >
            <option value="">Todas as categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => {
              setPage(0);
              setStatus(e.target.value as StatusFilter);
            }}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
          >
            <option value="all">Todos os status</option>
            <option value="active">Somente ativos</option>
            <option value="inactive">Somente inativos</option>
          </select>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>
          ) : (
            <ProductsTable
              products={products}
              categories={categories}
              onProductsChange={setProducts}
            />
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
          disabled={products.length < PAGE_SIZE}
          onClick={() => setPage((p) => p + 1)}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}
