"use client";

import Link from "next/link";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { RowActionsMenu } from "@/components/admin/data/RowActionsMenu";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { deleteCouponAdmin } from "@/services/coupon.service";
import type { Coupon } from "@/types/coupon";
import { getApiErrorMessage } from "@/utils/apiError";
import { confirmToast } from "@/utils/confirmToast";
import { formatCouponValidity, formatCouponValue } from "@/utils/coupon";

interface CouponsTableProps {
  coupons: Coupon[];
  onCouponsChange: (coupons: Coupon[]) => void;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}

export function CouponsTable({
  coupons,
  onCouponsChange,
  hasActiveFilters = false,
  onClearFilters,
}: CouponsTableProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function handleDelete(coupon: Coupon) {
    confirmToast(`Excluir o cupom "${coupon.code}"?`, () => performDelete(coupon), {
      confirmLabel: "Excluir",
    });
  }

  async function performDelete(coupon: Coupon) {
    setDeletingId(coupon.id);
    try {
      await deleteCouponAdmin(coupon.id);
      onCouponsChange(coupons.filter((c) => c.id !== coupon.id));
      toast.success("Cupom excluído.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível excluir este cupom."));
    } finally {
      setDeletingId(null);
    }
  }

  if (coupons.length === 0) {
    return hasActiveFilters ? (
      <EmptyState
        message="Nenhum resultado para estes filtros."
        action={onClearFilters ? { label: "Limpar filtros", onClick: onClearFilters } : undefined}
      />
    ) : (
      <EmptyState
        message="Nenhum cupom encontrado."
        action={{ label: "Novo cupom", href: "/admin/coupons/new" }}
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Código</TableHead>
          <TableHead>Desconto</TableHead>
          <TableHead>Validade</TableHead>
          <TableHead>Usos</TableHead>
          <TableHead>Status</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {coupons.map((coupon) => (
          <TableRow key={coupon.id}>
            <TableCell className="font-medium text-foreground">{coupon.code}</TableCell>
            <TableCell className="font-medium text-foreground">
              {formatCouponValue(coupon.discount_type, coupon.value)}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatCouponValidity(coupon.starts_at, coupon.ends_at)}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {coupon.times_used}
              {coupon.max_uses !== null ? ` / ${coupon.max_uses}` : ""}
            </TableCell>
            <TableCell>
              <Badge variant={coupon.is_active ? "success" : "muted"}>
                {coupon.is_active ? "Ativo" : "Inativo"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-end gap-1.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" aria-label="Editar cupom" asChild>
                      <Link href={`/admin/coupons/${coupon.id}`}>
                        <Pencil className="size-3.5" aria-hidden />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Editar cupom</TooltipContent>
                </Tooltip>
                <RowActionsMenu
                  actions={[
                    {
                      label: "Excluir cupom",
                      icon: Trash2,
                      variant: "destructive",
                      disabled: deletingId === coupon.id,
                      onClick: () => handleDelete(coupon),
                    },
                  ]}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
