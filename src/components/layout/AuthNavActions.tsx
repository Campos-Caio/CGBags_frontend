"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Package, User } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const menuItemClass =
  "flex cursor-default select-none items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium outline-none data-[highlighted]:bg-muted data-[highlighted]:text-foreground";

function AuthNavActions() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
    } finally {
      // finally: mesmo se a chamada ao backend falhar, o AuthContext ja
      // limpa a sessao localmente — o usuario precisa ver que saiu.
      toast.success("Você saiu da sua conta.");
      router.push("/");
    }
  }

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label="Minha conta"
            className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
          >
            <User className="size-5" />
          </Button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={8}
            className="z-50 min-w-48 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          >
            <DropdownMenu.Item asChild>
              <Link href="/account" className={menuItemClass}>
                <User className="size-4" aria-hidden />
                Minha conta
              </Link>
            </DropdownMenu.Item>

            <DropdownMenu.Item asChild>
              <Link href="/account/orders" className={menuItemClass}>
                <Package className="size-4" aria-hidden />
                Meus pedidos
              </Link>
            </DropdownMenu.Item>

            {user?.is_admin && (
              <DropdownMenu.Item asChild>
                <Link href="/admin" className={menuItemClass}>
                  <LayoutDashboard className="size-4" aria-hidden />
                  Painel de admin
                </Link>
              </DropdownMenu.Item>
            )}

            <DropdownMenu.Separator className="my-1 h-px bg-border" />

            <DropdownMenu.Item
              onSelect={() => handleLogout()}
              className={`${menuItemClass} text-destructive data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive`}
            >
              <LogOut className="size-4" aria-hidden />
              Sair
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    );
  }

  return (
    <Button variant="outline" size="default" className="text-primary" asChild>
      <Link href="/login">Entrar</Link>
    </Button>
  );
}

export { AuthNavActions };
