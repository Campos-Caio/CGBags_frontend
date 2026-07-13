"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { AdminDetailHeader } from "@/components/admin/AdminDetailHeader";
import { StatusToggle } from "@/components/admin/StatusToggle";
import { ProductForm, type ProductFormHandle } from "@/components/admin/products/ProductForm";
import { ProductImageManager } from "@/components/admin/products/ProductImageManager";
import { StockActionsPanel } from "@/components/admin/stock/StockActionsPanel";
import { Button } from "@/components/ui/button";
import { getProductByIdAdmin, updateProduct } from "@/services/product.service";
import type { Product, ProductAdminInput, ProductImage } from "@/types/product";
import { getApiErrorMessage } from "@/utils/apiError";

type PageStatus = "loading" | "ready" | "error";

const FORM_ID = "product-edit-form";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const productId = Number(params.id);

  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<PageStatus>("loading");
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const formRef = useRef<ProductFormHandle>(null);

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

  async function toggleActive() {
    if (!product) return;
    const nextActive = !product.is_active;
    try {
      const updated = await updateProduct(productId, { is_active: nextActive });
      setProduct((prev) => (prev ? { ...prev, ...updated, images: prev.images } : prev));
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível atualizar o status do produto."));
    }
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
    <div className="flex flex-col">
      <AdminDetailHeader
        backHref="/admin/products"
        backLabel="Voltar para produtos"
        title={product.name}
        subtitle={`SKU ${product.sku}`}
        isDirty={isDirty}
        onSaveAndLeave={() => formRef.current?.save() ?? Promise.resolve(false)}
        meta={
          <StatusToggle
            active={product.is_active}
            inactiveLabel="Inativo"
            onToggle={toggleActive}
            title="Produto visível na loja"
          />
        }
        actions={
          <Button type="submit" form={FORM_ID} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar alterações"}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <ProductForm
            ref={formRef}
            product={product}
            formId={FORM_ID}
            onSubmit={handleSubmit}
            onSavingChange={setIsSaving}
            onDirtyChange={setIsDirty}
          />
        </div>

        <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:col-span-1 lg:self-start">
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
      </div>
    </div>
  );
}
