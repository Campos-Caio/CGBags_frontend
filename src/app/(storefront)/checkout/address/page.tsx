"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus } from "lucide-react";
import { toast } from "sonner";

import { AddressFormFields } from "@/components/address/AddressFormFields";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { useCheckout } from "@/context/CheckoutContext";
import { createMyAddress, listMyAddresses } from "@/services/address.service";
import type { Address, AddressCreateInput } from "@/types/address";
import { getApiErrorMessage } from "@/utils/apiError";

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

export default function CheckoutAddressPage() {
  const router = useRouter();
  const { cart, isLoading: cartLoading } = useCart();
  const { selectedAddress, setSelectedAddress } = useCheckout();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<AddressCreateInput>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [pickedId, setPickedId] = useState<number | null>(selectedAddress?.id ?? null);

  useEffect(() => {
    if (!cartLoading && cart && cart.items.length === 0) {
      router.replace("/cart");
    }
  }, [cart, cartLoading, router]);

  useEffect(() => {
    listMyAddresses()
      .then((data) => {
        setAddresses(data);
        if (data.length === 0) {
          setIsAdding(true);
        } else {
          setPickedId((current) => {
            if (current && data.some((a) => a.id === current)) return current;
            return (data.find((a) => a.is_default) ?? data[0]).id;
          });
        }
      })
      .catch((error) => {
        toast.error(getApiErrorMessage(error, "Não foi possível carregar seus endereços."));
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function handleCreateAddress(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    try {
      const created = await createMyAddress(form);
      setAddresses((prev) => [...prev, created]);
      setPickedId(created.id);
      setIsAdding(false);
      toast.success("Endereço adicionado.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível salvar este endereço."));
    } finally {
      setIsSaving(false);
    }
  }

  function handleStartAdd() {
    setForm(EMPTY_FORM);
    setIsAdding(true);
  }

  function handleContinue() {
    const address = addresses.find((a) => a.id === pickedId);
    if (!address) return;
    setSelectedAddress(address);
    router.push("/checkout/shipping");
  }

  if (isLoading || cartLoading) {
    return <p className="py-16 text-center text-muted-foreground">Carregando...</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
        Confirme seu endereço
      </h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Endereço de entrega</CardTitle>
          {!isAdding && (
            <Button variant="outline" size="sm" onClick={handleStartAdd}>
              <Plus className="size-3.5" aria-hidden />
              Novo endereço
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {isAdding ? (
            <AddressFormFields
              form={form}
              onChange={setForm}
              onSubmit={handleCreateAddress}
              onCancel={() => setIsAdding(false)}
              isSaving={isSaving}
              submitLabel="Adicionar endereço"
              className="border-t-0 pt-0"
            />
          ) : addresses.length === 0 ? (
            <p className="py-2 text-sm text-muted-foreground">
              Você ainda não tem endereços cadastrados.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {addresses.map((address) => (
                <label
                  key={address.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-colors ${
                    pickedId === address.id
                      ? "border-ring bg-muted/30"
                      : "border-border hover:bg-muted/20"
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    value={address.id}
                    checked={pickedId === address.id}
                    onChange={() => setPickedId(address.id)}
                    className="mt-0.5 accent-foreground"
                  />
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                      <span className="text-sm font-medium text-foreground">{address.name}</span>
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
                </label>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {!isAdding && (
        <Button size="lg" disabled={!pickedId} onClick={handleContinue}>
          Continuar para frete
        </Button>
      )}
    </div>
  );
}
