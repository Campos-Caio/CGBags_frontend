import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";

import { AdminGuard } from "@/components/admin/layout/AdminGuard";
import { AdminShell } from "@/components/admin/layout/AdminShell";
import { AdminProviders } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Admin | CG Bags",
    template: "%s | Admin CG Bags",
  },
  description: "Painel administrativo da CG Bags.",
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <AdminProviders>
          <AdminGuard>
            <AdminShell>{children}</AdminShell>
          </AdminGuard>
        </AdminProviders>
      </body>
    </html>
  );
}
