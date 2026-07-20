"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { DetailHeader } from "@/components/admin/layout/DetailHeader";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { Button } from "@/components/ui/button";
import { createProduct } from "@/services/product.service";
import type { ProductAdminInput } from "@/types/product";

const FORM_ID = "product-new-form";

export default function NewProductPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(data: ProductAdminInput) {
    const created = await createProduct(data);
    toast.success("Produto criado. Agora você pode adicionar imagens.");
    router.push(`/admin/products/${created.id}`);
  }

  return (
    <div className="flex flex-col">
      <DetailHeader
        backHref="/admin/products"
        backLabel="Voltar para produtos"
        title="Novo produto"
        actions={
          <Button type="submit" form={FORM_ID} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Criar produto"}
          </Button>
        }
      />

      <ProductForm formId={FORM_ID} onSubmit={handleSubmit} onSavingChange={setIsSaving} />
    </div>
  );
}
