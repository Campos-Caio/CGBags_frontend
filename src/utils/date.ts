import { format, parseISO } from "date-fns";

export function formatDate(value: string): string {
  return format(parseISO(value), "dd/MM/yyyy");
}

export function formatDateTime(value: string): string {
  return format(parseISO(value), "dd/MM/yyyy 'às' HH:mm");
}
