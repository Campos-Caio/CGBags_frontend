"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ProductForm } from "@/components/admin/products/ProductForm";
import { createProduct } from "@/services/product.service";
import type { ProductAdminInput } from "@/types/product";

export default function NewProductPage() {
  const router = useRouter();

  async function handleSubmit(data: ProductAdminInput) {
    const created = await createProduct(data);
    toast.success("Produto criado. Agora você pode adicionar imagens.");
    router.push(`/admin/products/${created.id}`);
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Novo produto</h1>
      <ProductForm onSubmit={handleSubmit} submitLabel="Criar produto" />
    </div>
  );
}
