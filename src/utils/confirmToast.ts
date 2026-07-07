import { toast } from "sonner";

/** Confirmação de ações destrutivas via toast (sonner) — nunca usar window.confirm/alert. */
export function confirmToast(
  message: string,
  onConfirm: () => void,
  options?: { confirmLabel?: string }
): void {
  toast(message, {
    duration: 10000,
    action: {
      label: options?.confirmLabel ?? "Confirmar",
      onClick: onConfirm,
    },
    cancel: {
      label: "Cancelar",
      onClick: () => {},
    },
  });
}
