"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Toaster } from "@/components/ui/toaster";
import { SurrealProvider } from "@/lib/surrealProvider";
import React from "react";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <AuthGuard>
          <SurrealProvider
            endpoint={"http://127.0.0.1:8877"}
            params={{ namespace: "novaflow", database: "main" }}
            autoConnect
          >
            {children}
          </SurrealProvider>
          <Toaster />
        </AuthGuard>
      </ThemeProvider>
    </QueryClientProvider>
  );
}