import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
import dynamic from "next/dynamic";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Novaflow",
  description: "A modular AI-agent based assistant",
};

const DynamicCustomTitleBar = dynamic(
  () => import("@/components/ui/titlebar"),
  {
    ssr: false,
  }
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} overflow-hidden`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <DynamicCustomTitleBar title="NovaFlow" icon="./favicon.ico" />
          <div className="overflow-auto w-full h-full bg-base">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
