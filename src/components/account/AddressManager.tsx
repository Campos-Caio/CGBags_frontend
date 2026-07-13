"use client";

import { useEffect, useState, type FormEvent } from "react";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  createMyAddress,
  deleteMyAddress,
  listMyAddresses,
  updateMyAddress,
} from "@/services/address.service";
import type { Address, AddressCreateInput, AddressType } from "@/types/address";
import { getApiErrorMessage } from "@/utils/apiError";
import { confirmToast } from "@/utils/confirmToast";
import { maskZipCode } from "@/utils/mask";

const ADDRESS_TYPE_LABEL: Record<AddressType, string> = {
  SHIPPING: "Entrega",
  BILLING: "Cobrança",
};

const EMPTY_FORM: AddressCreateInput = {
  name: "",
  zip_code: "",
  street: "",
  number: "",
  district: "",
  city: "",
  state: "",
  complement: "",
  address_type: "SHIPPING",
  is_default: false,
};

function toForm(address: Address): AddressCreateInput {
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

export function AddressManager() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<AddressCreateInput>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    listMyAddresses()
      .then((data) => {
        if (!cancelled) setAddresses(data);
      })
      .catch((error) => {
        if (!cancelled) {
          toast.error(getApiErrorMessage(error, "Não foi possível carregar seus endereços."));
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function startAdd() {
    setForm(EMPTY_FORM);
    setEditingId("new");
  }

  function startEdit(address: Address) {
    setForm(toForm(address));
    setEditingId(address.id);
  }

  function cancelEditing() {
    setEditingId(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);

    try {
      if (editingId === "new") {
        const created = await createMyAddress(form);
        setAddresses((prev) => [...prev, created]);
        toast.success("Endereço adicionado.");
      } else if (typeof editingId === "number") {
        const updated = await updateMyAddress(editingId, form);
        setAddresses((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        toast.success("Endereço atualizado.");
      }
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
      await deleteMyAddress(address.id);
      setAddresses((prev) => prev.filter((a) => a.id !== address.id));
      toast.success("Endereço excluído.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível excluir este endereço."));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Endereços</CardTitle>
        {editingId === null && (
          <Button variant="outline" size="sm" onClick={startAdd}>
            <Plus className="size-3.5" aria-hidden />
            Adicionar
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isLoading ? (
          <p className="py-2 text-sm text-muted-foreground">Carregando...</p>
        ) : (
          <>
            {addresses.length === 0 && editingId === null && (
              <p className="py-2 text-sm text-muted-foreground">
                Você ainda não tem endereços cadastrados.
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
                        <span className="text-sm font-medium text-foreground">
                          {address.name}
                        </span>
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
                        {address.complement ? `, ${address.complement}` : ""} —{" "}
                        {address.district}, {address.city}/{address.state}
                      </p>
                      <p className="text-sm text-muted-foreground">CEP {address.zip_code}</p>
                    </div>

                    {editingId === null && (
                      <div className="flex shrink-0 gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label="Editar endereço"
                          onClick={() => startEdit(address)}
                        >
                          <Pencil className="size-3.5" aria-hidden />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label="Excluir endereço"
                          disabled={deletingId === address.id}
                          onClick={() => handleDelete(address)}
                        >
                          <Trash2 className="size-3.5" aria-hidden />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {editingId !== null && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 border-t border-border pt-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="addr-name" className="text-sm font-medium text-foreground">
                    Identificação (ex: Casa, Trabalho)
                  </label>
                  <Input
                    id="addr-name"
                    required
                    maxLength={100}
                    value={form.name}
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
                      value={form.zip_code}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, zip_code: maskZipCode(e.target.value) }))
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="addr-type" className="text-sm font-medium text-foreground">
                      Tipo
                    </label>
                    <select
                      id="addr-type"
                      value={form.address_type}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, address_type: e.target.value as AddressType }))
                      }
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
                      value={form.number}
                      onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="addr-complement" className="text-sm font-medium text-foreground">
                      Complemento (opcional)
                    </label>
                    <Input
                      id="addr-complement"
                      value={form.complement}
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
                    value={form.district}
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
                      value={form.city}
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
                      value={form.state}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, state: e.target.value.toUpperCase() }))
                      }
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={form.is_default}
                    onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))}
                    className="accent-foreground"
                  />
                  Definir como endereço padrão
                </label>

                <div className="flex gap-3">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Salvando..." : "Salvar endereço"}
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
