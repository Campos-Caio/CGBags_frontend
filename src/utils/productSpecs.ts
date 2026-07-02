import type { Product } from "@/types/product";

export interface ProductSpec {
  label: string;
  value: string;
}

function isPositive(value: string | null): boolean {
  return value != null && Number(value) > 0;
}

export function getProductSpecs(product: Product): ProductSpec[] {
  const specs: ProductSpec[] = [];

  if (isPositive(product.weight)) {
    specs.push({ label: "Peso", value: `${product.weight} kg` });
  }

  if (isPositive(product.width) && isPositive(product.height) && isPositive(product.length)) {
    specs.push({
      label: "Dimensões (L x A x C)",
      value: `${product.width} x ${product.height} x ${product.length} cm`,
    });
  }

  if (isPositive(product.meters)) {
    specs.push({ label: "Metragem", value: `${product.meters} m` });
  }

  if (product.vehicle_model) {
    specs.push({ label: "Veículo compatível", value: product.vehicle_model });
  }

  return specs;
}
