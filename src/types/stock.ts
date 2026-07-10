export type StockMovementType = "PURCHASE" | "SALE" | "ADJUSTMENT" | "RETURN" | "INITIAL_LOAD";

export interface StockMovement {
  id: number;
  product_id: number;
  product_name: string;
  sku: string;
  movement_type: StockMovementType;
  quantity: number;
  quantity_before: number;
  quantity_after: number;
  reason: string | null;
  reference: string | null;
  created_by: number;
  created_by_email: string;
  created_at: string;
}

export interface StockAddInput {
  quantity: number;
  movement_type: "PURCHASE" | "RETURN" | "INITIAL_LOAD";
  reason?: string;
  reference?: string;
}

export interface StockRemoveInput {
  quantity: number;
  reason?: string;
  reference?: string;
}

export interface StockAdjustInput {
  new_quantity: number;
  reason?: string;
  reference?: string;
}
