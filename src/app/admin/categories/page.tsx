import type { Metadata } from "next";

import { PageHeader } from "@/components/admin/layout/PageHeader";
import { CategoryManager } from "@/components/admin/categories/CategoryManager";

export const metadata: Metadata = {
  title: "Categorias",
};

export default function AdminCategoriesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Categorias" />
      <CategoryManager />
    </div>
  );
}
