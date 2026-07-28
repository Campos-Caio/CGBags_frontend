"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";

import { DetailHeader } from "@/components/admin/layout/DetailHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { createUserAdmin } from "@/services/user.service";
import { getApiErrorMessage } from "@/utils/apiError";

const FORM_ID = "user-new-form";

export default function NewUserPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await createUserAdmin({ email, password, is_admin: isAdmin });
      toast.success("Usuário criado.");
      router.push("/admin/users");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível criar este usuário."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col">
      <DetailHeader
        backHref="/admin/users"
        backLabel="Voltar para usuários"
        title="Novo usuário"
        actions={
          <Button type="submit" form={FORM_ID} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Criar usuário"}
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Dados de acesso</CardTitle>
        </CardHeader>
        <CardContent>
          <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="E-mail" htmlFor="new-user-email">
              <Input
                id="new-user-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label="Senha" htmlFor="new-user-password">
              <Input
                id="new-user-password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <Checkbox
                checked={isAdmin}
                onCheckedChange={(checked) => setIsAdmin(checked === true)}
              />
              Conceder permissão de administrador
            </label>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

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
