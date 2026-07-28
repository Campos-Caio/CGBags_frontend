import type { PersonType } from "@/types/customer";

/** Remove tudo que nao for digito e limita a `maxDigits` caracteres. */
function digitsOnly(value: string, maxDigits: number): string {
  return value.replace(/\D/g, "").slice(0, maxDigits);
}

/** CEP: 8 digitos, formatado como 00000-000 — espelha a validacao do backend (AddressBase.zip_code). */
export function maskZipCode(value: string): string {
  const digits = digitsOnly(value, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

/**
 * CPF (11 digitos, PF) ou CNPJ (14 digitos, PJ) — o formato/limite e' definido
 * pelo `personType` escolhido, nunca pela quantidade de digitos ja' digitados
 * (senao da' pra digitar 14 digitos com PF selecionado, viram um CNPJ "valido"
 * pro backend mas incompativel com o tipo de pessoa marcado). Espelha a
 * validacao cruzada do backend (CustomerBase/_validate_person_type_document).
 */
export function maskCpfCnpj(value: string, personType: PersonType): string {
  if (personType === "PF") {
    // CPF: 000.000.000-00
    const digits = digitsOnly(value, 11);
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  // CNPJ: 00.000.000/0000-00
  const digits = digitsOnly(value, 14);
  return digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}
