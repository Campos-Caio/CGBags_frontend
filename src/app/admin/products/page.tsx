"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Boxes, Plus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/layout/PageHeader";
import { FilterBar } from "@/components/admin/data/FilterBar";
import { TablePagination } from "@/components/admin/data/TablePagination";
import { ProductsTable } from "@/components/admin/products/ProductsTable";
import { LoadingState } from "@/components/admin/feedback/LoadingState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminList } from "@/hooks/useAdminList";
import { listCategories } from "@/services/category.service";
import { listProductsAdmin } from "@/services/product.service";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";
import { getApiErrorMessage } from "@/utils/apiError";

type StatusFilter = "all" | "active" | "inactive";

export default function AdminProductsPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [status, setStatus] = useState<StatusFilter>("all");

  // Restaura os filtros a partir da URL ao montar — ex.: o admin busca "corrente
  // 8mm", cria o produto que faltava e volta pra lista sem perder a busca.
  // Lido direto de window.location (não useSearchParams) pra não exigir um
  // Suspense boundary nesta página.
  useEffect(() => {
    async function restoreFromUrl() {
      await Promise.resolve();
      const params = new URLSearchParams(window.location.search);
      const urlSearch = params.get("search");
      const urlCategory = params.get("category");
      const urlStatus = params.get("status");
      if (urlSearch) setSearch(urlSearch);
      if (urlCategory) setCategoryId(Number(urlCategory));
      if (urlStatus === "active" || urlStatus === "inactive") setStatus(urlStatus);
    }

    restoreFromUrl();
  }, []);

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

  function updateUrl(next: { search?: string; categoryId?: number | ""; status?: StatusFilter }) {
    const nextSearch = next.search ?? search;
    const nextCategory = next.categoryId ?? categoryId;
    const nextStatus = next.status ?? status;

    const params = new URLSearchParams();
    if (nextSearch) params.set("search", nextSearch);
    if (nextCategory !== "") params.set("category", String(nextCategory));
    if (nextStatus !== "all") params.set("status", nextStatus);

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function handleSearchChange(value: string) {
    setPage(0);
    setSearch(value);
    updateUrl({ search: value });
  }

  function handleCategoryChange(value: number | "") {
    setPage(0);
    setCategoryId(value);
    updateUrl({ categoryId: value });
  }

  function handleStatusChange(value: StatusFilter) {
    setPage(0);
    setStatus(value);
    updateUrl({ status: value });
  }

  function clearFilters() {
    setPage(0);
    setSearch("");
    setCategoryId("");
    setStatus("all");
    router.replace(pathname, { scroll: false });
  }

  const hasActiveFilters = search !== "" || categoryId !== "" || status !== "all";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Produtos"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/admin/stock">
                <Boxes className="size-3.5" aria-hidden />
                Movimentações de estoque
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/products/new">
                <Plus className="size-3.5" aria-hidden />
                Novo produto
              </Link>
            </Button>
          </>
        }
      />

      <FilterBar
        resultCount={products.length}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      >
        <Input
          placeholder="Buscar por nome ou descrição"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={categoryId === "" ? "all" : String(categoryId)}
          onValueChange={(value) => handleCategoryChange(value === "all" ? "" : Number(value))}
        >
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(value) => handleStatusChange(value as StatusFilter)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="active">Somente ativos</SelectItem>
            <SelectItem value="inactive">Somente inativos</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>

      <Card>
        <CardContent>
          {isLoading ? (
            <LoadingState />
          ) : (
            <ProductsTable
              products={products}
              categories={categories}
              onProductsChange={setProducts}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
            />
          )}
        </CardContent>
      </Card>

      <TablePagination page={page} onPageChange={setPage} itemCount={products.length} pageSize={pageSize} />
    </div>
  );
}
