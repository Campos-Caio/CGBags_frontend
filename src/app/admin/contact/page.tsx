"use client";

import { useState } from "react";

import { PageHeader } from "@/components/admin/layout/PageHeader";
import { FilterBar } from "@/components/admin/data/FilterBar";
import { TablePagination } from "@/components/admin/data/TablePagination";
import { ContactMessagesTable } from "@/components/admin/contact/ContactMessagesTable";
import { LoadingState } from "@/components/admin/feedback/LoadingState";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminList } from "@/hooks/useAdminList";
import { listContactMessagesAdmin } from "@/services/contact.service";
import type { ContactMessage, ContactMessageStatus } from "@/types/contact";
import { CONTACT_MESSAGE_STATUS_LABEL } from "@/utils/contactMessageStatus";

const STATUS_OPTIONS = Object.entries(CONTACT_MESSAGE_STATUS_LABEL) as [
  ContactMessageStatus,
  string,
][];

export default function AdminContactPage() {
  const [statusFilter, setStatusFilter] = useState<ContactMessageStatus | "">("");

  const {
    data: messages,
    setData: setMessages,
    isLoading,
    page,
    setPage,
    pageSize,
  } = useAdminList<ContactMessage>({
    fetchPage: ({ skip, limit }) =>
      listContactMessagesAdmin({
        message_status: statusFilter || undefined,
        skip,
        limit,
      }),
    deps: [statusFilter],
    errorMessage: "Não foi possível carregar as mensagens de contato.",
  });

  function clearFilters() {
    setPage(0);
    setStatusFilter("");
  }

  const hasActiveFilters = statusFilter !== "";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Mensagens de contato" />

      <FilterBar
        resultCount={messages.length}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      >
        <Select
          value={statusFilter || "all"}
          onValueChange={(value) => {
            setPage(0);
            setStatusFilter(value === "all" ? "" : (value as ContactMessageStatus));
          }}
        >
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {STATUS_OPTIONS.map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterBar>

      <Card>
        <CardContent>
          {isLoading ? (
            <LoadingState />
          ) : (
            <ContactMessagesTable
              messages={messages}
              onMessagesChange={setMessages}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
            />
          )}
        </CardContent>
      </Card>

      <TablePagination page={page} onPageChange={setPage} itemCount={messages.length} pageSize={pageSize} />
    </div>
  );
}
