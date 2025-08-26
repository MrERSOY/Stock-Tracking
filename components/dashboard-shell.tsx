// components/dashboard-shell.tsx
"use client"; // Bu bileşen, state ve context'i yönettiği için bir Client Component.

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarProvider } from "@/components/ui/sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    // Provider, tüm layout'u sarmalayarak context'i sağlar.
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <SiteHeader />
          <main className="flex-1 p-4 md:p-6 lg:p-10">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
