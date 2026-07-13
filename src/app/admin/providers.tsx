"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";

import { AuthProvider } from "@/context/AuthContext";

export function AdminProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster richColors position="top-center" />
    </AuthProvider>
  );
}
