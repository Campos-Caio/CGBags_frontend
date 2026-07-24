"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Boxes, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FormSection } from "@/components/admin/form/FormSection";
import { StockActionsPanel } from "@/components/admin/stock/StockActionsPanel";
import {
  createProductVariant,
  deleteProductVariant,
  updateProductVariant,
} from "@/services/product.service";
import type { ProductVariant, ProductVariantInput } from "@/types/product";
import { getApiErrorMessage } from "@/utils/apiError";
import { confirmToast } from "@/utils/confirmToast";
import { formatCurrency } from "@/utils/currency";

const EMPTY_VARIANT_FORM = {
  label: "",
  sku: "",
  price: "",
  stock_minimum: "0",
  weight: "",
  width: "",
  height: "",
  length: "",
  meters: "",
  is_custom: false,
};

type VariantFormState = typeof EMPTY_VARIANT_FORM;

function formToInput(form: VariantFormState): ProductVariantInput {
  return {
    label: form.label || null,
    sku: form.sku,
    price: form.is_custom ? null : form.price,
    stock_minimum: Number(form.stock_minimum || 0),
    weight: form.is_custom ? null : form.weight || null,
    width: form.is_custom ? null : form.width || null,
    height: form.is_custom ? null : form.height || null,
    length: form.is_custom ? null : form.length || null,
    meters: form.meters || null,
    is_custom: form.is_custom,
    is_active: true,
  };
}

function variantToForm(variant: ProductVariant): VariantFormState {
  return {
    label: variant.label ?? "",
    sku: variant.sku,
    price: variant.price ?? "",
    stock_minimum: String(variant.stock_minimum),
    weight: variant.weight ?? "",
    width: variant.width ?? "",
    height: variant.height ?? "",
    length: variant.length ?? "",
    meters: variant.meters ?? "",
    is_custom: variant.is_custom,
  };
}

interface ProductVariantManagerProps {
  productId: number;
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
  /** Sem o Card/titulo em volta — usado na linha expandida da lista de produtos, que ja tem sua propria moldura. */
  bare?: boolean;
}

export function ProductVariantManager({
  productId,
  variants,
  onChange,
  bare = false,
}: ProductVariantManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState<VariantFormState>(EMPTY_VARIANT_FORM);
  const [isSavingNew, setIsSavingNew] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<VariantFormState>(EMPTY_VARIANT_FORM);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [managingStockId, setManagingStockId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    setIsSavingNew(true);
    try {
      const created = await createProductVariant(productId, formToInput(addForm));
      onChange([...variants, created]);
      setAddForm(EMPTY_VARIANT_FORM);
      setIsAdding(false);
      toast.success("Variante adicionada.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível adicionar a variante."));
    } finally {
      setIsSavingNew(false);
    }
  }

  function startEdit(variant: ProductVariant) {
    setEditingId(variant.id);
    setEditForm(variantToForm(variant));
  }

  async function handleEditSubmit(event: FormEvent, variantId: number) {
    event.preventDefault();
    setIsSavingEdit(true);
    try {
      const updated = await updateProductVariant(productId, variantId, formToInput(editForm));
      onChange(variants.map((v) => (v.id === variantId ? updated : v)));
      setEditingId(null);
      toast.success("Variante atualizada.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível atualizar a variante."));
    } finally {
      setIsSavingEdit(false);
    }
  }

  function handleDelete(variant: ProductVariant) {
    confirmToast(
      `Excluir a variante "${variant.label ?? variant.sku}"?`,
      () => performDelete(variant),
      { confirmLabel: "Excluir" }
    );
  }

  async function performDelete(variant: ProductVariant) {
    setDeletingId(variant.id);
    try {
      await deleteProductVariant(productId, variant.id);
      onChange(variants.filter((v) => v.id !== variant.id));
      toast.success("Variante excluída.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível excluir esta variante."));
    } finally {
      setDeletingId(null);
    }
  }

  function handleStockChange(variantId: number, newQuantity: number) {
    onChange(
      variants.map((v) => (v.id === variantId ? { ...v, stock_quantity: newQuantity } : v))
    );
  }

  const content = (
    <div className="flex flex-col gap-3">
        {variants.map((variant) => (
          <div key={variant.id} className="rounded-lg border border-border p-3">
            {editingId === variant.id ? (
              <VariantFormFields
                form={editForm}
                onChange={setEditForm}
                onSubmit={(e) => handleEditSubmit(e, variant.id)}
                onCancel={() => setEditingId(null)}
                isSaving={isSavingEdit}
                submitLabel="Salvar"
              />
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">
                    {variant.label ?? "Padrão"}
                    {variant.is_custom && (
                      <Badge variant="accent" size="sm" className="ml-1.5">
                        Personalizado
                      </Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    SKU {variant.sku}
                    {!variant.is_custom && (
                      <>
                        {" "}
                        · {formatCurrency(variant.price ?? "0")} · estoque {variant.stock_quantity}
                      </>
                    )}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {!variant.is_custom && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label="Gerenciar estoque"
                          onClick={() =>
                            setManagingStockId(managingStockId === variant.id ? null : variant.id)
                          }
                        >
                          <Boxes className="size-3.5" aria-hidden />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Gerenciar estoque</TooltipContent>
                    </Tooltip>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        aria-label="Editar variante"
                        onClick={() => startEdit(variant)}
                      >
                        <Pencil className="size-3.5" aria-hidden />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Editar variante</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        aria-label="Excluir variante"
                        disabled={deletingId === variant.id}
                        onClick={() => handleDelete(variant)}
                      >
                        <Trash2 className="size-3.5" aria-hidden />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Excluir variante</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            )}

            {managingStockId === variant.id && (
              <div className="mt-3">
                <StockActionsPanel
                  mode="single"
                  variantId={variant.id}
                  stockQuantity={variant.stock_quantity}
                  onStockChange={(qty) => handleStockChange(variant.id, qty)}
                  bare
                />
              </div>
            )}
          </div>
        ))}

        {isAdding ? (
          <div className="rounded-lg border border-dashed border-border p-3">
            <VariantFormFields
              form={addForm}
              onChange={setAddForm}
              onSubmit={handleAdd}
              onCancel={() => {
                setIsAdding(false);
                setAddForm(EMPTY_VARIANT_FORM);
              }}
              isSaving={isSavingNew}
              submitLabel="Adicionar"
            />
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="w-fit gap-1.5"
          >
            <Plus className="size-3.5" aria-hidden />
            Adicionar variante
          </Button>
        )}
    </div>
  );

  if (bare) return content;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Variantes (tamanhos/opções)</CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}

interface VariantFormFieldsProps {
  form: VariantFormState;
  onChange: (form: VariantFormState) => void;
  onSubmit: (event: FormEvent) => void;
  onCancel: () => void;
  isSaving: boolean;
  submitLabel: string;
}

function VariantFormFields({
  form,
  onChange,
  onSubmit,
  onCancel,
  isSaving,
  submitLabel,
}: VariantFormFieldsProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <FormSection title="Identificação" description="Como esta variante aparece e é reconhecida no estoque.">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <Checkbox
            checked={form.is_custom}
            onCheckedChange={(checked) => onChange({ ...form, is_custom: checked === true })}
          />
          Personalizado (sob orçamento — sem preço/estoque fixo)
        </label>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Rótulo (ex.: 10m)">
            <Input
              maxLength={100}
              placeholder="Deixe em branco se for a única opção"
              value={form.label}
              onChange={(e) => onChange({ ...form, label: e.target.value })}
            />
          </Field>
          <Field label="SKU">
            <Input
              required
              maxLength={100}
              value={form.sku}
              onChange={(e) => onChange({ ...form, sku: e.target.value })}
            />
          </Field>
        </div>
      </FormSection>

      {!form.is_custom && (
        <FormSection title="Preço e estoque">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Preço (R$)">
              <Input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={form.price}
                onChange={(e) => onChange({ ...form, price: e.target.value })}
              />
            </Field>
            <Field label="Estoque mínimo">
              <Input
                type="number"
                min="0"
                step="1"
                value={form.stock_minimum}
                onChange={(e) => onChange({ ...form, stock_minimum: e.target.value })}
              />
            </Field>
          </div>
        </FormSection>
      )}

      <FormSection
        title="Dimensões para frete"
        description={
          form.is_custom
            ? "Apenas os metros — o restante do frete é combinado no orçamento."
            : "Usadas para calcular o frete no checkout."
        }
      >
        {!form.is_custom && (
          <div className="grid grid-cols-4 gap-3">
            <Field label="Peso (kg)">
              <Input
                required
                type="number"
                min="0"
                step="0.001"
                value={form.weight}
                onChange={(e) => onChange({ ...form, weight: e.target.value })}
              />
            </Field>
            <Field label="Largura (cm)">
              <Input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.width}
                onChange={(e) => onChange({ ...form, width: e.target.value })}
              />
            </Field>
            <Field label="Altura (cm)">
              <Input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.height}
                onChange={(e) => onChange({ ...form, height: e.target.value })}
              />
            </Field>
            <Field label="Comprimento (cm)">
              <Input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.length}
                onChange={(e) => onChange({ ...form, length: e.target.value })}
              />
            </Field>
          </div>
        )}

        <Field label="Metros (opcional)">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={form.meters}
            onChange={(e) => onChange({ ...form, meters: e.target.value })}
          />
        </Field>
      </FormSection>

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isSaving}>
          {isSaving ? "Salvando..." : submitLabel}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
    </div>
  );
}
