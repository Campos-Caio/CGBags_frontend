"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ProductForm } from "@/components/admin/products/ProductForm";
import { ProductImageManager } from "@/components/admin/products/ProductImageManager";
import { StockActionsPanel } from "@/components/admin/stock/StockActionsPanel";
import { getProductByIdAdmin, updateProduct } from "@/services/product.service";
import type { Product, ProductAdminInput, ProductImage } from "@/types/product";
import { getApiErrorMessage } from "@/utils/apiError";

type PageStatus = "loading" | "ready" | "error";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const productId = Number(params.id);

  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<PageStatus>("loading");

  useEffect(() => {
    let cancelled = false;

    getProductByIdAdmin(productId)
      .then((data) => {
        if (cancelled) return;
        if (data === null) {
          setStatus("error");
          return;
        }
        setProduct(data);
        setStatus("ready");
      })
      .catch((error) => {
        if (cancelled) return;
        setStatus("error");
        toast.error(getApiErrorMessage(error, "Não foi possível carregar este produto."));
      });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  async function handleSubmit(data: ProductAdminInput) {
    const updated = await updateProduct(productId, data);
    setProduct((prev) => (prev ? { ...prev, ...updated, images: prev.images } : prev));
    toast.success("Produto atualizado.");
  }

  function handleImagesChange(images: ProductImage[]) {
    setProduct((prev) => (prev ? { ...prev, images } : prev));
  }

  function handleStockChange(newQuantity: number) {
    setProduct((prev) => (prev ? { ...prev, stock_quantity: newQuantity } : prev));
  }

  if (status === "loading") {
    return <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>;
  }

  if (status === "error" || !product) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Não foi possível carregar este produto.
      </p>
    );
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Editar produto</h1>
      <ProductForm product={product} onSubmit={handleSubmit} submitLabel="Salvar alterações" />
      <ProductImageManager
        productId={product.id}
        images={product.images}
        onChange={handleImagesChange}
      />
      <StockActionsPanel
        productId={product.id}
        stockQuantity={product.stock_quantity}
        onStockChange={handleStockChange}
      />
    </div>
  );
}
