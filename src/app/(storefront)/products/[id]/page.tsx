import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Container } from "@/components/ui/container";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { getProductById } from "@/services/product.service";
import type { Product } from "@/types/product";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

async function loadProduct(id: string): Promise<Product | null> {
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return null;

  return getProductById(numericId);
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await loadProduct(id);

  if (!product) {
    return { title: "Produto não encontrado" };
  }

  return {
    title: product.name,
    description: product.description ?? `Conheça ${product.name} da CG Bags.`,
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = await loadProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <Container className="py-12 sm:py-16">
      <Link
        href="/products"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Voltar para produtos
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} productName={product.name} />

        <ProductPurchasePanel product={product} />
      </div>
    </Container>
  );
}
