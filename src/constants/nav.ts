export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Produtos", href: "/products" },
  { label: "Contato", href: "/contact" },
] as const;

// Contatos/redes sociais ainda nao definidos pela CG Bags. Valor "#" e o
// sentinela usado pelo Footer para nao renderizar o link ate ter dado real
// (ver CONTACT_LINKS em Footer.tsx) — nao e uma URL valida de verdade.
export const COMPANY_INFO = {
  name: "CG Bags",
  whatsapp: "#",
  email: "#",
  instagram: "#",
  facebook: "#",
} as const;
