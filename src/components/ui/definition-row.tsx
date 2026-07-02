import { Lock } from "lucide-react";

import { cn } from "@/lib/utils";

interface DefinitionRowProps {
  label: string;
  value: string;
  size?: "sm" | "lg";
  /** Indica que este campo não é editável mesmo estando entre campos de formulário. */
  locked?: boolean;
}

function DefinitionRow({ label, value, size = "sm", locked = false }: DefinitionRowProps) {
  return (
    <div
      className={cn(
        "flex justify-between gap-4",
        size === "lg" ? "py-4 text-base" : "py-3 text-sm",
        locked && "rounded-lg bg-muted/50 px-3"
      )}
    >
      <dt className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
        {label}
        {locked && <Lock className="size-3.5" aria-hidden />}
      </dt>
      <dd className="min-w-0 break-words text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}

export { DefinitionRow };
