"use client";

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { StockAddFields } from "@/components/admin/stock/StockAddFields";
import { StockFormField as Field } from "@/components/admin/stock/StockFormField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addStock, adjustStock, listMovements, removeStock } from "@/services/stock.service";
import type { StockAddInput, StockMovement } from "@/types/stock";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatDateTime } from "@/utils/date";
import { STOCK_MOVEMENT_TYPE_LABEL } from "@/utils/stockMovement";

type ActionTab = "add" | "remove" | "adjust";

export interface StockAddSubmission {
  quantity: number;
  movementType: StockAddInput["movement_type"];
  reason?: string;
  reference?: string;
}

type StockActionsPanelProps =
  | {
      /** Uma variante especifica — estoque atual, historico de
       * movimentacoes e as 3 abas (Adicionar/Remover/Ajustar). */
      mode: "single";
      variantId: number;
      stockQuantity: number;
      onStockChange: (newQuantity: number) => void;
      bare?: boolean;
    }
  | {
      /** Varias variantes selecionadas de uma vez: nao ha um unico
       * estoque atual nem historico pra mostrar, entao so' a aba
       * Adicionar existe (Remover/Ajustar em massa continuam fora de
       * escopo — ver bulk_add_stock no backend). O submit e' delegado
       * pro chamador, que decide como aplicar a N variantes. */
      mode: "bulk";
      bulkSubmit: (submission: StockAddSubmission) => Promise<void>;
      bare?: boolean;
    };

export function StockActionsPanel(props: StockActionsPanelProps) {
  const { bare = false } = props;
  const singleVariantId = props.mode === "single" ? props.variantId : null;

  const [tab, setTab] = useState<ActionTab>("add");
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const [quantity, setQuantity] = useState("");
  const [movementType, setMovementType] = useState<StockAddInput["movement_type"]>("PURCHASE");
  const [newQuantity, setNewQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [reference, setReference] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (singleVariantId === null) return;
    let cancelled = false;

    async function loadHistory() {
      await Promise.resolve();
      if (cancelled) return;
      try {
        const data = await listMovements({ variant_id: singleVariantId!, limit: 10 });
        if (!cancelled) setMovements(data);
      } catch (error) {
        if (!cancelled) {
          toast.error(getApiErrorMessage(error, "Não foi possível carregar o histórico."));
        }
      } finally {
        if (!cancelled) setIsLoadingHistory(false);
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [singleVariantId]);

  function resetForm() {
    setQuantity("");
    setNewQuantity("");
    setReason("");
    setReference("");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);

    try {
      if (props.mode === "bulk") {
        await props.bulkSubmit({
          quantity: Number(quantity),
          movementType,
          reason: reason || undefined,
          reference: reference || undefined,
        });
        resetForm();
        return;
      }

      let movement: StockMovement;

      if (tab === "add") {
        movement = await addStock(props.variantId, {
          quantity: Number(quantity),
          movement_type: movementType,
          reason: reason || undefined,
          reference: reference || undefined,
        });
      } else if (tab === "remove") {
        movement = await removeStock(props.variantId, {
          quantity: Number(quantity),
          reason: reason || undefined,
          reference: reference || undefined,
        });
      } else {
        movement = await adjustStock(props.variantId, {
          new_quantity: Number(newQuantity),
          reason: reason || undefined,
          reference: reference || undefined,
        });
      }

      setMovements((prev) => [movement, ...prev].slice(0, 10));
      props.onStockChange(movement.quantity_after);
      resetForm();
      toast.success("Movimentação registrada.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível registrar esta movimentação."));
    } finally {
      setIsSaving(false);
    }
  }

  const content = (
    <div className="flex flex-col gap-4">
        {props.mode === "single" && (
          <Tabs value={tab} onValueChange={(value) => setTab(value as ActionTab)}>
            <TabsList>
              <TabsTrigger value="add">Adicionar</TabsTrigger>
              <TabsTrigger value="remove">Remover</TabsTrigger>
              <TabsTrigger value="adjust">Ajustar</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {props.mode === "bulk" || tab === "add" ? (
            <StockAddFields
              idPrefix={props.mode === "bulk" ? "bulk-stock" : "stock"}
              quantity={quantity}
              onQuantityChange={setQuantity}
              movementType={movementType}
              onMovementTypeChange={setMovementType}
              reason={reason}
              onReasonChange={setReason}
              reference={reference}
              onReferenceChange={setReference}
            />
          ) : (
            <>
              {tab === "adjust" ? (
                <Field label="Nova quantidade" htmlFor="stock-new-quantity">
                  <Input
                    id="stock-new-quantity"
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                  />
                </Field>
              ) : (
                <Field label="Quantidade" htmlFor="stock-quantity">
                  <Input
                    id="stock-quantity"
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </Field>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Field label="Motivo (opcional)" htmlFor="stock-reason">
                  <Input
                    id="stock-reason"
                    maxLength={255}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </Field>
                <Field label="Referência (opcional)" htmlFor="stock-reference">
                  <Input
                    id="stock-reference"
                    maxLength={100}
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                  />
                </Field>
              </div>
            </>
          )}

          <div>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Salvando..." : "Confirmar"}
            </Button>
          </div>
        </form>

        {props.mode === "single" && (
          <div className="border-t border-border pt-4">
            <h3 className="mb-3 text-sm font-medium text-foreground">Últimas movimentações</h3>
            {isLoadingHistory ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : movements.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma movimentação registrada.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {movements.map((m) => {
                  const delta = m.quantity_after - m.quantity_before;
                  return (
                    <li key={m.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-muted-foreground">
                        {formatDateTime(m.created_at)} — {STOCK_MOVEMENT_TYPE_LABEL[m.movement_type]}
                      </span>
                      <span className="font-medium text-foreground">
                        {delta >= 0 ? "+" : ""}
                        {delta} ({m.quantity_before} → {m.quantity_after})
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
    </div>
  );

  if (bare) return content;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {props.mode === "single" ? `Estoque — ${props.stockQuantity} unidades` : "Adicionar estoque em massa"}
        </CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
