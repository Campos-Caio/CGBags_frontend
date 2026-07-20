import { X } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FilterBarProps {
  /** Sem título por padrão — a maioria das listas so' tem os controles, sem precisar de um rótulo "Filtros". */
  title?: string;
  /** Itens retornados nesta página — não é o total geral (o backend não expõe contagem total). */
  resultCount?: number;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  children: ReactNode;
}

/** Card com os controles de busca/filtro de uma listagem — mesmo wrapper em toda tela de lista do admin. */
export function FilterBar({
  title,
  resultCount,
  hasActiveFilters = false,
  onClearFilters,
  children,
}: FilterBarProps) {
  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="flex flex-wrap items-center gap-4">
        {children}
        {hasActiveFilters && onClearFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="gap-1.5">
            <X className="size-3.5" aria-hidden />
            Limpar filtros
          </Button>
        )}
        {resultCount !== undefined && (
          <span className="ml-auto text-sm text-muted-foreground">
            {resultCount} {resultCount === 1 ? "resultado" : "resultados"} nesta página
          </span>
        )}
      </CardContent>
    </Card>
  );
}
