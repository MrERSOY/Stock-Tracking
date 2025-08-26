// components/app-sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth-context";
import {
  getAccessibleMenuItems,
  ROLE_LABELS,
  ROLE_COLORS,
} from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  Boxes,
  BarChart3,
  FolderKanban,
  Users2,
  FileText,
  ShoppingCart,
  ClipboardList,
  TrendingUp,
  Package,
  UserCog,
  FileSpreadsheet,
  DollarSign,
  Folder,
  Users,
  Home,
  Box,
} from "lucide-react";

// Icon mapping
const iconMap = {
  Home: LayoutDashboard,
  ShoppingCart,
  Package: Boxes,
  Box: FolderKanban,
  Users: Users2,
  FileText,
  Folder: ClipboardList,
  UserCog: Users2,
  BarChart3,
  FileSpreadsheet: FileText,
  DollarSign: TrendingUp,
};

export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { user } = useAuth();
  const isCollapsed = state === "collapsed";

  // Kullanıcının erişebileceği menü öğelerini al
  const accessibleMenuItems = getAccessibleMenuItems(user?.role || null);

  // Ana menü ve ikincil menü ayır
  const mainMenuItems = accessibleMenuItems.filter(
    (item) => !["analytics", "reports", "revenue"].includes(item.id)
  );
  const secondaryMenuItems = accessibleMenuItems.filter((item) =>
    ["analytics", "reports", "revenue"].includes(item.id)
  );

  // Linkleri render eden fonksiyon
  const renderLink = (item: any) => {
    const isActive =
      pathname === item.href ||
      (item.href !== "/dashboard" && pathname.startsWith(item.href));

    // Icon component'ini al
    const IconComponent =
      iconMap[item.icon as keyof typeof iconMap] || LayoutDashboard;

    const linkContent = (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-800",
          { "bg-gray-800 text-white": isActive },
          isCollapsed && "justify-center"
        )}
      >
        <IconComponent className="h-4 w-4" />
        {!isCollapsed && (
          <div className="flex-1">
            <span className="text-sm font-medium">{item.label}</span>
          </div>
        )}
      </Link>
    );

    if (isCollapsed) {
      return (
        <TooltipProvider key={item.id}>
          <Tooltip>
            <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
            <TooltipContent side="right">
              <div>
                <p className="font-medium">{item.label}</p>
                {item.description && (
                  <p className="text-xs text-gray-500">{item.description}</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return <div key={item.id}>{linkContent}</div>;
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        {!isCollapsed ? (
          <div>
            <h2 className="text-lg font-semibold">İşletme Yönetimi</h2>
            {user && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-gray-300">{user.name}</span>
                <Badge className={ROLE_COLORS[user.role]}>
                  {ROLE_LABELS[user.role]}
                </Badge>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center">
            <LayoutDashboard className="h-6 w-6" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {/* Ana Menü */}
        <div className="space-y-1">{mainMenuItems.map(renderLink)}</div>

        {/* Ayırıcı ve İkincil Menü */}
        {secondaryMenuItems.length > 0 && (
          <>
            <div className="border-t border-gray-800 my-4"></div>
            <div className="space-y-1">
              {!isCollapsed && (
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 mb-2">
                  Raporlar & Analiz
                </p>
              )}
              {secondaryMenuItems.map(renderLink)}
            </div>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        {!isCollapsed ? (
          <div className="text-xs text-gray-500">
            <p>© 2025 İşletme Yönetim Sistemi</p>
            <p>Sürüm 1.0</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
}
