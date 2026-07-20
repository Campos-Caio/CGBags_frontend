import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

/** Substitui o parágrafo "Carregando..." cru repetido em toda tela do admin. */
export function LoadingState({ message = "Carregando...", className }: LoadingStateProps) {
  return <p className={cn("py-8 text-center text-sm text-muted-foreground", className)}>{message}</p>;
}
