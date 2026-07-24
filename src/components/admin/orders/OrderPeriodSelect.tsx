"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ORDER_PERIOD_LABEL,
  ORDER_PERIOD_OPTIONS,
  type OrderPeriodOption,
} from "@/utils/orderPeriod";

interface OrderPeriodSelectProps {
  value: OrderPeriodOption;
  onChange: (value: OrderPeriodOption) => void;
}

export function OrderPeriodSelect({ value, onChange }: OrderPeriodSelectProps) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as OrderPeriodOption)}>
      <SelectTrigger className="w-44" size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ORDER_PERIOD_OPTIONS.map((option) => (
          <SelectItem key={option} value={option}>
            {ORDER_PERIOD_LABEL[option]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
