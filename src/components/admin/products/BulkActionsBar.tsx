"use client";

import { useState } from "react";
import { toast } from "sonner";

import { StockActionsPanel, type StockAddSubmission } from "@/components/admin/stock/StockActionsPanel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  bulkAddProductStock,
  bulkAdjustProductPrice,
  bulkSetProductStatus,
} from "@/services/product.service";
import { getApiErrorMessage } from "@/utils/apiError";
import { confirmToast } from "@/utils/confirmToast";

interface BulkActionsBarProps {
  selectedIds: number[];
  onClearSelection: () => void;
  /** Chamado apos qualquer acao em massa concluir com sucesso, pra recarregar a lista. */
  onDone: () => void;
}

export function BulkActionsBar({ selectedIds, onClearSelection, onDone }: BulkActionsBarProps) {
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [percent, setPercent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const count = selectedIds.length;
  if (count === 0) return null;

  function handleActivate() {
    confirmToast(`Ativar ${count} variante(s) selecionada(s)?`, () => runStatus(true), {
      confirmLabel: "Ativar",
    });
  }

  function handleDeactivate() {
    confirmToast(`Desativar ${count} variante(s) selecionada(s)?`, () => runStatus(false), {
      confirmLabel: "Desativar",
    });
  }

  async function runStatus(isActive: boolean) {
    setIsSubmitting(true);
    try {
      await bulkSetProductStatus(selectedIds, isActive);
      toast.success(`${count} variante(s) atualizada(s).`);
      onClearSelection();
      onDone();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível atualizar os produtos."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmitPrice() {
    const value = Number(percent);
    if (Number.isNaN(value) || value === 0) {
      toast.error("Informe um percentual válido (ex.: 10 ou -5).");
      return;
    }
    setIsSubmitting(true);
    try {
      await bulkAdjustProductPrice(selectedIds, value);
      toast.success(`Preço ajustado em ${count} variante(s).`);
      setPercent("");
      setIsPriceDialogOpen(false);
      onClearSelection();
      onDone();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível ajustar os preços."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleBulkStockSubmit(submission: StockAddSubmission) {
    await bulkAddProductStock(
      selectedIds,
      submission.quantity,
      submission.movementType,
      submission.reason,
      submission.reference
    );
    toast.success(`Estoque adicionado em ${count} variante(s).`);
    setIsStockDialogOpen(false);
    onClearSelection();
    onDone();
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
      <span className="text-sm font-medium text-foreground">
        {count} selecionado{count === 1 ? "" : "s"}
      </span>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" disabled={isSubmitting} onClick={handleActivate}>
          Ativar
        </Button>
        <Button variant="outline" size="sm" disabled={isSubmitting} onClick={handleDeactivate}>
          Desativar
        </Button>
        <Button variant="outline" size="sm" disabled={isSubmitting} onClick={() => setIsPriceDialogOpen(true)}>
          Ajustar preço
        </Button>
        <Button variant="outline" size="sm" disabled={isSubmitting} onClick={() => setIsStockDialogOpen(true)}>
          Adicionar estoque
        </Button>
      </div>
      <Button variant="ghost" size="sm" className="ml-auto" onClick={onClearSelection}>
        Limpar seleção
      </Button>

      <Dialog open={isPriceDialogOpen} onOpenChange={setIsPriceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajustar preço em massa</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Reajusta o preço das {count} variante(s) selecionada(s) que forem vendáveis.
              Use um valor positivo para aumentar e negativo para reduzir.
            </p>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="bulk-percent" className="text-sm font-medium text-foreground">
                Percentual (%)
              </label>
              <Input
                id="bulk-percent"
                type="number"
                step="0.01"
                placeholder="Ex.: 10 ou -5"
                value={percent}
                onChange={(e) => setPercent(e.target.value)}
              />
            </div>
            <Button disabled={isSubmitting} onClick={handleSubmitPrice} className="self-end">
              {isSubmitting ? "Aplicando..." : "Aplicar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar estoque em massa</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Soma a quantidade informada ao estoque das {count} variante(s) selecionada(s) (as
              personalizadas são ignoradas). Apenas entrada — para remover estoque, use a tela de
              Estoque.
            </p>
            <StockActionsPanel mode="bulk" bulkSubmit={handleBulkStockSubmit} bare />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
