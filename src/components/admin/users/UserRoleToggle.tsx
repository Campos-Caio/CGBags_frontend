"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { setUserRole } from "@/services/user.service";
import type { User } from "@/types/auth";
import { getApiErrorMessage } from "@/utils/apiError";

interface UserRoleToggleProps {
  user: User;
  onChange: (user: User) => void;
  disabled?: boolean;
}

export function UserRoleToggle({ user, onChange, disabled = false }: UserRoleToggleProps) {
  const [isSaving, setIsSaving] = useState(false);

  async function toggle(field: "is_active" | "is_admin") {
    setIsSaving(true);
    try {
      const updated = await setUserRole(user.id, { [field]: !user[field] });
      onChange(updated);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível atualizar este usuário."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex gap-1.5">
      <Badge asChild variant={user.is_active ? "success" : "muted"}>
        <button type="button" disabled={disabled || isSaving} onClick={() => toggle("is_active")}>
          {user.is_active ? "Ativo" : "Inativo"}
        </button>
      </Badge>
      <Badge asChild variant={user.is_admin ? "info" : "muted"}>
        <button type="button" disabled={disabled || isSaving} onClick={() => toggle("is_admin")}>
          {user.is_admin ? "Admin" : "Cliente"}
        </button>
      </Badge>
    </div>
  );
}
