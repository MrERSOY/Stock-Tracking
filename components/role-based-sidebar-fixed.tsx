"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Home,
  Box,
  Folder,
  UserCog,
  FileSpreadsheet,
  DollarSign,
} from "lucide-react";

const iconMap = {
  Home: Home,
  dashboard: LayoutDashboard,
  inventory: Package,
  customers: Users,
  orders: ShoppingCart,
  products: Box,
  categories: Folder,
  users: UserCog,
  analytics: BarChart3,
  reports: FileSpreadsheet,
  revenue: DollarSign,
  settings: Settings,
  ShoppingCart: ShoppingCart,
  Package: Package,
  Box: Box,
  Users: Users,
  FileText: FileText,
  Folder: Folder,
  UserCog: UserCog,
  BarChart3: BarChart3,
  FileSpreadsheet: FileSpreadsheet,
  DollarSign: DollarSign,
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();

  // Debug için
  console.log("🔍 Sidebar Debug:", { user, isLoading });

  // Test için geçici kullanıcı - gerçek auth çalışmadığında
  const effectiveUser = user || {
    id: "test-staff",
    name: "Test Personel",
    email: "staff@test.com",
    role: "STAFF" as const,
  };

  console.log("👤 Effective User:", effectiveUser);

  const accessibleMenuItems = getAccessibleMenuItems(effectiveUser.role);
  console.log("📋 Accessible Menu Items:", accessibleMenuItems);

  if (isLoading) {
    return (
      <Sidebar {...props}>
        <SidebarHeader>
          <div className="flex items-center space-x-2">
            <LayoutDashboard className="h-6 w-6" />
            <span className="font-semibold">İşletme Yüklenyor...</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="p-4">Yükleniyor...</div>
        </SidebarContent>
      </Sidebar>
    );
  }

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
        {effectiveUser && (
          <div className="mt-2 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium">{effectiveUser.name}</span>
              <span className="text-xs text-muted-foreground">
                {effectiveUser.email}
              </span>
            </div>
            <Badge
              className={
                ROLE_COLORS[effectiveUser.role as keyof typeof ROLE_COLORS]
              }
            >
              {ROLE_LABELS[effectiveUser.role as keyof typeof ROLE_LABELS]}
            </Badge>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {/* Ana Menü */}
        <SidebarGroup>
          <SidebarGroupLabel>
            Yönetim ({mainMenuItems.length} öğe)
          </SidebarGroupLabel>
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
            <SidebarGroupLabel>
              Raporlar ({reportMenuItems.length} öğe)
            </SidebarGroupLabel>
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

        {/* Debug Bilgisi */}
        <SidebarGroup>
          <SidebarGroupLabel>Debug Info</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="p-2 text-xs text-muted-foreground">
              <div>Rol: {effectiveUser.role}</div>
              <div>Toplam Menü: {accessibleMenuItems.length}</div>
              <div>
                Ana: {mainMenuItems.length}, Rapor: {reportMenuItems.length}
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
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
