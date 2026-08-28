import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "EcoGenius — AI Sustainability Command Center",
  description: "Enterprise Multi-Agent AI Sustainability Operations Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#080b11] text-slate-100 antialiased min-h-screen">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
