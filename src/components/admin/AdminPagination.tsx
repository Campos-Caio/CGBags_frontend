import { Button } from "@/components/ui/button";

interface AdminPaginationProps {
  page: number;
  onPageChange: (page: number) => void;
  itemCount: number;
  pageSize: number;
}

/** Par de botões "Anterior/Próxima" repetido em toda listagem admin — paginação por "página cheia" (sem contagem total do backend). */
export function AdminPagination({ page, onPageChange, itemCount, pageSize }: AdminPaginationProps) {
  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={page === 0}
        onClick={() => onPageChange(Math.max(0, page - 1))}
      >
        Anterior
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={itemCount < pageSize}
        onClick={() => onPageChange(page + 1)}
      >
        Próxima
      </Button>
    </div>
  );
}
