import axios from "axios";

const DEFAULT_MESSAGE = "Ocorreu um erro. Tente novamente.";

interface ValidationErrorItem {
  msg?: string;
}

export function getApiErrorMessage(error: unknown, fallback: string = DEFAULT_MESSAGE): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "Não foi possível conectar ao servidor. Verifique sua conexão.";
    }

    const detail = error.response.data?.detail;
    if (typeof detail === "string") {
      return detail;
    }

    // Erro de validacao do FastAPI (422): "detail" e' uma lista de
    // {loc, msg, type}, nao uma string — sem isso, todo 422 de validacao
    // (campo obrigatorio, formato invalido etc.) caia no fallback generico
    // em vez de mostrar o motivo real.
    if (Array.isArray(detail) && detail.length > 0) {
      const items = detail as ValidationErrorItem[];
      const messages = items
        .map((item) => item.msg?.replace(/^Value error, /, ""))
        .filter((msg): msg is string => Boolean(msg));
      if (messages.length > 0) {
        return messages.join(" ");
      }
    }

    if (error.response.status >= 500) {
      return "Erro interno do servidor. Tente novamente mais tarde.";
    }
  }

  return fallback;
}
