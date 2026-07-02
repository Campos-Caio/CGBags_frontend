import { Hero } from "@/components/home/Hero";
import { AgroSection } from "@/components/home/AgroSection";
import { ProductsSection } from "@/components/home/ProductsSection";
import { WhyChooseSection } from "@/components/home/WhyChooseSection";
import { listProducts } from "@/services/product.service";
import type { Product } from "@/types/product";

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    return await listProducts({ limit: 4 });
  } catch {
    return [];
  }
}

export default async function Home() {
  const products = await getFeaturedProducts();

  return (
    <>
      <Hero />
      <AgroSection />
      <ProductsSection products={products} />
      <WhyChooseSection />
    </>
  );
}
