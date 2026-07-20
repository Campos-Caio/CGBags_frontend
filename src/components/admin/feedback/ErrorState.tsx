import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

/** Visualmente diferente de LoadingState/EmptyState (texto em destructive) — hoje os 3 casos usavam o mesmo parágrafo cinza. */
export function ErrorState({ message = "Não foi possível carregar os dados.", onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <p className="text-sm text-destructive">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
