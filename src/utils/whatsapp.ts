/**
 * Monta um link direto do WhatsApp (wa.me) com mensagem pre-preenchida.
 *
 * Sem integracao de API nenhuma de proposito — e' so' um link, igual ao
 * padrao usado por qualquer botao "Fale conosco" de e-commerce. Serve tanto
 * pro cliente contatar a loja (numero fixo da empresa) quanto pro admin
 * contatar um cliente especifico (numero variavel, vindo do cadastro).
 */
export function buildWhatsappLink(phone: string, message: string): string {
  const digitsOnly = phone.replace(/\D/g, "");
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
}
