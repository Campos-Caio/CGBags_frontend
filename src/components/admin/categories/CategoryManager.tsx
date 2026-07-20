"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/admin/feedback/EmptyState";
import { LoadingState } from "@/components/admin/feedback/LoadingState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "@/services/category.service";
import type { Category, CategoryInput } from "@/types/category";
import { getApiErrorMessage } from "@/utils/apiError";
import { confirmToast } from "@/utils/confirmToast";

interface CategoryForm {
  name: string;
  slug: string;
  parent_id: number | "";
}

const EMPTY_FORM: CategoryForm = {
  name: "",
  slug: "",
  parent_id: "",
};

function toForm(category: Category): CategoryForm {
  return {
    name: category.name,
    slug: category.slug,
    parent_id: category.parent_id ?? "",
  };
}

function toInput(form: CategoryForm): CategoryInput {
  return {
    name: form.name,
    slug: form.slug || undefined,
    parent_id: form.parent_id === "" ? null : form.parent_id,
  };
}

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<CategoryForm>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    listCategories()
      .then((data) => {
        if (!cancelled) setCategories(data);
      })
      .catch((error) => {
        if (!cancelled) {
          toast.error(getApiErrorMessage(error, "Não foi possível carregar as categorias."));
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function categoryName(id: number | null): string {
    if (id === null) return "-";
    return categories.find((c) => c.id === id)?.name ?? "-";
  }

  function startAdd() {
    setForm(EMPTY_FORM);
    setEditingId("new");
  }

  function startEdit(category: Category) {
    setForm(toForm(category));
    setEditingId(category.id);
  }

  function cancelEditing() {
    setEditingId(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);

    try {
      if (editingId === "new") {
        const created = await createCategory(toInput(form));
        setCategories((prev) => [...prev, created]);
        toast.success("Categoria criada.");
      } else if (typeof editingId === "number") {
        const updated = await updateCategory(editingId, toInput(form));
        setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        toast.success("Categoria atualizada.");
      }
      setEditingId(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível salvar esta categoria."));
    } finally {
      setIsSaving(false);
    }
  }

  function handleDelete(category: Category) {
    confirmToast(`Excluir a categoria "${category.name}"?`, () => performDelete(category), {
      confirmLabel: "Excluir",
    });
  }

  async function performDelete(category: Category) {
    setDeletingId(category.id);
    try {
      await deleteCategory(category.id);
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
      toast.success("Categoria excluída.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível excluir esta categoria."));
    } finally {
      setDeletingId(null);
    }
  }

  const parentOptions = categories.filter((c) => c.id !== editingId);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Categorias</CardTitle>
        {editingId === null && (
          <Button variant="outline" size="sm" onClick={startAdd}>
            <Plus className="size-3.5" aria-hidden />
            Nova categoria
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isLoading ? (
          <LoadingState className="py-2" />
        ) : (
          <>
            {categories.length === 0 && editingId === null && (
              <EmptyState message="Nenhuma categoria cadastrada." />
            )}

            {categories.length > 0 && (
              <div className="flex flex-col gap-3">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-border p-3.5"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-foreground">
                        {category.name}
                      </span>
                      <p className="text-sm text-muted-foreground">/{category.slug}</p>
                      {category.parent_id !== null && (
                        <p className="text-sm text-muted-foreground">
                          Categoria pai: {categoryName(category.parent_id)}
                        </p>
                      )}
                    </div>

                    {editingId === null && (
                      <div className="flex shrink-0 gap-1.5">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              aria-label="Editar categoria"
                              onClick={() => startEdit(category)}
                            >
                              <Pencil className="size-3.5" aria-hidden />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Editar categoria</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              aria-label="Excluir categoria"
                              disabled={deletingId === category.id}
                              onClick={() => handleDelete(category)}
                            >
                              <Trash2 className="size-3.5" aria-hidden />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Excluir categoria</TooltipContent>
                        </Tooltip>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {editingId !== null && (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 border-t border-border pt-4"
              >
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="cat-name" className="text-sm font-medium text-foreground">
                    Nome
                  </label>
                  <Input
                    id="cat-name"
                    required
                    maxLength={100}
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="cat-slug" className="text-sm font-medium text-foreground">
                    Slug (opcional)
                  </label>
                  <Input
                    id="cat-slug"
                    placeholder="gerado automaticamente"
                    maxLength={100}
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="cat-parent" className="text-sm font-medium text-foreground">
                    Categoria pai (opcional)
                  </label>
                  <Select
                    value={form.parent_id === "" ? "none" : String(form.parent_id)}
                    onValueChange={(value) =>
                      setForm((f) => ({
                        ...f,
                        parent_id: value === "none" ? "" : Number(value),
                      }))
                    }
                  >
                    <SelectTrigger id="cat-parent" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      {parentOptions.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Salvando..." : "Salvar categoria"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSaving}
                    onClick={cancelEditing}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
