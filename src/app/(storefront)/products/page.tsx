import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductCard } from "@/components/product/ProductCard";
import { listProducts } from "@/services/product.service";
import type { Product } from "@/types/product";

export const metadata: Metadata = {
  title: "Produtos",
  description:
    "Conheça o catálogo completo de produtos da CG Bags, fabricados para o agronegócio.",
};

// Catalogo muda por acao do admin (produto novo, estoque, ativacao) e precisa
// refletir isso na hora — sem isto, o Next trata a pagina como estatica (sem
// nenhuma API dinamica usada) e congela o resultado de listProducts() no
// HTML gerado em build time, nunca mais buscando de novo.
export const dynamic = "force-dynamic";

async function getProducts(): Promise<Product[]> {
  try {
    return await listProducts();
  } catch {
    return [];
  }
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <Container className="py-12 sm:py-16">
      <div className="mb-10 text-center">
        <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
          Nossos Produtos
        </h1>
        <p className="mt-3 text-muted-foreground">
          Conheça o catálogo completo de produtos CG Bags.
        </p>
      </div>

      <ProductGrid
        products={products}
        renderItem={(product) => <ProductCard product={product} showStock />}
        emptyMessage="Nenhum produto disponível no momento."
      />
    </Container>
  );
}
