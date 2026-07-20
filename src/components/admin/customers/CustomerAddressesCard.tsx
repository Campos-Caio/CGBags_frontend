"use client";

import { useState, type FormEvent } from "react";
import { MapPin, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FormSection } from "@/components/admin/form/FormSection";
import {
  deleteCustomerAddressAdmin,
  updateCustomerAddressAdmin,
} from "@/services/address.service";
import type { Address, AddressType, AddressUpdateInput } from "@/types/address";
import { getApiErrorMessage } from "@/utils/apiError";
import { confirmToast } from "@/utils/confirmToast";
import { maskZipCode } from "@/utils/mask";

const ADDRESS_TYPE_LABEL: Record<AddressType, string> = {
  SHIPPING: "Entrega",
  BILLING: "Cobrança",
};

function toForm(address: Address): AddressUpdateInput {
  return {
    name: address.name,
    zip_code: maskZipCode(address.zip_code),
    street: address.street,
    number: address.number,
    district: address.district,
    city: address.city,
    state: address.state,
    complement: address.complement ?? "",
    address_type: address.address_type,
    is_default: address.is_default,
  };
}

interface CustomerAddressesCardProps {
  customerId: number;
  addresses: Address[];
  onChange: (addresses: Address[]) => void;
}

export function CustomerAddressesCard({
  customerId,
  addresses,
  onChange,
}: CustomerAddressesCardProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<AddressUpdateInput>({});
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function startEdit(address: Address) {
    setForm(toForm(address));
    setEditingId(address.id);
  }

  function cancelEditing() {
    setEditingId(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (editingId === null) return;
    setIsSaving(true);

    try {
      const updated = await updateCustomerAddressAdmin(customerId, editingId, form);
      onChange(addresses.map((a) => (a.id === updated.id ? updated : a)));
      toast.success("Endereço atualizado.");
      setEditingId(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível salvar este endereço."));
    } finally {
      setIsSaving(false);
    }
  }

  function handleDelete(address: Address) {
    confirmToast(`Excluir o endereço "${address.name}"?`, () => performDelete(address), {
      confirmLabel: "Excluir",
    });
  }

  async function performDelete(address: Address) {
    setDeletingId(address.id);
    try {
      await deleteCustomerAddressAdmin(customerId, address.id);
      onChange(addresses.filter((a) => a.id !== address.id));
      toast.success("Endereço excluído.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível excluir este endereço."));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Endereços</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {addresses.length === 0 && editingId === null && (
          <p className="py-2 text-sm text-muted-foreground">
            Este cliente ainda não tem endereços cadastrados.
          </p>
        )}

        {addresses.length > 0 && (
          <div className="flex flex-col gap-3">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-border p-3.5"
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                    <span className="text-sm font-medium text-foreground">{address.name}</span>
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                      {ADDRESS_TYPE_LABEL[address.address_type]}
                    </span>
                    {address.is_default && (
                      <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                        Padrão
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {address.street}, {address.number}
                    {address.complement ? `, ${address.complement}` : ""} — {address.district},{" "}
                    {address.city}/{address.state}
                  </p>
                  <p className="text-sm text-muted-foreground">CEP {address.zip_code}</p>
                </div>

                {editingId === null && (
                  <div className="flex shrink-0 gap-1.5">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label="Editar endereço"
                          onClick={() => startEdit(address)}
                        >
                          <Pencil className="size-3.5" aria-hidden />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Editar endereço</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label="Excluir endereço"
                          disabled={deletingId === address.id}
                          onClick={() => handleDelete(address)}
                        >
                          <Trash2 className="size-3.5" aria-hidden />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Excluir endereço</TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {editingId !== null && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 border-t border-border pt-4">
            <FormSection title="Identificação e tipo">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="addr-name" className="text-sm font-medium text-foreground">
                  Identificação
                </label>
                <Input
                  id="addr-name"
                  required
                  maxLength={100}
                  value={form.name ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
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
                    value={form.zip_code ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, zip_code: maskZipCode(e.target.value) }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="addr-type" className="text-sm font-medium text-foreground">
                    Tipo
                  </label>
                  <Select
                    value={form.address_type ?? "SHIPPING"}
                    onValueChange={(value) =>
                      setForm((f) => ({ ...f, address_type: value as AddressType }))
                    }
                  >
                    <SelectTrigger id="addr-type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SHIPPING">Entrega</SelectItem>
                      <SelectItem value="BILLING">Cobrança</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </FormSection>

            <FormSection title="Endereço">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="addr-street" className="text-sm font-medium text-foreground">
                  Rua
                </label>
                <Input
                  id="addr-street"
                  required
                  value={form.street ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
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
                    value={form.number ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="addr-complement" className="text-sm font-medium text-foreground">
                    Complemento (opcional)
                  </label>
                  <Input
                    id="addr-complement"
                    value={form.complement ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, complement: e.target.value }))}
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
                  value={form.district ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
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
                    value={form.city ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
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
                    value={form.state ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, state: e.target.value.toUpperCase() }))
                    }
                  />
                </div>
              </div>
            </FormSection>

            <FormSection title="Preferências">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <Checkbox
                  checked={form.is_default ?? false}
                  onCheckedChange={(checked) => setForm((f) => ({ ...f, is_default: checked === true }))}
                />
                Definir como endereço padrão
              </label>
            </FormSection>

            <div className="flex gap-3">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Salvando..." : "Salvar endereço"}
              </Button>
              <Button type="button" variant="outline" disabled={isSaving} onClick={cancelEditing}>
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
