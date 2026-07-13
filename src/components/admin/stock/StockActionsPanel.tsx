"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { addStock, adjustStock, listMovements, removeStock } from "@/services/stock.service";
import type { StockAddInput, StockMovement } from "@/types/stock";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatDateTime } from "@/utils/date";
import { STOCK_MOVEMENT_TYPE_LABEL } from "@/utils/stockMovement";
import { cn } from "@/lib/utils";

type ActionTab = "add" | "remove" | "adjust";

interface StockActionsPanelProps {
  productId: number;
  stockQuantity: number;
  onStockChange: (newQuantity: number) => void;
}

export function StockActionsPanel({
  productId,
  stockQuantity,
  onStockChange,
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
        const data = await listMovements({ product_id: productId, limit: 10 });
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
  }, [productId]);

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
        movement = await addStock(productId, {
          quantity: Number(quantity),
          movement_type: movementType,
          reason: reason || undefined,
          reference: reference || undefined,
        });
      } else if (tab === "remove") {
        movement = await removeStock(productId, {
          quantity: Number(quantity),
          reason: reason || undefined,
          reference: reference || undefined,
        });
      } else {
        movement = await adjustStock(productId, {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estoque — {stockQuantity} unidades</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex gap-2">
          <TabButton active={tab === "add"} onClick={() => setTab("add")}>
            Adicionar
          </TabButton>
          <TabButton active={tab === "remove"} onClick={() => setTab("remove")}>
            Remover
          </TabButton>
          <TabButton active={tab === "adjust"} onClick={() => setTab("adjust")}>
            Ajustar
          </TabButton>
        </div>

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
              <select
                id="stock-type"
                value={movementType}
                onChange={(e) =>
                  setMovementType(e.target.value as StockAddInput["movement_type"])
                }
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
              >
                <option value="PURCHASE">Compra</option>
                <option value="RETURN">Devolução</option>
                <option value="INITIAL_LOAD">Carga inicial</option>
              </select>
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
      </CardContent>
    </Card>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
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
