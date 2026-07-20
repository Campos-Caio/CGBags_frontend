export interface AdminNavLink {
  label: string;
  href: string;
  enabled: boolean;
}

export interface AdminNavGroup {
  label: string;
  links: AdminNavLink[];
}

/** Agrupado por domínio do negócio (não pela ordem em que as telas foram criadas). */
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: "Geral",
    links: [{ label: "Dashboard", href: "/admin", enabled: true }],
  },
  {
    label: "Catálogo",
    links: [
      { label: "Produtos", href: "/admin/products", enabled: true },
      { label: "Categorias", href: "/admin/categories", enabled: true },
      { label: "Estoque", href: "/admin/stock", enabled: true },
    ],
  },
  {
    label: "Vendas",
    links: [
      { label: "Pedidos", href: "/admin/orders", enabled: true },
      { label: "Orçamentos", href: "/admin/quotes", enabled: true },
      { label: "Cupons", href: "/admin/coupons", enabled: true },
    ],
  },
  {
    label: "Financeiro",
    links: [{ label: "Financeiro", href: "/admin/financeiro", enabled: true }],
  },
  {
    label: "Clientes",
    links: [{ label: "Clientes", href: "/admin/customers", enabled: true }],
  },
  {
    label: "Administração",
    links: [{ label: "Usuários", href: "/admin/users", enabled: true }],
  },
];
