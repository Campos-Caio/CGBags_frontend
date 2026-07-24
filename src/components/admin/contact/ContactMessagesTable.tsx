"use client";

import { useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/admin/feedback/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { resolveContactMessage } from "@/services/contact.service";
import type { ContactMessage } from "@/types/contact";
import { getApiErrorMessage } from "@/utils/apiError";
import {
  CONTACT_MESSAGE_STATUS_BADGE_VARIANT,
  CONTACT_MESSAGE_STATUS_LABEL,
} from "@/utils/contactMessageStatus";
import { formatDateTime } from "@/utils/date";

interface ContactMessagesTableProps {
  messages: ContactMessage[];
  onMessagesChange: (messages: ContactMessage[]) => void;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}

export function ContactMessagesTable({
  messages,
  onMessagesChange,
  hasActiveFilters = false,
  onClearFilters,
}: ContactMessagesTableProps) {
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  async function handleResolve(message: ContactMessage) {
    setResolvingId(message.id);
    try {
      const updated = await resolveContactMessage(message.id);
      onMessagesChange(messages.map((m) => (m.id === updated.id ? updated : m)));
      toast.success("Mensagem marcada como resolvida.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível atualizar a mensagem."));
    } finally {
      setResolvingId(null);
    }
  }

  if (messages.length === 0) {
    return hasActiveFilters ? (
      <EmptyState
        message="Nenhum resultado para estes filtros."
        action={onClearFilters ? { label: "Limpar filtros", onClick: onClearFilters } : undefined}
      />
    ) : (
      <EmptyState message="Nenhuma mensagem de contato recebida ainda." />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Contato</TableHead>
          <TableHead>Mensagem</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Recebida em</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {messages.map((message) => (
          <TableRow key={message.id}>
            <TableCell className="font-medium text-foreground">{message.name}</TableCell>
            <TableCell className="text-muted-foreground">
              <div className="flex flex-col">
                <span>{message.email}</span>
                {message.phone && <span>{message.phone}</span>}
              </div>
            </TableCell>
            <TableCell className="max-w-xs text-muted-foreground">
              <span className="line-clamp-2" title={message.message}>
                {message.message}
              </span>
            </TableCell>
            <TableCell>
              <Badge variant={CONTACT_MESSAGE_STATUS_BADGE_VARIANT[message.status]}>
                {CONTACT_MESSAGE_STATUS_LABEL[message.status]}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDateTime(message.created_at)}
            </TableCell>
            <TableCell>
              {message.status === "NEW" && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={resolvingId === message.id}
                  onClick={() => handleResolve(message)}
                >
                  Marcar como resolvida
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
