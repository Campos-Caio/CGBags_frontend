import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/utils/apiError";

export type AdminResourceStatus = "loading" | "ready" | "error";

interface UseAdminResourceOptions<T> {
  /** Busca o recurso; retornar null significa "não encontrado" (vira status "error"). */
  fetch: () => Promise<T | null>;
  /** Valores que devem disparar uma nova busca (tipicamente o id da rota). */
  deps: unknown[];
  errorMessage: string;
}

interface UseAdminResourceResult<T> {
  data: T | null;
  setData: Dispatch<SetStateAction<T | null>>;
  status: AdminResourceStatus;
}

/**
 * Busca-por-id + loading/erro compartilhado pelas telas de detalhe do admin
 * (produto, cliente, usuário, pedido, orçamento, cupom) — mesmo papel que
 * `useAdminList` já cumre pro caso de lista, so' que pra um unico recurso.
 */
export function useAdminResource<T>({
  fetch,
  deps,
  errorMessage,
}: UseAdminResourceOptions<T>): UseAdminResourceResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<AdminResourceStatus>("loading");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      await Promise.resolve();
      if (cancelled) return;
      setStatus("loading");

      try {
        const result = await fetch();
        if (cancelled) return;
        if (result === null) {
          setStatus("error");
          return;
        }
        setData(result);
        setStatus("ready");
      } catch (error) {
        if (cancelled) return;
        setStatus("error");
        toast.error(getApiErrorMessage(error, errorMessage));
      }
    }

    load();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps sao passados explicitamente pelo caller, igual useAdminList
  }, deps);

  return { data, setData, status };
}
