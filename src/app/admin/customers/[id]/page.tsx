"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { DetailHeader } from "@/components/admin/layout/DetailHeader";
import { CustomerAddressesCard } from "@/components/admin/customers/CustomerAddressesCard";
import { CustomerOrdersCard } from "@/components/admin/customers/CustomerOrdersCard";
import { ErrorState } from "@/components/admin/feedback/ErrorState";
import { LoadingState } from "@/components/admin/feedback/LoadingState";
import { StatusToggle } from "@/components/admin/feedback/StatusToggle";
import { UserRoleToggle } from "@/components/admin/users/UserRoleToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DefinitionRow } from "@/components/ui/definition-row";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useAdminResource } from "@/hooks/useAdminResource";
import {
  correctCustomerDocumentAdmin,
  getCustomerByIdAdmin,
  updateCustomerAdmin,
  updateCustomerNoteAdmin,
} from "@/services/customer.service";
import type { Address } from "@/types/address";
import type { PersonType } from "@/types/customer";
import { getApiErrorMessage } from "@/utils/apiError";
import { confirmToast } from "@/utils/confirmToast";
import { formatDate } from "@/utils/date";
import { maskCpfCnpj } from "@/utils/mask";

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
  const [note, setNote] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isCorrectingDocument, setIsCorrectingDocument] = useState(false);
  const [correctionPersonType, setCorrectionPersonType] = useState<PersonType>("PF");
  const [correctionCpfCnpj, setCorrectionCpfCnpj] = useState("");
  const [isSavingDocument, setIsSavingDocument] = useState(false);

  // Resincroniza o formulario sempre que um cliente (novo ou diferente) carrega.
  const [syncedCustomerId, setSyncedCustomerId] = useState<number | null>(null);
  if (customer && customer.id !== syncedCustomerId) {
    setSyncedCustomerId(customer.id);
    setFullName(customer.full_name);
    setPhone(customer.phone);
    setBirthDate(customer.birth_date?.slice(0, 10) ?? "");
    setIsActive(customer.is_active);
    setNote(customer.internal_note ?? "");
    setIsCorrectingDocument(false);
    setCorrectionPersonType(customer.person_type);
    setCorrectionCpfCnpj(maskCpfCnpj(customer.cpf_cnpj, customer.person_type));
  }

  // Trocar o tipo de pessoa reaplica a mascara com o novo limite/formato —
  // mesmo raciocinio do formulario de completar cadastro (complete-profile).
  useEffect(() => {
    setCorrectionCpfCnpj((prev) => maskCpfCnpj(prev, correctionPersonType));
  }, [correctionPersonType]);

  function handleCorrectDocument() {
    confirmToast(
      "Corrigir o CPF/CNPJ e tipo de pessoa deste cliente? Use só pra corrigir um erro de digitação já cadastrado.",
      performCorrectDocument,
      { confirmLabel: "Corrigir" }
    );
  }

  async function performCorrectDocument() {
    if (!customer) return;
    setIsSavingDocument(true);
    try {
      const updated = await correctCustomerDocumentAdmin(customer.id, {
        person_type: correctionPersonType,
        cpf_cnpj: correctionCpfCnpj,
      });
      setCustomer((prev) => (prev ? { ...prev, ...updated } : prev));
      setIsCorrectingDocument(false);
      toast.success("Documento corrigido.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível corrigir o documento."));
    } finally {
      setIsSavingDocument(false);
    }
  }

  async function handleSaveNote() {
    if (!customer) return;
    setIsSavingNote(true);
    try {
      const updated = await updateCustomerNoteAdmin(customer.id, note.trim() || null);
      setCustomer((prev) => (prev ? { ...prev, internal_note: updated.internal_note } : prev));
      toast.success("Nota salva.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível salvar a nota."));
    } finally {
      setIsSavingNote(false);
    }
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
            title="Cliente inativo não consegue finalizar compras (checkout bloqueado)"
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

                {isCorrectingDocument ? (
                  <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
                    <p className="text-xs text-muted-foreground">
                      Corrige um erro de digitação já cadastrado — não é edição normal.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="c-doc-type" className="text-sm font-medium text-foreground">
                          Tipo de pessoa
                        </label>
                        <Select
                          value={correctionPersonType}
                          onValueChange={(value) => setCorrectionPersonType(value as PersonType)}
                        >
                          <SelectTrigger id="c-doc-type" className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PF">Pessoa física</SelectItem>
                            <SelectItem value="PJ">Pessoa jurídica</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="c-doc-value" className="text-sm font-medium text-foreground">
                          {correctionPersonType === "PF" ? "CPF" : "CNPJ"}
                        </label>
                        <Input
                          id="c-doc-value"
                          required
                          inputMode="numeric"
                          maxLength={correctionPersonType === "PF" ? 14 : 18}
                          value={correctionCpfCnpj}
                          onChange={(e) =>
                            setCorrectionCpfCnpj(maskCpfCnpj(e.target.value, correctionPersonType))
                          }
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 self-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isSavingDocument}
                        onClick={() => setIsCorrectingDocument(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={isSavingDocument}
                        onClick={handleCorrectDocument}
                      >
                        {isSavingDocument ? "Salvando..." : "Salvar correção"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="self-start"
                    onClick={() => setIsCorrectingDocument(true)}
                  >
                    Corrigir CPF/CNPJ ou tipo de pessoa
                  </Button>
                )}

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

          <Card>
            <CardHeader>
              <CardTitle>Anotações internas</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-xs text-muted-foreground">
                Visível só para a equipe — nunca aparece pro cliente.
              </p>
              <textarea
                id="customer-internal-note"
                rows={3}
                placeholder="Ex.: prefere retirada combinada por telefone"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
              />
              <Button
                type="button"
                size="sm"
                className="self-end"
                disabled={isSavingNote || note === (customer.internal_note ?? "")}
                onClick={handleSaveNote}
              >
                {isSavingNote ? "Salvando..." : "Salvar nota"}
              </Button>
            </CardContent>
          </Card>

          <CustomerOrdersCard customerId={customer.id} />
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
