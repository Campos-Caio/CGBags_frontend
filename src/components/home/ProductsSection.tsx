import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/types/product";

interface ProductsSectionProps {
  products: Product[];
}

function ProductsSection({ products }: ProductsSectionProps) {
  return (
    <Section title="Nossos Produtos" subtitle="Conheça os principais itens do nosso catálogo.">
      <ProductGrid
        products={products}
        renderItem={(product) => <ProductCard product={product} />}
        emptyMessage="Nossos produtos estarão disponíveis em breve."
      />

      <div className="mt-10 text-center">
        <Button variant="outline" asChild>
          <Link href="/products">Ver catálogo completo</Link>
        </Button>
      </div>
    </Section>
  );
}

export { ProductsSection };
