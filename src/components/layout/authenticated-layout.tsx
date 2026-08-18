"use client";

import { AuthProvider } from "@/lib/auth/auth-context";
import AppShell from "@/components/layout/app-shell";

export function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
