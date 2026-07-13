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

/**
 * Toast de saída com alterações não salvas. Sem terceiro botão nativo no
 * sonner — descartar (dismiss/timeout) já funciona como "cancelar e
 * permanecer na página", que é o comportamento esperado.
 */
export function confirmLeaveWithUnsavedChanges(onSave: () => void, onDiscard: () => void): void {
  toast("Você tem alterações não salvas. Deseja salvá-las antes de sair?", {
    duration: 10000,
    action: {
      label: "Salvar e sair",
      onClick: onSave,
    },
    cancel: {
      label: "Sair sem salvar",
      onClick: onDiscard,
    },
  });
}
