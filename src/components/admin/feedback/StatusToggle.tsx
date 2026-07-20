import { Badge } from "@/components/ui/badge";

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
    <Badge asChild variant={active ? "success" : "muted"}>
      <button type="button" disabled={disabled} onClick={onToggle} title={title}>
        {active ? activeLabel : inactiveLabel}
      </button>
    </Badge>
  );
}
