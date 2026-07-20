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
 * CPF (11 digitos) ou CNPJ (14 digitos), formatado conforme o tamanho digitado —
 * espelha a validacao do backend (CustomerBase.cpf_cnpj, aceita 11 ou 14 digitos).
 */
export function maskCpfCnpj(value: string): string {
  const digits = digitsOnly(value, 14);
  if (digits.length <= 11) {
    // CPF: 000.000.000-00
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  // CNPJ: 00.000.000/0000-00
  return digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}
