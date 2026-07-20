"use client";

import { useParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { DetailHeader } from "@/components/admin/layout/DetailHeader";
import { CustomerAddressesCard } from "@/components/admin/customers/CustomerAddressesCard";
import { ErrorState } from "@/components/admin/feedback/ErrorState";
import { LoadingState } from "@/components/admin/feedback/LoadingState";
import { StatusToggle } from "@/components/admin/feedback/StatusToggle";
import { UserRoleToggle } from "@/components/admin/users/UserRoleToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DefinitionRow } from "@/components/ui/definition-row";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useAdminResource } from "@/hooks/useAdminResource";
import { getCustomerByIdAdmin, updateCustomerAdmin } from "@/services/customer.service";
import type { Address } from "@/types/address";
import type { PersonType } from "@/types/customer";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatDate } from "@/utils/date";

const PERSON_TYPE_LABEL: Record<PersonType, string> = {
  PF: "Pessoa física",
  PJ: "Pessoa jurídica",
};

const FORM_ID = "customer-edit-form";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const customerId = Number(params.id);

  const { data: customer, setData: setCustomer, status } = useAdminResource({
    fetch: () => getCustomerByIdAdmin(customerId),
    deps: [customerId],
    errorMessage: "Não foi possível carregar este cliente.",
  });

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Resincroniza o formulario sempre que um cliente (novo ou diferente) carrega.
  const [syncedCustomerId, setSyncedCustomerId] = useState<number | null>(null);
  if (customer && customer.id !== syncedCustomerId) {
    setSyncedCustomerId(customer.id);
    setFullName(customer.full_name);
    setPhone(customer.phone);
    setBirthDate(customer.birth_date?.slice(0, 10) ?? "");
    setIsActive(customer.is_active);
  }

  async function saveCustomer(): Promise<boolean> {
    setIsSaving(true);

    try {
      const updated = await updateCustomerAdmin(customerId, {
        full_name: fullName,
        phone,
        is_active: isActive,
        ...(birthDate ? { birth_date: birthDate } : {}),
      });
      setCustomer((prev) => (prev ? { ...prev, ...updated } : prev));
      toast.success("Cliente atualizado.");
      return true;
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível atualizar este cliente."));
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await saveCustomer();
  }

  function handleAddressesChange(addresses: Address[]) {
    setCustomer((prev) => (prev ? { ...prev, addresses } : prev));
  }

  if (status === "loading") {
    return <LoadingState />;
  }

  if (status === "error" || !customer) {
    return <ErrorState message="Não foi possível carregar este cliente." />;
  }

  const isDirty =
    fullName !== customer.full_name ||
    phone !== customer.phone ||
    birthDate !== (customer.birth_date?.slice(0, 10) ?? "") ||
    isActive !== customer.is_active;

  return (
    <div className="flex flex-col">
      <DetailHeader
        backHref="/admin/customers"
        backLabel="Voltar para clientes"
        title={customer.full_name}
        subtitle={`${PERSON_TYPE_LABEL[customer.person_type]} · ${customer.cpf_cnpj}`}
        isDirty={isDirty}
        onSaveAndLeave={saveCustomer}
        meta={
          <StatusToggle
            active={isActive}
            onToggle={() => setIsActive((v) => !v)}
            title="Registro informativo — hoje nenhum outro fluxo (checkout, login) verifica esse status"
          />
        }
        actions={
          <Button type="submit" form={FORM_ID} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar alterações"}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Dados do cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="c-name" className="text-sm font-medium text-foreground">
                    Nome completo
                  </label>
                  <Input
                    id="c-name"
                    required
                    minLength={3}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <DefinitionRow
                  size="lg"
                  label="Tipo de cadastro"
                  value={PERSON_TYPE_LABEL[customer.person_type]}
                  locked
                />
                <DefinitionRow
                  size="lg"
                  label={customer.person_type === "PF" ? "CPF" : "CNPJ"}
                  value={customer.cpf_cnpj}
                  locked
                />

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="c-phone" className="text-sm font-medium text-foreground">
                    Telefone
                  </label>
                  <Input
                    id="c-phone"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="c-birth" className="text-sm font-medium text-foreground">
                    Data de nascimento
                  </label>
                  <Input
                    id="c-birth"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  Cadastrado em {formatDate(customer.created_at)}
                </p>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:col-span-1 lg:self-start">
          {customer.user && (
            <Card>
              <CardHeader>
                <CardTitle>Conta de acesso</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <DefinitionRow size="lg" label="E-mail" value={customer.user.email} />
                <UserRoleToggle
                  user={customer.user}
                  onChange={(user) => setCustomer((prev) => (prev ? { ...prev, user } : prev))}
                  disabled={currentUser?.id === customer.user.id}
                />
              </CardContent>
            </Card>
          )}

          <CustomerAddressesCard
            customerId={customer.id}
            addresses={customer.addresses ?? []}
            onChange={handleAddressesChange}
          />
        </div>
      </div>
    </div>
  );
}
