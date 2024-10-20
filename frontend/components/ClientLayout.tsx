"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ThemeProvider defaultTheme="default" attribute="class">
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
