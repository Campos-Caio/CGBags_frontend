import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/utils/apiError";

const DEFAULT_PAGE_SIZE = 20;

interface UseAdminListOptions<T> {
  /** Busca uma pagina de resultados — so' recebe skip/limit; filtros ficam a cargo do caller via `deps`. */
  fetchPage: (params: { skip: number; limit: number }) => Promise<T[]>;
  /** Valores de filtro que devem disparar um novo fetch (a partir da pagina 0). */
  deps: unknown[];
  errorMessage: string;
  pageSize?: number;
}

interface UseAdminListResult<T> {
  data: T[];
  setData: (data: T[]) => void;
  isLoading: boolean;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
}

/**
 * Estado + busca paginada compartilhados pelas listagens admin (produtos,
 * clientes, usuarios, pedidos): guarda os dados/loading/pagina, refaz o
 * fetch quando `deps` muda (resetando a pagina para 0), com o mesmo padrao
 * de cancelamento por unmount/nova chamada usado em toda a base.
 *
 * Filtros (search, status etc.) continuam vivendo na propria pagina — o
 * hook so' precisa deles via `deps` para saber quando refazer a busca.
 */
export function useAdminList<T>({
  fetchPage,
  deps,
  errorMessage,
  pageSize = DEFAULT_PAGE_SIZE,
}: UseAdminListOptions<T>): UseAdminListResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      await Promise.resolve();
      if (cancelled) return;
      setIsLoading(true);

      try {
        const result = await fetchPage({ skip: page * pageSize, limit: pageSize });
        if (!cancelled) setData(result);
      } catch (error) {
        if (!cancelled) toast.error(getApiErrorMessage(error, errorMessage));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps sao os filtros passados pelo caller
  }, [page, ...deps]);

  return { data, setData, isLoading, page, setPage, pageSize };
}
