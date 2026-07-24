import type { ReactNode } from "react";

interface StockFormFieldProps {
  label: string;
  htmlFor: string;
  children: ReactNode;
}

export function StockFormField({ label, htmlFor, children }: StockFormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
