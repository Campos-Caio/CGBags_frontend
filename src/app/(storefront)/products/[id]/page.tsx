import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Container } from "@/components/ui/container";
import { DefinitionRow } from "@/components/ui/definition-row";
import { ProductGallery } from "@/components/product/ProductGallery";
import { StockBadge } from "@/components/product/StockBadge";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { getProductById } from "@/services/product.service";
import type { Product } from "@/types/product";
import { formatCurrency } from "@/utils/currency";
import { getProductSpecs } from "@/utils/productSpecs";
import { getStockStatus } from "@/utils/stock";

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

  const specs = getProductSpecs(product);
  const stockStatus = getStockStatus(product.stock_quantity);

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

        <div>
          <StockBadge stockQuantity={product.stock_quantity} />

          <h1 className="mt-3 font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            {product.name}
          </h1>

          <p className="mt-3 font-heading text-2xl font-semibold text-foreground">
            {formatCurrency(product.price)}
          </p>

          {product.description && (
            <p className="mt-6 text-base text-muted-foreground">{product.description}</p>
          )}

          <div className="mt-6">
            <AddToCartButton productId={product.id} disabled={stockStatus === "out-of-stock"} />
          </div>

          <dl className="mt-8 divide-y divide-border border-t border-border">
            {specs.map((spec) => (
              <DefinitionRow key={spec.label} label={spec.label} value={spec.value} />
            ))}
          </dl>
        </div>
      </div>
    </Container>
  );
}
