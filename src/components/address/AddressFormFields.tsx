"use client";

import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AddressCreateInput, AddressType } from "@/types/address";
import { maskZipCode } from "@/utils/mask";

interface AddressFormFieldsProps {
  form: AddressCreateInput;
  onChange: (form: AddressCreateInput) => void;
  onSubmit: (event: FormEvent) => void;
  onCancel: () => void;
  isSaving: boolean;
  submitLabel: string;
  className?: string;
}

export function AddressFormFields({
  form,
  onChange,
  onSubmit,
  onCancel,
  isSaving,
  submitLabel,
  className,
}: AddressFormFieldsProps) {
  return (
    <form
      onSubmit={onSubmit}
      className={`flex flex-col gap-4 border-t border-border pt-4 ${className ?? ""}`}
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="addr-name" className="text-sm font-medium text-foreground">
          Identificação (ex: Casa, Trabalho)
        </label>
        <Input
          id="addr-name"
          required
          maxLength={100}
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="addr-zip" className="text-sm font-medium text-foreground">
            CEP
          </label>
          <Input
            id="addr-zip"
            required
            inputMode="numeric"
            placeholder="00000-000"
            maxLength={9}
            value={form.zip_code}
            onChange={(e) => onChange({ ...form, zip_code: maskZipCode(e.target.value) })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="addr-type" className="text-sm font-medium text-foreground">
            Tipo
          </label>
          <select
            id="addr-type"
            value={form.address_type}
            onChange={(e) => onChange({ ...form, address_type: e.target.value as AddressType })}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
          >
            <option value="SHIPPING">Entrega</option>
            <option value="BILLING">Cobrança</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="addr-street" className="text-sm font-medium text-foreground">
          Rua
        </label>
        <Input
          id="addr-street"
          required
          value={form.street}
          onChange={(e) => onChange({ ...form, street: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="addr-number" className="text-sm font-medium text-foreground">
            Número
          </label>
          <Input
            id="addr-number"
            required
            value={form.number}
            onChange={(e) => onChange({ ...form, number: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="addr-complement" className="text-sm font-medium text-foreground">
            Complemento (opcional)
          </label>
          <Input
            id="addr-complement"
            value={form.complement}
            onChange={(e) => onChange({ ...form, complement: e.target.value })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="addr-district" className="text-sm font-medium text-foreground">
          Bairro
        </label>
        <Input
          id="addr-district"
          required
          value={form.district}
          onChange={(e) => onChange({ ...form, district: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 flex flex-col gap-1.5">
          <label htmlFor="addr-city" className="text-sm font-medium text-foreground">
            Cidade
          </label>
          <Input
            id="addr-city"
            required
            value={form.city}
            onChange={(e) => onChange({ ...form, city: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="addr-state" className="text-sm font-medium text-foreground">
            UF
          </label>
          <Input
            id="addr-state"
            required
            maxLength={2}
            value={form.state}
            onChange={(e) => onChange({ ...form, state: e.target.value.toUpperCase() })}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={form.is_default}
          onChange={(e) => onChange({ ...form, is_default: e.target.checked })}
          className="accent-foreground"
        />
        Definir como endereço padrão
      </label>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Salvando..." : submitLabel}
        </Button>
        <Button type="button" variant="outline" disabled={isSaving} onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
