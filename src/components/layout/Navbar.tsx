import Link from "next/link";

import { Container } from "@/components/ui/container";
import { AuthNavActions } from "@/components/layout/AuthNavActions";
import { CartIndicator } from "@/components/layout/CartIndicator";
import { MobileNav } from "@/components/layout/MobileNav";
import { NAV_LINKS } from "@/constants/nav";

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <Container className="flex h-24 items-center justify-between">
        <Link href="/" className="font-heading text-2xl font-semibold text-primary">
          CG Bags
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-base font-medium text-primary/80 transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <CartIndicator />
          <AuthNavActions />
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}

export { Navbar };
