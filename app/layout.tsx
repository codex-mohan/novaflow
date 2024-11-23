import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
import dynamic from "next/dynamic";
import "./globals.css";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Toaster } from "@/components/ui/toaster";

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
  () => import("@/components/ui/TitleBar"),
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
          <AuthGuard>
            <div className="flex flex-col h-full w-full">
              {/* Title Bar (Fixed Height) */}
              <DynamicCustomTitleBar title="NovaFlow" icon="./favicon.ico" />
              {/* Calculate Available Height After Title Bar */}
              <section
                className="flex w-full bg-base text-font"
                style={{ height: "calc(100vh - 2.5rem)" }} // 2.5rem is equivalent to h-10
              >
                {children}
              </section>
            </div>
            <Toaster />
          </AuthGuard>
        </ThemeProvider>
      </body>
    </html>
  );
}
