import Image from "next/image";

import { Container } from "@/components/ui/container";
import { COMPANY_INFO } from "@/constants/nav";

const LOGO_URL =
  "https://pub-f05bd9d6faa24b25b80b3a504637c87e.r2.dev/CG%20BAGS%20LOGO%2006%20COM%20SLOGAN%20PNG.png";

// "#" e o sentinela de "ainda nao definido" (ver COMPANY_INFO em constants/nav.ts)
// — filtra pra nunca renderizar um link morto pro cliente.
const CONTACT_LINKS = [
  { label: "WhatsApp", href: COMPANY_INFO.whatsapp },
  { label: "Email", href: COMPANY_INFO.email === "#" ? "#" : `mailto:${COMPANY_INFO.email}` },
  { label: "Instagram", href: COMPANY_INFO.instagram },
  { label: "Facebook", href: COMPANY_INFO.facebook },
].filter((link) => link.href !== "#");

// Paginas institucionais (privacidade/termos) ainda nao existem — a secao
// inteira fica oculta ate pelo menos uma delas ser publicada.
const INSTITUTIONAL_LINKS: { label: string; href: string }[] = [];

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30">
      <Container className="flex flex-wrap justify-center gap-10 py-12 text-center">
        <div className="flex flex-col items-center">
          <Image src={LOGO_URL} alt={COMPANY_INFO.name} width={315} height={235} className="h-24 w-auto" />
          <p className="mt-3 text-sm text-muted-foreground">
            Produtos resistentes, feitos para quem vive o agro.
          </p>
        </div>

        {CONTACT_LINKS.length > 0 && (
          <div>
            <h3 className="font-heading text-base font-semibold text-foreground">Contato</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {CONTACT_LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-foreground">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {INSTITUTIONAL_LINKS.length > 0 && (
          <div>
            <h3 className="font-heading text-base font-semibold text-foreground">
              Institucional
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {INSTITUTIONAL_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-foreground">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
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
