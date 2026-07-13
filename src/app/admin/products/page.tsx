"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { AdminPagination } from "@/components/admin/AdminPagination";
import { ProductsTable } from "@/components/admin/products/ProductsTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAdminList } from "@/hooks/useAdminList";
import { listCategories } from "@/services/category.service";
import { listProductsAdmin } from "@/services/product.service";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";
import { getApiErrorMessage } from "@/utils/apiError";

type StatusFilter = "all" | "active" | "inactive";

export default function AdminProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [status, setStatus] = useState<StatusFilter>("all");

  useEffect(() => {
    listCategories()
      .then((data) => setCategories(data))
      .catch((error) => {
        toast.error(getApiErrorMessage(error, "Não foi possível carregar as categorias."));
      });
  }, []);

  const {
    data: products,
    setData: setProducts,
    isLoading,
    page,
    setPage,
    pageSize,
  } = useAdminList<Product>({
    fetchPage: ({ skip, limit }) =>
      listProductsAdmin({
        search: search || undefined,
        category_id: categoryId === "" ? undefined : categoryId,
        is_active: status === "all" ? undefined : status === "active",
        skip,
        limit,
      }),
    deps: [search, categoryId, status],
    errorMessage: "Não foi possível carregar os produtos.",
  });

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

      <AdminPagination page={page} onPageChange={setPage} itemCount={products.length} pageSize={pageSize} />
    </div>
  );
}
