import axios from "axios";

const DEFAULT_MESSAGE = "Ocorreu um erro. Tente novamente.";

export function getApiErrorMessage(error: unknown, fallback: string = DEFAULT_MESSAGE): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "Não foi possível conectar ao servidor. Verifique sua conexão.";
    }

    const detail = error.response.data?.detail;
    if (typeof detail === "string") {
      return detail;
    }

    if (error.response.status >= 500) {
      return "Erro interno do servidor. Tente novamente mais tarde.";
    }
  }

  return fallback;
}
