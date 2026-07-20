import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { AuthNavActions } from "@/components/layout/AuthNavActions";
import { CartIndicator } from "@/components/layout/CartIndicator";
import { MobileNav } from "@/components/layout/MobileNav";
import { NAV_LINKS } from "@/constants/nav";

const LOGO_URL =
  "https://pub-f05bd9d6faa24b25b80b3a504637c87e.r2.dev/CG%20BAGS%20LOGO%2002%20VERDE%20PNG.png";

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <Container className="flex h-24 items-center justify-between">
        <Link href="/" className="shrink-0">
          <Image src={LOGO_URL} alt="CG Bags" width={220} height={135} priority className="h-14 w-auto" />
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
