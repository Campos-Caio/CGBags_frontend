import type { Metadata } from "next";

import { CategoryManager } from "@/components/admin/categories/CategoryManager";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Categorias",
};

export default function AdminCategoriesPage() {
  return (
    <Container className="max-w-3xl py-8">
      <h1 className="mb-6 font-heading text-2xl font-semibold text-foreground">Categorias</h1>
      <CategoryManager />
    </Container>
  );
}
