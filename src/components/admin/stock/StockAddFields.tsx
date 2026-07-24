"use client";

import { StockFormField } from "@/components/admin/stock/StockFormField";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { StockAddInput } from "@/types/stock";

interface StockAddFieldsProps {
  /** Prefixo pros ids/htmlFor dos campos — evita colisao quando o mesmo
   * formulario aparece em mais de um lugar na pagina (ex.: modal individual
   * vs. modal de acao em massa). */
  idPrefix: string;
  quantity: string;
  onQuantityChange: (value: string) => void;
  movementType: StockAddInput["movement_type"];
  onMovementTypeChange: (value: StockAddInput["movement_type"]) => void;
  reason: string;
  onReasonChange: (value: string) => void;
  reference: string;
  onReferenceChange: (value: string) => void;
}

/** Campos de entrada de estoque (quantidade, tipo, motivo, referencia) —
 * compartilhados entre o modal individual (StockActionsPanel, aba
 * "Adicionar") e o modal de entrada em massa (BulkActionsBar), pra manter
 * os dois com a mesma cara. */
export function StockAddFields({
  idPrefix,
  quantity,
  onQuantityChange,
  movementType,
  onMovementTypeChange,
  reason,
  onReasonChange,
  reference,
  onReferenceChange,
}: StockAddFieldsProps) {
  return (
    <>
      <StockFormField label="Quantidade" htmlFor={`${idPrefix}-quantity`}>
        <Input
          id={`${idPrefix}-quantity`}
          type="number"
          min="1"
          step="1"
          required
          value={quantity}
          onChange={(e) => onQuantityChange(e.target.value)}
        />
      </StockFormField>

      <StockFormField label="Tipo" htmlFor={`${idPrefix}-type`}>
        <Select
          value={movementType}
          onValueChange={(value) => onMovementTypeChange(value as StockAddInput["movement_type"])}
        >
          <SelectTrigger id={`${idPrefix}-type`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PURCHASE">Compra</SelectItem>
            <SelectItem value="RETURN">Devolução</SelectItem>
            <SelectItem value="INITIAL_LOAD">Carga inicial</SelectItem>
          </SelectContent>
        </Select>
      </StockFormField>

      <div className="grid grid-cols-2 gap-4">
        <StockFormField label="Motivo (opcional)" htmlFor={`${idPrefix}-reason`}>
          <Input
            id={`${idPrefix}-reason`}
            maxLength={255}
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
          />
        </StockFormField>
        <StockFormField label="Referência (opcional)" htmlFor={`${idPrefix}-reference`}>
          <Input
            id={`${idPrefix}-reference`}
            maxLength={100}
            value={reference}
            onChange={(e) => onReferenceChange(e.target.value)}
          />
        </StockFormField>
      </div>
    </>
  );
}
