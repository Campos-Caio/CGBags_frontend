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
import { FormSection } from "@/components/admin/form/FormSection";
import type {
  Coupon,
  CouponCreateInput,
  CouponUpdateInput,
  DiscountType,
} from "@/types/coupon";
import { getApiErrorMessage } from "@/utils/apiError";

interface FormState {
  code: string;
  discount_type: DiscountType;
  value: string;
  min_order_value: string;
  starts_at: string;
  ends_at: string;
  max_uses: string;
  max_uses_per_customer: string;
  is_active: boolean;
}

const EMPTY_FORM: FormState = {
  code: "",
  discount_type: "PERCENTAGE",
  value: "",
  min_order_value: "0",
  starts_at: "",
  ends_at: "",
  max_uses: "",
  max_uses_per_customer: "",
  is_active: true,
};

/** "YYYY-MM-DDTHH:mm" (hora local do navegador) <- ISO com timezone. */
function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** ISO com timezone <- "YYYY-MM-DDTHH:mm" — sem isso o backend recebe um
 * datetime "naive" e quebra ao comparar com `datetime.now(UTC)`. */
function fromDatetimeLocalValue(value: string): string | null {
  if (!value) return null;
  return new Date(value).toISOString();
}

function toForm(coupon: Coupon): FormState {
  return {
    code: coupon.code ?? "",
    discount_type: coupon.discount_type,
    value: coupon.value,
    min_order_value: coupon.min_order_value,
    starts_at: toDatetimeLocalValue(coupon.starts_at),
    ends_at: toDatetimeLocalValue(coupon.ends_at),
    max_uses: coupon.max_uses !== null ? String(coupon.max_uses) : "",
    max_uses_per_customer: coupon.max_uses_per_customer !== null ? String(coupon.max_uses_per_customer) : "",
    is_active: coupon.is_active,
  };
}

function toCreateInput(form: FormState): CouponCreateInput {
  return {
    code: form.code,
    discount_type: form.discount_type,
    value: form.value,
    min_order_value: form.min_order_value || undefined,
    starts_at: fromDatetimeLocalValue(form.starts_at),
    ends_at: fromDatetimeLocalValue(form.ends_at),
    max_uses: form.max_uses === "" ? null : Number(form.max_uses),
    max_uses_per_customer: form.max_uses_per_customer === "" ? null : Number(form.max_uses_per_customer),
    is_active: form.is_active,
  };
}

function toUpdateInput(form: FormState): CouponUpdateInput {
  return {
    code: form.code,
    discount_type: form.discount_type,
    value: form.value,
    min_order_value: form.min_order_value || undefined,
    starts_at: fromDatetimeLocalValue(form.starts_at),
    ends_at: fromDatetimeLocalValue(form.ends_at),
    max_uses: form.max_uses === "" ? null : Number(form.max_uses),
    max_uses_per_customer: form.max_uses_per_customer === "" ? null : Number(form.max_uses_per_customer),
  };
}

interface CouponFormProps {
  /** Ausente = modo criacao. Presente = modo edicao (mesmos campos, todos editaveis). */
  coupon?: Coupon;
  formId: string;
  onSubmit: (data: CouponCreateInput | CouponUpdateInput) => Promise<void>;
  onSavingChange?: (isSaving: boolean) => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export interface CouponFormHandle {
  save: () => Promise<boolean>;
}

export const CouponForm = forwardRef<CouponFormHandle, CouponFormProps>(function CouponForm(
  { coupon, formId, onSubmit, onSavingChange, onDirtyChange },
  ref
) {
  const isEdit = coupon !== undefined;
  const initialForm = coupon ? toForm(coupon) : EMPTY_FORM;
  const [form, setForm] = useState<FormState>(initialForm);
  const [savedForm, setSavedForm] = useState<FormState>(initialForm);

  useEffect(() => {
    onDirtyChange?.(JSON.stringify(form) !== JSON.stringify(savedForm));
  }, [form, savedForm, onDirtyChange]);

  async function doSubmit(): Promise<boolean> {
    if (form.code.trim().length < 3) {
      toast.error("Informe um código com pelo menos 3 caracteres.");
      return false;
    }

    onSavingChange?.(true);
    try {
      await onSubmit(isEdit ? toUpdateInput(form) : toCreateInput(form));
      setSavedForm(form);
      return true;
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível salvar este cupom."));
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

  const valueLabel = form.discount_type === "PERCENTAGE" ? "Percentual (%)" : "Valor (R$)";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados do cupom</CardTitle>
      </CardHeader>
      <CardContent>
        <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormSection title="Desconto" description="O que o cliente vê e o quanto ele economiza.">
            <div className="grid grid-cols-3 gap-4">
              <Field label="Código" htmlFor="c-code">
                <Input
                  id="c-code"
                  required
                  minLength={3}
                  maxLength={50}
                  placeholder="Ex.: BEMVINDO10"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                />
              </Field>
              <Field label="Tipo de desconto" htmlFor="c-type">
                <Select
                  value={form.discount_type}
                  onValueChange={(value) =>
                    setForm((f) => ({ ...f, discount_type: value as DiscountType }))
                  }
                >
                  <SelectTrigger id="c-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentual</SelectItem>
                    <SelectItem value="FIXED">Valor fixo</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label={valueLabel} htmlFor="c-value">
                <Input
                  id="c-value"
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.value}
                  onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                />
              </Field>
            </div>

            {!isEdit && (
              <label className="flex items-center gap-2 text-sm text-foreground">
                <Checkbox
                  checked={form.is_active}
                  onCheckedChange={(checked) => setForm((f) => ({ ...f, is_active: checked === true }))}
                />
                Cupom ativo
              </label>
            )}
          </FormSection>

          <FormSection title="Regras de uso" description="Quem pode usar e quantas vezes.">
            <div className="grid grid-cols-3 gap-4">
              <Field label="Valor mínimo do pedido (R$)" htmlFor="c-min-order">
                <Input
                  id="c-min-order"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.min_order_value}
                  onChange={(e) => setForm((f) => ({ ...f, min_order_value: e.target.value }))}
                />
              </Field>
              <Field label="Limite de usos total (opcional)" htmlFor="c-max-uses">
                <Input
                  id="c-max-uses"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Sem limite"
                  value={form.max_uses}
                  onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))}
                />
              </Field>
              <Field label="Limite por cliente (opcional)" htmlFor="c-max-uses-customer">
                <Input
                  id="c-max-uses-customer"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Sem limite"
                  value={form.max_uses_per_customer}
                  onChange={(e) => setForm((f) => ({ ...f, max_uses_per_customer: e.target.value }))}
                />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Validade" description="Deixe em branco para um cupom sem prazo definido.">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Início da validade (opcional)" htmlFor="c-starts">
                <Input
                  id="c-starts"
                  type="datetime-local"
                  value={form.starts_at}
                  onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))}
                />
              </Field>
              <Field label="Fim da validade (opcional)" htmlFor="c-ends">
                <Input
                  id="c-ends"
                  type="datetime-local"
                  value={form.ends_at}
                  onChange={(e) => setForm((f) => ({ ...f, ends_at: e.target.value }))}
                />
              </Field>
            </div>
          </FormSection>
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
