import { api } from "@/lib/api";
import type { Category, CategoryInput, CategoryUpdateInput } from "@/types/category";

export async function listCategories(): Promise<Category[]> {
  const response = await api.get<Category[]>("/categories/", { params: { limit: 100 } });
  return response.data;
}

export async function createCategory(data: CategoryInput): Promise<Category> {
  const response = await api.post<Category>("/categories/", data);
  return response.data;
}

export async function updateCategory(id: number, data: CategoryUpdateInput): Promise<Category> {
  const response = await api.patch<Category>(`/categories/${id}`, data);
  return response.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`/categories/${id}`);
}
