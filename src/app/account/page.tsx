"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { DefinitionRow } from "@/components/ui/definition-row";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { updateEmail } from "@/services/auth.service";
import { getMyProfile, updateMyProfile } from "@/services/customer.service";
import type { Customer, PersonType } from "@/types/customer";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatDate } from "@/utils/date";

const PERSON_TYPE_LABEL: Record<PersonType, string> = {
  PF: "Pessoa física",
  PJ: "Pessoa jurídica",
};

type ProfileStatus = "loading" | "ready" | "error";

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [status, setStatus] = useState<ProfileStatus>("loading");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    async function loadProfile() {
      await Promise.resolve();

      try {
        const profile = await getMyProfile();
        if (cancelled) return;
        setCustomer(profile);
        setStatus("ready");
      } catch (error) {
        if (cancelled) return;
        setStatus("error");
        toast.error(getApiErrorMessage(error, "Não foi possível carregar seu perfil."));
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  function startEditing() {
    if (!customer) return;
    setEmail(user?.email ?? "");
    setFullName(customer.full_name);
    setPhone(customer.phone);
    setBirthDate(customer.birth_date?.slice(0, 10) ?? "");
    setIsEditing(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);

    try {
      if (email !== user?.email) {
        await updateEmail(email);
        await refreshUser();
      }

      const updated = await updateMyProfile({
        full_name: fullName,
        phone,
        ...(birthDate ? { birth_date: birthDate } : {}),
      });
      setCustomer(updated);

      toast.success("Perfil atualizado com sucesso.");
      setIsEditing(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível atualizar seu perfil."));
    } finally {
      setIsSaving(false);
    }
  }

  if (authLoading || !isAuthenticated || status === "loading") {
    return (
      <Container className="py-16 text-center text-muted-foreground">Carregando...</Container>
    );
  }

  if (status === "error") {
    return (
      <Container className="flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Meu perfil</h1>
        <p className="max-w-prose text-muted-foreground">
          Não foi possível carregar suas informações agora. Tente novamente em instantes.
        </p>
      </Container>
    );
  }

  if (!customer) {
    return (
      <Container className="flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Meu perfil</h1>
        <p className="max-w-prose text-muted-foreground">
          Você ainda não completou seu cadastro de cliente.
        </p>
        <Button asChild>
          <Link href="/account/complete-profile">Completar cadastro</Link>
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            Meu perfil
          </h1>
          {!isEditing && (
            <Button variant="outline" onClick={startEditing}>
              Editar
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados de acesso</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <FormField label="E-mail" htmlFor="email">
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </FormField>
              ) : (
                <DefinitionRow size="lg" label="E-mail" value={user?.email ?? "-"} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dados pessoais</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-border">
              {isEditing ? (
                <FormField label="Nome completo" htmlFor="fullName">
                  <Input
                    id="fullName"
                    required
                    minLength={3}
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                  />
                </FormField>
              ) : (
                <DefinitionRow size="lg" label="Nome completo" value={customer.full_name} />
              )}

              <DefinitionRow
                size="lg"
                label="Tipo de cadastro"
                value={PERSON_TYPE_LABEL[customer.person_type]}
                locked={isEditing}
              />
              <DefinitionRow
                size="lg"
                label={customer.person_type === "PF" ? "CPF" : "CNPJ"}
                value={customer.cpf_cnpj}
                locked={isEditing}
              />

              {isEditing ? (
                <FormField label="Telefone" htmlFor="phone">
                  <Input
                    id="phone"
                    required
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </FormField>
              ) : (
                <DefinitionRow size="lg" label="Telefone" value={customer.phone} />
              )}

              {isEditing ? (
                <FormField label="Data de nascimento" htmlFor="birthDate">
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(event) => setBirthDate(event.target.value)}
                  />
                </FormField>
              ) : (
                customer.birth_date && (
                  <DefinitionRow
                    size="lg"
                    label="Data de nascimento"
                    value={formatDate(customer.birth_date)}
                  />
                )
              )}

              {customer.state_registration && (
                <DefinitionRow
                  size="lg"
                  label="Inscrição estadual"
                  value={customer.state_registration}
                />
              )}
            </CardContent>
          </Card>

          {!isEditing && (
            <Card>
              <CardHeader>
                <CardTitle>Pedidos</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  Acompanhe o status e o histórico das suas compras.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/account/orders">Ver meus pedidos</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {isEditing ? (
            <div className="flex gap-3">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Tipo de cadastro e CPF/CNPJ não podem ser alterados.
            </p>
          )}
        </form>
      </div>
    </Container>
  );
}

function FormField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 py-4">
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
