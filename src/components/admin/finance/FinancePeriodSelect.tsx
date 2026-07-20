"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FINANCE_PERIOD_LABEL,
  FINANCE_PERIOD_OPTIONS,
  type FinancePeriodOption,
} from "@/utils/financePeriod";

interface FinancePeriodSelectProps {
  value: FinancePeriodOption;
  onChange: (value: FinancePeriodOption) => void;
}

export function FinancePeriodSelect({ value, onChange }: FinancePeriodSelectProps) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as FinancePeriodOption)}>
      <SelectTrigger className="w-40" size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {FINANCE_PERIOD_OPTIONS.map((option) => (
          <SelectItem key={option} value={option}>
            {FINANCE_PERIOD_LABEL[option]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
