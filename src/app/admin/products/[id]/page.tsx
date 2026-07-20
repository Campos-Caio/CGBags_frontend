"use client";

import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { DetailHeader } from "@/components/admin/layout/DetailHeader";
import { ErrorState } from "@/components/admin/feedback/ErrorState";
import { LoadingState } from "@/components/admin/feedback/LoadingState";
import { StatusToggle } from "@/components/admin/feedback/StatusToggle";
import {
  ProductBasicInfoForm,
  type ProductBasicInfoFormHandle,
} from "@/components/admin/products/ProductBasicInfoForm";
import { ProductImageManager } from "@/components/admin/products/ProductImageManager";
import { ProductVariantManager } from "@/components/admin/products/ProductVariantManager";
import { Button } from "@/components/ui/button";
import { useAdminResource } from "@/hooks/useAdminResource";
import { getProductByIdAdmin, updateProduct } from "@/services/product.service";
import type { ProductAdminUpdateInput, ProductImage, ProductVariant } from "@/types/product";
import { getApiErrorMessage } from "@/utils/apiError";

const FORM_ID = "product-edit-form";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const productId = Number(params.id);

  const { data: product, setData: setProduct, status } = useAdminResource({
    fetch: () => getProductByIdAdmin(productId),
    deps: [productId],
    errorMessage: "Não foi possível carregar este produto.",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const formRef = useRef<ProductBasicInfoFormHandle>(null);

  async function handleSubmit(data: ProductAdminUpdateInput) {
    const updated = await updateProduct(productId, data);
    setProduct((prev) => (prev ? { ...prev, ...updated, images: prev.images, variants: prev.variants } : prev));
    toast.success("Produto atualizado.");
  }

  async function toggleActive() {
    if (!product) return;
    const nextActive = !product.is_active;
    try {
      const updated = await updateProduct(productId, { is_active: nextActive });
      setProduct((prev) => (prev ? { ...prev, ...updated, images: prev.images, variants: prev.variants } : prev));
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível atualizar o status do produto."));
    }
  }

  function handleImagesChange(images: ProductImage[]) {
    setProduct((prev) => (prev ? { ...prev, images } : prev));
  }

  function handleVariantsChange(variants: ProductVariant[]) {
    setProduct((prev) => (prev ? { ...prev, variants } : prev));
  }

  if (status === "loading") {
    return <LoadingState />;
  }

  if (status === "error" || !product) {
    return <ErrorState message="Não foi possível carregar este produto." />;
  }

  const skuSubtitle =
    product.variants.length === 1
      ? `SKU ${product.variants[0].sku}`
      : `${product.variants.length} variantes`;

  return (
    <div className="flex flex-col">
      <DetailHeader
        backHref="/admin/products"
        backLabel="Voltar para produtos"
        title={product.name}
        subtitle={skuSubtitle}
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
          <ProductBasicInfoForm
            ref={formRef}
            product={product}
            formId={FORM_ID}
            onSubmit={handleSubmit}
            onSavingChange={setIsSaving}
            onDirtyChange={setIsDirty}
          />
          <ProductVariantManager
            productId={product.id}
            variants={product.variants}
            onChange={handleVariantsChange}
          />
        </div>

        <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:col-span-1 lg:self-start">
          <ProductImageManager
            productId={product.id}
            images={product.images}
            onChange={handleImagesChange}
          />
        </div>
      </div>
    </div>
  );
}
