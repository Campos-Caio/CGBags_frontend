"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listCategories } from "@/services/category.service";
import type { Category } from "@/types/category";
import type { Product, ProductAdminUpdateInput } from "@/types/product";
import { getApiErrorMessage } from "@/utils/apiError";

interface FormState {
  category_id: number | "";
  name: string;
  slug: string;
  description: string;
  vehicle_model: string;
  is_active: boolean;
}

function toForm(product: Product): FormState {
  return {
    category_id: product.category_id,
    name: product.name,
    slug: product.slug,
    description: product.description ?? "",
    vehicle_model: product.vehicle_model ?? "",
    is_active: product.is_active,
  };
}

function toInput(form: FormState): ProductAdminUpdateInput {
  return {
    category_id: Number(form.category_id),
    name: form.name,
    slug: form.slug || undefined,
    description: form.description || undefined,
    vehicle_model: form.vehicle_model || undefined,
    is_active: form.is_active,
  };
}

interface ProductBasicInfoFormProps {
  product: Product;
  formId: string;
  onSubmit: (data: ProductAdminUpdateInput) => Promise<void>;
  onSavingChange?: (isSaving: boolean) => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export interface ProductBasicInfoFormHandle {
  /** Salva a partir de fora do form (ex.: "salvar e sair" no header). Retorna se deu certo. */
  save: () => Promise<boolean>;
}

export const ProductBasicInfoForm = forwardRef<ProductBasicInfoFormHandle, ProductBasicInfoFormProps>(
  function ProductBasicInfoForm({ product, formId, onSubmit, onSavingChange, onDirtyChange }, ref) {
    const [categories, setCategories] = useState<Category[]>([]);
    const initialForm = toForm(product);
    const [form, setForm] = useState<FormState>(initialForm);
    const [savedForm, setSavedForm] = useState<FormState>(initialForm);

    useEffect(() => {
      listCategories()
        .then(setCategories)
        .catch((error) => {
          toast.error(getApiErrorMessage(error, "Não foi possível carregar as categorias."));
        });
    }, []);

    useEffect(() => {
      onDirtyChange?.(JSON.stringify(form) !== JSON.stringify(savedForm));
    }, [form, savedForm, onDirtyChange]);

    async function doSubmit(): Promise<boolean> {
      onSavingChange?.(true);
      try {
        await onSubmit(toInput(form));
        setSavedForm(form);
        return true;
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Não foi possível salvar este produto."));
        return false;
      } finally {
        onSavingChange?.(false);
      }
    }

    useImperativeHandle(ref, () => ({ save: doSubmit }));

    async function handleSubmit(event: FormEvent) {
      event.preventDefault();
      await doSubmit();
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Dados do produto</CardTitle>
        </CardHeader>
        <CardContent>
          <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Nome" htmlFor="p-name">
              <Input
                id="p-name"
                required
                maxLength={255}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Slug" htmlFor="p-slug">
                <Input
                  id="p-slug"
                  maxLength={255}
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                />
              </Field>
              <Field label="Categoria" htmlFor="p-category">
                <Select
                  value={form.category_id === "" ? "" : String(form.category_id)}
                  onValueChange={(value) => setForm((f) => ({ ...f, category_id: Number(value) }))}
                >
                  <SelectTrigger id="p-category" className="w-full">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field label="Descrição (opcional)" htmlFor="p-description">
              <textarea
                id="p-description"
                rows={4}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
              />
            </Field>

            <Field label="Modelo de veículo (opcional)" htmlFor="p-vehicle">
              <Input
                id="p-vehicle"
                maxLength={100}
                value={form.vehicle_model}
                onChange={(e) => setForm((f) => ({ ...f, vehicle_model: e.target.value }))}
              />
            </Field>

            <label className="flex items-center gap-2 text-sm text-foreground">
              <Checkbox
                checked={form.is_active}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, is_active: checked === true }))}
              />
              Produto ativo (visível na loja)
            </label>
          </form>
        </CardContent>
      </Card>
    );
  }
);

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
