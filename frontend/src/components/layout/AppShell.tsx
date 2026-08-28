"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

const PUBLIC_PATHS = ["/login", "/register"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isPublic = PUBLIC_PATHS.some((p) => pathname?.startsWith(p));
    if (!isPublic) {
      const session = localStorage.getItem("eco_session");
      if (!session) {
        router.replace("/login");
      }
    }
  }, [pathname, router]);

  const isPublicPage = PUBLIC_PATHS.some((p) => pathname?.startsWith(p));

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <div className="bg-[#080b11] text-slate-100 antialiased min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col pl-64">
        <Navbar />
        <main className="flex-1 p-6 mt-16 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
