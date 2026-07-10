"use client";

import { useState } from "react";
import { toast } from "sonner";

import { setUserRole } from "@/services/user.service";
import type { User } from "@/types/auth";
import { getApiErrorMessage } from "@/utils/apiError";
import { cn } from "@/lib/utils";

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
      <button
        type="button"
        disabled={disabled || isSaving}
        onClick={() => toggle("is_active")}
        className={cn(
          "rounded-full px-2 py-0.5 text-xs font-medium transition-colors disabled:opacity-50",
          user.is_active
            ? "bg-green-100 text-green-800 hover:bg-green-200"
            : "bg-muted text-muted-foreground hover:bg-muted/70"
        )}
      >
        {user.is_active ? "Ativo" : "Inativo"}
      </button>
      <button
        type="button"
        disabled={disabled || isSaving}
        onClick={() => toggle("is_admin")}
        className={cn(
          "rounded-full px-2 py-0.5 text-xs font-medium transition-colors disabled:opacity-50",
          user.is_admin
            ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
            : "bg-muted text-muted-foreground hover:bg-muted/70"
        )}
      >
        {user.is_admin ? "Admin" : "Cliente"}
      </button>
    </div>
  );
}
