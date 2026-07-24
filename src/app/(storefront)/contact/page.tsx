import { AtSign, Link2, MessageCircle } from "lucide-react";

import { ContactForm } from "@/components/contact/ContactForm";
import { Container } from "@/components/ui/container";
import { COMPANY_INFO } from "@/constants/nav";
import { buildWhatsappLink } from "@/utils/whatsapp";

// "#" e o sentinela de "ainda nao definido" (ver COMPANY_INFO em
// constants/nav.ts) — mesmo filtro usado no Footer, pra nunca renderizar um
// link morto pro cliente.
const CONTACT_CHANNELS = [
  {
    label: "WhatsApp",
    href: COMPANY_INFO.whatsapp === "#" ? "#" : buildWhatsappLink(COMPANY_INFO.whatsapp, "Olá! Vim pelo site da CG Bags."),
    icon: MessageCircle,
  },
  {
    label: "Email",
    href: COMPANY_INFO.email === "#" ? "#" : `mailto:${COMPANY_INFO.email}`,
    icon: AtSign,
  },
  { label: "Instagram", href: COMPANY_INFO.instagram, icon: Link2 },
  { label: "Facebook", href: COMPANY_INFO.facebook, icon: Link2 },
].filter((channel) => channel.href !== "#");

export default function ContactPage() {
  const hasChannels = CONTACT_CHANNELS.length > 0;

  return (
    <Container className="py-12 sm:py-16">
      <div className={hasChannels ? "mx-auto max-w-4xl" : "mx-auto max-w-md"}>
        <h1 className="font-heading text-3xl font-semibold text-foreground">Fale conosco</h1>
        <p className="mt-2 text-muted-foreground">
          Dúvidas, sugestões ou precisa de ajuda? Manda uma mensagem que a gente responde.
        </p>

        <div className={hasChannels ? "mt-10 grid grid-cols-1 gap-10 md:grid-cols-2" : "mt-10"}>
          <div>
            <ContactForm />
          </div>

          {hasChannels && (
            <div className="flex flex-col gap-3">
              <h2 className="font-heading text-lg font-semibold text-foreground">
                Outros canais
              </h2>
              <ul className="flex flex-col gap-3">
                {CONTACT_CHANNELS.map((channel) => (
                  <li key={channel.label}>
                    <a
                      href={channel.href}
                      target={channel.href.startsWith("http") ? "_blank" : undefined}
                      rel={channel.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <channel.icon className="size-4" aria-hidden />
                      {channel.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
