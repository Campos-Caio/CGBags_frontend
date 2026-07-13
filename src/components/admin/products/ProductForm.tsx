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
import { Input } from "@/components/ui/input";
import { listCategories } from "@/services/category.service";
import type { Category } from "@/types/category";
import type { Product, ProductAdminInput } from "@/types/product";
import { getApiErrorMessage } from "@/utils/apiError";

interface ProductFormState {
  category_id: number | "";
  sku: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  stock_minimum: string;
  weight: string;
  width: string;
  height: string;
  length: string;
  vehicle_model: string;
  meters: string;
  is_active: boolean;
}

const EMPTY_FORM: ProductFormState = {
  category_id: "",
  sku: "",
  name: "",
  slug: "",
  description: "",
  price: "",
  stock_minimum: "0",
  weight: "",
  width: "",
  height: "",
  length: "",
  vehicle_model: "",
  meters: "",
  is_active: true,
};

function toForm(product: Product): ProductFormState {
  return {
    category_id: product.category_id,
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    description: product.description ?? "",
    price: product.price,
    stock_minimum: String(product.stock_minimum),
    weight: product.weight ?? "",
    width: product.width ?? "",
    height: product.height ?? "",
    length: product.length ?? "",
    vehicle_model: product.vehicle_model ?? "",
    meters: product.meters ?? "",
    is_active: product.is_active,
  };
}

function toInput(form: ProductFormState): ProductAdminInput {
  return {
    category_id: Number(form.category_id),
    sku: form.sku,
    name: form.name,
    slug: form.slug || undefined,
    description: form.description || undefined,
    price: form.price,
    stock_minimum: Number(form.stock_minimum || 0),
    weight: form.weight || undefined,
    width: form.width || undefined,
    height: form.height || undefined,
    length: form.length || undefined,
    vehicle_model: form.vehicle_model || undefined,
    meters: form.meters || undefined,
    is_active: form.is_active,
  };
}

interface ProductFormProps {
  product?: Product;
  formId: string;
  onSubmit: (data: ProductAdminInput) => Promise<void>;
  onSavingChange?: (isSaving: boolean) => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export interface ProductFormHandle {
  /** Salva a partir de fora do form (ex.: "salvar e sair" no header). Retorna se deu certo. */
  save: () => Promise<boolean>;
}

export const ProductForm = forwardRef<ProductFormHandle, ProductFormProps>(function ProductForm(
  { product, formId, onSubmit, onSavingChange, onDirtyChange },
  ref
) {
  const [categories, setCategories] = useState<Category[]>([]);
  const initialForm = product ? toForm(product) : EMPTY_FORM;
  const [form, setForm] = useState<ProductFormState>(initialForm);
  const [savedForm, setSavedForm] = useState<ProductFormState>(initialForm);

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
            <Field label="SKU" htmlFor="p-sku">
              <Input
                id="p-sku"
                required
                maxLength={100}
                value={form.sku}
                onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
              />
            </Field>
            <Field label="Slug (opcional)" htmlFor="p-slug">
              <Input
                id="p-slug"
                placeholder="gerado automaticamente"
                maxLength={255}
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              />
            </Field>
          </div>

          <Field label="Categoria" htmlFor="p-category">
            <select
              id="p-category"
              required
              value={form.category_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, category_id: Number(e.target.value) }))
              }
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
            >
              <option value="" disabled>
                Selecione uma categoria
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Preço (R$)" htmlFor="p-price">
              <Input
                id="p-price"
                required
                type="number"
                min="0.01"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
            </Field>
            <Field label="Estoque mínimo" htmlFor="p-stock-minimum">
              <Input
                id="p-stock-minimum"
                type="number"
                min="0"
                step="1"
                value={form.stock_minimum}
                onChange={(e) => setForm((f) => ({ ...f, stock_minimum: e.target.value }))}
              />
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

          <div className="grid grid-cols-4 gap-4">
            <Field label="Peso (kg)" htmlFor="p-weight">
              <Input
                id="p-weight"
                type="number"
                min="0"
                step="0.001"
                value={form.weight}
                onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
              />
            </Field>
            <Field label="Largura (cm)" htmlFor="p-width">
              <Input
                id="p-width"
                type="number"
                min="0"
                step="0.01"
                value={form.width}
                onChange={(e) => setForm((f) => ({ ...f, width: e.target.value }))}
              />
            </Field>
            <Field label="Altura (cm)" htmlFor="p-height">
              <Input
                id="p-height"
                type="number"
                min="0"
                step="0.01"
                value={form.height}
                onChange={(e) => setForm((f) => ({ ...f, height: e.target.value }))}
              />
            </Field>
            <Field label="Comprimento (cm)" htmlFor="p-length">
              <Input
                id="p-length"
                type="number"
                min="0"
                step="0.01"
                value={form.length}
                onChange={(e) => setForm((f) => ({ ...f, length: e.target.value }))}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Modelo de veículo (opcional)" htmlFor="p-vehicle">
              <Input
                id="p-vehicle"
                maxLength={100}
                value={form.vehicle_model}
                onChange={(e) => setForm((f) => ({ ...f, vehicle_model: e.target.value }))}
              />
            </Field>
            <Field label="Metros (opcional)" htmlFor="p-meters">
              <Input
                id="p-meters"
                type="number"
                min="0"
                step="0.01"
                value={form.meters}
                onChange={(e) => setForm((f) => ({ ...f, meters: e.target.value }))}
              />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              className="accent-foreground"
            />
            Produto ativo (visível na loja)
          </label>
        </form>
      </CardContent>
    </Card>
  );
});

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
