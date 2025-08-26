"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import {
  getAccessibleMenuItems,
  ROLE_LABELS,
  ROLE_COLORS,
} from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  FileText,
  BarChart3,
  Settings,
  TrendingUp,
  ClipboardList,
  User,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const iconMap = {
  dashboard: LayoutDashboard,
  inventory: Package,
  customers: Users,
  orders: ShoppingCart,
  products: Package,
  categories: ClipboardList,
  users: User,
  analytics: BarChart3,
  reports: FileText,
  revenue: TrendingUp,
  settings: Settings,
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();

  // Debug için
  console.log("Sidebar User:", user);
  console.log("Sidebar IsLoading:", isLoading);

  // Geçici test - STAFF rolü simülasyonu
  const testUser = user || {
    id: "test",
    name: "Test Personel",
    email: "test@test.com",
    role: "STAFF" as const,
  };

  if (isLoading) {
    return (
      <Sidebar {...props}>
        <SidebarHeader>
          <div className="flex items-center space-x-2">
            <LayoutDashboard className="h-6 w-6" />
            <span className="font-semibold">İşletme</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="p-4">Yükleniyor...</div>
        </SidebarContent>
      </Sidebar>
    );
  }

  const accessibleMenuItems = getAccessibleMenuItems(user?.role || null);

  // Ana menü ve raporlar menüsünü ayır
  const mainMenuItems = accessibleMenuItems.filter(
    (item) => !["analytics", "reports", "revenue"].includes(item.id)
  );
  const reportMenuItems = accessibleMenuItems.filter((item) =>
    ["analytics", "reports", "revenue"].includes(item.id)
  );

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center space-x-2">
          <LayoutDashboard className="h-6 w-6" />
          <span className="font-semibold">İşletme Yönetimi</span>
        </div>
        {user && (
          <div className="mt-2 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user.name}</span>
              <span className="text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
            <Badge
              className={ROLE_COLORS[user.role as keyof typeof ROLE_COLORS]}
            >
              {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS]}
            </Badge>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {/* Ana Menü */}
        <SidebarGroup>
          <SidebarGroupLabel>Yönetim</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => {
                const IconComponent =
                  iconMap[item.icon as keyof typeof iconMap] || LayoutDashboard;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(item.href));

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      asChild
                      className={isActive ? "bg-sidebar-accent" : ""}
                    >
                      <Link href={item.href}>
                        <IconComponent className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Raporlar Menüsü (varsa) */}
        {reportMenuItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Raporlar</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {reportMenuItems.map((item) => {
                  const IconComponent =
                    iconMap[item.icon as keyof typeof iconMap] || BarChart3;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" &&
                      pathname.startsWith(item.href));

                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        className={isActive ? "bg-sidebar-accent" : ""}
                      >
                        <Link href={item.href}>
                          <IconComponent className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => logout()}>
              <LogOut className="h-4 w-4" />
              <span>Çıkış Yap</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
