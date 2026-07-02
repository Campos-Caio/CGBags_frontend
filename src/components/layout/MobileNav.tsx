"use client";

import { useState } from "react";
import Link from "next/link";
import { Dialog, VisuallyHidden } from "radix-ui";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "@/constants/nav";

function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="ghost" size="icon-lg" aria-label="Abrir menu" className="md:hidden">
          <Menu className="size-5" />
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 md:hidden" />

        <Dialog.Content
          className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-xs flex-col gap-6 border-l border-border bg-background p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right md:hidden"
        >
          <div className="flex items-center justify-between">
            <Dialog.Title className="font-heading text-lg font-semibold text-foreground">
              Menu
            </Dialog.Title>
            <VisuallyHidden.Root asChild>
              <Dialog.Description>Links de navegação do site</Dialog.Description>
            </VisuallyHidden.Root>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Fechar menu">
                <X />
              </Button>
            </Dialog.Close>
          </div>

          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export { MobileNav };
