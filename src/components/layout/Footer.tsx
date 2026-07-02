import Link from "next/link";

import { Container } from "@/components/ui/container";
import { COMPANY_INFO } from "@/constants/nav";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 md:grid-cols-3">
        <div>
          <h3 className="font-heading text-base font-semibold text-foreground">
            {COMPANY_INFO.name}
          </h3>
          <p className="mt-3 text-sm text-muted-foreground">
            Produtos resistentes, feitos para quem vive o agro.
          </p>
        </div>

        <div>
          <h3 className="font-heading text-base font-semibold text-foreground">Contato</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <a href={COMPANY_INFO.whatsapp} className="hover:text-foreground">
                WhatsApp
              </a>
            </li>
            <li>
              <a
                href={COMPANY_INFO.email === "#" ? "#" : `mailto:${COMPANY_INFO.email}`}
                className="hover:text-foreground"
              >
                Email
              </a>
            </li>
            <li>
              <a href={COMPANY_INFO.instagram} className="hover:text-foreground">
                Instagram
              </a>
            </li>
            <li>
              <a href={COMPANY_INFO.facebook} className="hover:text-foreground">
                Facebook
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-heading text-base font-semibold text-foreground">Institucional</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/privacy" className="hover:text-foreground">
                Política de Privacidade
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-foreground">
                Termos de Uso
              </Link>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-border py-6">
        <Container>
          <p className="text-center text-xs text-muted-foreground">
            &copy; {year} {COMPANY_INFO.name}. Todos os direitos reservados.
          </p>
        </Container>
      </div>
    </footer>
  );
}

export { Footer };
