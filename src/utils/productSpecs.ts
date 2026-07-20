import type { Product, ProductVariant } from "@/types/product";

export interface ProductSpec {
  label: string;
  value: string;
}

function isPositive(value: string | null): boolean {
  return value != null && Number(value) > 0;
}

/** Specs da variante selecionada (peso/dimensoes/metragem mudam por tamanho). */
export function getVariantSpecs(variant: ProductVariant): ProductSpec[] {
  const specs: ProductSpec[] = [];

  if (isPositive(variant.weight)) {
    specs.push({ label: "Peso", value: `${variant.weight} kg` });
  }

  if (isPositive(variant.width) && isPositive(variant.height) && isPositive(variant.length)) {
    specs.push({
      label: "Dimensões (L x A x C)",
      value: `${variant.width} x ${variant.height} x ${variant.length} cm`,
    });
  }

  if (isPositive(variant.meters)) {
    specs.push({ label: "Metragem", value: `${variant.meters} m` });
  }

  return specs;
}

/** Specs do produto em si (nao mudam por tamanho). */
export function getProductSpecs(product: Product): ProductSpec[] {
  const specs: ProductSpec[] = [];

  if (product.vehicle_model) {
    specs.push({ label: "Veículo compatível", value: product.vehicle_model });
  }

  return specs;
}
