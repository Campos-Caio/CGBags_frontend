"use client";

import { useState } from "react";
import { Eye } from "lucide-react";

import { EmptyState } from "@/components/admin/feedback/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AuditLog } from "@/types/audit";
import { formatAuditAction } from "@/utils/auditEntity";
import { formatDateTime } from "@/utils/date";

interface AuditLogTableProps {
  logs: AuditLog[];
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}

function JsonBlock({ label, value }: { label: string; value: unknown }) {
  if (value === null || value === undefined) return null;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <pre className="max-h-64 overflow-auto rounded-lg bg-muted p-3 text-xs">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

export function AuditLogTable({ logs, hasActiveFilters = false, onClearFilters }: AuditLogTableProps) {
  const [selected, setSelected] = useState<AuditLog | null>(null);

  if (logs.length === 0) {
    return hasActiveFilters ? (
      <EmptyState
        message="Nenhum registro para estes filtros."
        action={onClearFilters ? { label: "Limpar filtros", onClick: onClearFilters } : undefined}
      />
    ) : (
      <EmptyState message="Nenhum registro de auditoria encontrado." />
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data/Hora</TableHead>
            <TableHead>Entidade</TableHead>
            <TableHead>Ação</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Usuário</TableHead>
            <TableHead>IP</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="text-muted-foreground">{formatDateTime(log.created_at)}</TableCell>
              <TableCell className="font-medium text-foreground">{log.entity}</TableCell>
              <TableCell className="text-muted-foreground">{formatAuditAction(log.action)}</TableCell>
              <TableCell className="text-muted-foreground">{log.entity_id ?? "-"}</TableCell>
              <TableCell className="text-muted-foreground">
                {log.user_id ?? <span className="italic">sistema</span>}
              </TableCell>
              <TableCell className="text-muted-foreground">{log.ip_address ?? "-"}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Ver detalhes"
                  onClick={() => setSelected(log)}
                >
                  <Eye className="size-3.5" aria-hidden />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {selected.entity} #{selected.entity_id ?? "-"} — {formatAuditAction(selected.action)}
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(selected.created_at)} · usuário {selected.user_id ?? "sistema"} ·{" "}
                  {selected.ip_address ?? "IP desconhecido"}
                </p>
                <JsonBlock label="Antes" value={selected.old_values} />
                <JsonBlock label="Depois" value={selected.new_values} />
                {!selected.old_values && !selected.new_values && (
                  <p className="text-sm text-muted-foreground">Sem dados adicionais registrados.</p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
