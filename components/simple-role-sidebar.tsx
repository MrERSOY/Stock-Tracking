"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
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
  Box,
  Folder,
  UserCog,
  FileSpreadsheet,
  DollarSign,
} from "lucide-react";

// Geçici kullanıcı simülasyonu - gerçek auth çalışana kadar
const CURRENT_USER_ROLE: "ADMIN" | "STAFF" = "ADMIN"; // Bu değeri "ADMIN" veya "STAFF" yaparak test edebiliriz

// PERSONEL için menü öğeleri
const STAFF_MENU_ITEMS = [
  {
    id: "dashboard",
    title: "Ana Sayfa",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "pos",
    title: "Satış (POS)",
    href: "/dashboard/pos",
    icon: ShoppingCart,
  },
  {
    id: "inventory",
    title: "Stok Yönetimi",
    href: "/dashboard/inventory",
    icon: Package,
  },
  {
    id: "customers",
    title: "Müşteri Yönetimi",
    href: "/dashboard/customers",
    icon: Users,
  },
  {
    id: "orders",
    title: "Sipariş Yönetimi",
    href: "/dashboard/orders",
    icon: FileText,
  },
];

// ADMİN için tüm menü öğeleri
const ADMIN_MENU_ITEMS = [
  ...STAFF_MENU_ITEMS, // Personel menülerini dahil et
  {
    id: "products",
    title: "Ürün Yönetimi",
    href: "/dashboard/products",
    icon: Box,
  },
  {
    id: "categories",
    title: "Kategori Yönetimi",
    href: "/dashboard/categories",
    icon: Folder,
  },
  {
    id: "users",
    title: "Personel Yönetimi",
    href: "/dashboard/users",
    icon: UserCog,
  },
  {
    id: "analytics",
    title: "Analizler",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    id: "reports",
    title: "Raporlar",
    href: "/dashboard/reports",
    icon: FileSpreadsheet,
  },
  {
    id: "revenue",
    title: "Finansal",
    href: "/dashboard/revenue",
    icon: DollarSign,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Kullanıcı rolüne göre menü öğelerini belirle
  const menuItems =
    CURRENT_USER_ROLE === "ADMIN" ? ADMIN_MENU_ITEMS : STAFF_MENU_ITEMS;

  console.log(`🔍 Kullanıcı Rolü: ${CURRENT_USER_ROLE}`);
  console.log(`📋 Gösterilen Menü Sayısı: ${menuItems.length}`);

  const renderLink = (item: any) => {
    const isActive =
      pathname === item.href ||
      (item.href !== "/dashboard" && pathname.startsWith(item.href));

    const IconComponent = item.icon;

    return (
      <Link
        key={item.id}
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-gray-800 text-white"
            : "text-gray-300 hover:bg-gray-800 hover:text-white"
        )}
      >
        <IconComponent className="h-4 w-4" />
        {!isCollapsed && <span>{item.title}</span>}
      </Link>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        {!isCollapsed ? (
          <div>
            <h2 className="text-lg font-semibold">İşletme Yönetimi</h2>
            <div className="mt-1 text-xs text-gray-400">
              {CURRENT_USER_ROLE === "ADMIN" ? "👑 Yönetici" : "👤 Personel"} (
              {menuItems.length} menü)
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <LayoutDashboard className="h-6 w-6" />
          </div>
        )}
      </div>

      {/* Ana Menü */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {menuItems.map((item) => renderLink(item))}
        </div>
      </div>

      {/* Footer - Rol Bilgisi */}
      <div className="p-4 border-t border-gray-800">
        {!isCollapsed ? (
          <div className="text-xs text-gray-400">
            <div>
              Aktif Rol: <span className="text-white">{CURRENT_USER_ROLE}</span>
            </div>
            <div>Menü: {menuItems.length} öğe</div>
          </div>
        ) : (
          <div className="flex justify-center">
            <User className="h-4 w-4 text-gray-400" />
          </div>
        )}
      </div>
    </div>
  );
}
