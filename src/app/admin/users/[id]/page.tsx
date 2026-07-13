"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";

import { AdminDetailHeader } from "@/components/admin/AdminDetailHeader";
import { UserRoleToggle } from "@/components/admin/users/UserRoleToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { deleteUserAdmin, getUserByIdAdmin, updateUserAdmin } from "@/services/user.service";
import type { User } from "@/types/auth";
import { getApiErrorMessage } from "@/utils/apiError";
import { confirmToast } from "@/utils/confirmToast";
import { formatDateTime } from "@/utils/date";

type PageStatus = "loading" | "ready" | "error";

const FORM_ID = "user-edit-form";

export default function EditUserPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const userId = Number(params.id);

  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<PageStatus>("loading");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getUserByIdAdmin(userId)
      .then((data) => {
        if (cancelled) return;
        if (data === null) {
          setStatus("error");
          return;
        }
        setUser(data);
        setEmail(data.email);
        setStatus("ready");
      })
      .catch((error) => {
        if (cancelled) return;
        setStatus("error");
        toast.error(getApiErrorMessage(error, "Não foi possível carregar este usuário."));
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function saveUser(): Promise<boolean> {
    setIsSaving(true);

    try {
      const updated = await updateUserAdmin(userId, {
        ...(email !== user?.email ? { email } : {}),
        ...(password ? { password } : {}),
      });
      setUser(updated);
      setPassword("");
      toast.success("Usuário atualizado.");
      return true;
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível atualizar este usuário."));
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await saveUser();
  }

  function handleDelete() {
    if (!user) return;
    confirmToast(`Excluir o usuário "${user.email}"?`, performDelete, {
      confirmLabel: "Excluir",
    });
  }

  async function performDelete() {
    if (!user) return;
    setIsDeleting(true);
    try {
      await deleteUserAdmin(user.id);
      toast.success("Usuário excluído.");
      router.push("/admin/users");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível excluir este usuário."));
      setIsDeleting(false);
    }
  }

  if (status === "loading") {
    return <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>;
  }

  if (status === "error" || !user) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Não foi possível carregar este usuário.
      </p>
    );
  }

  const isSelf = currentUser?.id === user.id;
  const isDirty = email !== user.email || password !== "";

  return (
    <div className="flex flex-col">
      <AdminDetailHeader
        backHref="/admin/users"
        backLabel="Voltar para usuários"
        title={user.email}
        subtitle={`Criado em ${formatDateTime(user.created_at)}`}
        isDirty={isDirty}
        onSaveAndLeave={saveUser}
        meta={
          <UserRoleToggle
            user={user}
            onChange={setUser}
            disabled={isSelf}
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
              <CardTitle>Dados de acesso</CardTitle>
            </CardHeader>
            <CardContent>
              <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Field label="E-mail" htmlFor="user-email">
                  <Input
                    id="user-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>
                <Field label="Nova senha (opcional)" htmlFor="user-password">
                  <Input
                    id="user-password"
                    type="password"
                    placeholder="Deixe em branco para não alterar"
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Field>
              </form>
            </CardContent>
          </Card>
          {isSelf && (
            <p className="text-xs text-muted-foreground">
              Você não pode alterar o status, as permissões ou excluir a própria conta por aqui.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:col-span-1 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Excluir usuário</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-xs text-muted-foreground">
                Desativa a conta — o usuário deixa de conseguir acessar o sistema.
              </p>
              <div>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isSelf || isDeleting}
                  onClick={handleDelete}
                >
                  {isDeleting ? "Excluindo..." : "Excluir usuário"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
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
