import { cn } from "@/lib/utils";

interface StatusToggleProps {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
  onToggle: () => void;
  disabled?: boolean;
  title?: string;
}

export function StatusToggle({
  active,
  activeLabel = "Ativo",
  inactiveLabel = "Inativo",
  onToggle,
  disabled = false,
  title,
}: StatusToggleProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      title={title}
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50",
        active
          ? "bg-green-100 text-green-800 hover:bg-green-200"
          : "bg-muted text-muted-foreground hover:bg-muted/70"
      )}
    >
      {active ? activeLabel : inactiveLabel}
    </button>
  );
}
