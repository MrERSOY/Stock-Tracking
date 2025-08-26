import { UserRole } from "./auth-context";

// Sayfa yetkileri tanımları
export const PAGE_PERMISSIONS = {
  // Herkes erişebilir
  DASHBOARD: ["ADMIN", "STAFF", "CUSTOMER"] as UserRole[],

  // Yönetici ve personel
  POS: ["ADMIN", "STAFF"] as UserRole[],
  INVENTORY: ["ADMIN", "STAFF"] as UserRole[],
  PRODUCTS_VIEW: ["ADMIN", "STAFF"] as UserRole[],
  CUSTOMERS: ["ADMIN", "STAFF"] as UserRole[],
  ORDERS: ["ADMIN", "STAFF"] as UserRole[],

  // Sadece yönetici
  PRODUCTS_MANAGE: ["ADMIN"] as UserRole[],
  USERS: ["ADMIN"] as UserRole[],
  ANALYTICS: ["ADMIN"] as UserRole[],
  REPORTS: ["ADMIN"] as UserRole[],
  REVENUE: ["ADMIN"] as UserRole[],
  CATEGORIES: ["ADMIN"] as UserRole[],
  SETTINGS: ["ADMIN"] as UserRole[],
} as const;

// Sayfa yetki kontrolü
export function hasPageAccess(
  userRole: UserRole | null,
  page: keyof typeof PAGE_PERMISSIONS
): boolean {
  if (!userRole) return false;
  return PAGE_PERMISSIONS[page].includes(userRole);
}

// Rol etiketleri
export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Yönetici",
  STAFF: "Personel",
  CUSTOMER: "Müşteri",
};

// Rol renkleri
export const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: "bg-red-100 text-red-800",
  STAFF: "bg-blue-100 text-blue-800",
  CUSTOMER: "bg-green-100 text-green-800",
};

// Menü öğeleri tanımları
export interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  permission: keyof typeof PAGE_PERMISSIONS;
  description?: string;
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "dashboard",
    label: "Ana Sayfa",
    href: "/dashboard",
    icon: "Home",
    permission: "DASHBOARD",
    description: "Genel özet ve istatistikler",
  },
  {
    id: "pos",
    label: "Satış (POS)",
    href: "/dashboard/pos",
    icon: "ShoppingCart",
    permission: "POS",
    description: "Satış işlemleri",
  },
  {
    id: "inventory",
    label: "Stok Yönetimi",
    href: "/dashboard/inventory",
    icon: "Package",
    permission: "INVENTORY",
    description: "Stok takibi ve düzenleme",
  },
  {
    id: "products",
    label: "Ürün Yönetimi",
    href: "/dashboard/products",
    icon: "Box",
    permission: "PRODUCTS_MANAGE",
    description: "Ürün ekleme, düzenleme, silme",
  },
  {
    id: "customers",
    label: "Müşteri Yönetimi",
    href: "/dashboard/customers",
    icon: "Users",
    permission: "CUSTOMERS",
    description: "Müşteri bilgileri",
  },
  {
    id: "orders",
    label: "Sipariş Yönetimi",
    href: "/dashboard/orders",
    icon: "FileText",
    permission: "ORDERS",
    description: "Sipariş takibi",
  },
  {
    id: "categories",
    label: "Kategori Yönetimi",
    href: "/dashboard/categories",
    icon: "Folder",
    permission: "CATEGORIES",
    description: "Ürün kategorileri",
  },
  {
    id: "users",
    label: "Personel Yönetimi",
    href: "/dashboard/users",
    icon: "UserCog",
    permission: "USERS",
    description: "Personel ve yetki yönetimi",
  },
  {
    id: "analytics",
    label: "Analizler",
    href: "/dashboard/analytics",
    icon: "BarChart3",
    permission: "ANALYTICS",
    description: "Satış analizleri ve grafikler",
  },
  {
    id: "reports",
    label: "Raporlar",
    href: "/dashboard/reports",
    icon: "FileSpreadsheet",
    permission: "REPORTS",
    description: "Detaylı raporlar",
  },
  {
    id: "revenue",
    label: "Finansal",
    href: "/dashboard/revenue",
    icon: "DollarSign",
    permission: "REVENUE",
    description: "Gelir ve gider takibi",
  },
];

// Kullanıcının erişebileceği menü öğelerini filtrele
export function getAccessibleMenuItems(userRole: UserRole | null): MenuItem[] {
  if (!userRole) return [];

  return MENU_ITEMS.filter((item) => hasPageAccess(userRole, item.permission));
}
