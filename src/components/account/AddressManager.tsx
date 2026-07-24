"use client";

import { useEffect, useState, type FormEvent } from "react";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AddressFormFields } from "@/components/address/AddressFormFields";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
              <AddressFormFields
                form={form}
                onChange={setForm}
                onSubmit={handleSubmit}
                onCancel={cancelEditing}
                isSaving={isSaving}
                submitLabel="Salvar endereço"
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
