"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addStock, adjustStock, listMovements, removeStock } from "@/services/stock.service";
import type { StockAddInput, StockMovement } from "@/types/stock";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatDateTime } from "@/utils/date";
import { STOCK_MOVEMENT_TYPE_LABEL } from "@/utils/stockMovement";

type ActionTab = "add" | "remove" | "adjust";

interface StockActionsPanelProps {
  variantId: number;
  stockQuantity: number;
  onStockChange: (newQuantity: number) => void;
  /** Sem o Card/titulo em volta — usado dentro de um Dialog, que ja tem sua propria moldura. */
  bare?: boolean;
}

export function StockActionsPanel({
  variantId,
  stockQuantity,
  onStockChange,
  bare = false,
}: StockActionsPanelProps) {
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
    let cancelled = false;

    async function loadHistory() {
      await Promise.resolve();
      if (cancelled) return;
      try {
        const data = await listMovements({ variant_id: variantId, limit: 10 });
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
  }, [variantId]);

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
      let movement: StockMovement;

      if (tab === "add") {
        movement = await addStock(variantId, {
          quantity: Number(quantity),
          movement_type: movementType,
          reason: reason || undefined,
          reference: reference || undefined,
        });
      } else if (tab === "remove") {
        movement = await removeStock(variantId, {
          quantity: Number(quantity),
          reason: reason || undefined,
          reference: reference || undefined,
        });
      } else {
        movement = await adjustStock(variantId, {
          new_quantity: Number(newQuantity),
          reason: reason || undefined,
          reference: reference || undefined,
        });
      }

      setMovements((prev) => [movement, ...prev].slice(0, 10));
      onStockChange(movement.quantity_after);
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
        <Tabs value={tab} onValueChange={(value) => setTab(value as ActionTab)}>
          <TabsList>
            <TabsTrigger value="add">Adicionar</TabsTrigger>
            <TabsTrigger value="remove">Remover</TabsTrigger>
            <TabsTrigger value="adjust">Ajustar</TabsTrigger>
          </TabsList>
        </Tabs>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

          {tab === "add" && (
            <Field label="Tipo" htmlFor="stock-type">
              <Select
                value={movementType}
                onValueChange={(value) =>
                  setMovementType(value as StockAddInput["movement_type"])
                }
              >
                <SelectTrigger id="stock-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PURCHASE">Compra</SelectItem>
                  <SelectItem value="RETURN">Devolução</SelectItem>
                  <SelectItem value="INITIAL_LOAD">Carga inicial</SelectItem>
                </SelectContent>
              </Select>
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

          <div>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Salvando..." : "Confirmar"}
            </Button>
          </div>
        </form>

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
    </div>
  );

  if (bare) return content;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estoque — {stockQuantity} unidades</CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
