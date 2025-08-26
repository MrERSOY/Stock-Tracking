// components/dashboard-client-layout.tsx
"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarProvider } from "@/components/ui/sidebar";

export function DashboardClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Provider, tüm layout'u sarmalar.
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
