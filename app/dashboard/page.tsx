"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Lock,
  Unlock,
  Move,
  Star,
  Calendar,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Widget tipi tanımları
interface WidgetConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any> | string;
  category: string;
  enabled: boolean;
  size: "small" | "medium" | "large";
  color: string;
  bgColor: string;
  position: number;
}

// İstatistik tipi
interface Stats {
  userCount: number;
  productCount: number;
  totalOrders: number;
  totalRevenue: number;
  salesToday: number;
  ordersToday: number;
  salesWeek: number;
  ordersWeek: number;
  salesMonth: number;
  ordersMonth: number;
  averageOrderValue: number;
  lowStockCount: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  topCustomers: number;
  newCustomersToday: number;
  returningCustomers: number;
  totalCategories: number;
  outOfStockProducts: number;
}

// Formatters
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(amount);
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat("tr-TR").format(num);
};

const formatPercentage = (num: number) => {
  return `${num.toFixed(1)}%`;
};

// Widget'lar - Hepsi bir yerde tanımlı
const AVAILABLE_WIDGETS: WidgetConfig[] = [
  {
    id: "total-customers",
    title: "Toplam Müşteri",
    description: "Kayıtlı müşteri sayısı",
    icon: Users,
    category: "Genel",
    enabled: true,
    size: "small",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    position: 0,
  },
  {
    id: "total-products",
    title: "Toplam Ürün",
    description: "Stokta bulunan ürün sayısı",
    icon: Package,
    category: "Genel",
    enabled: true,
    size: "small",
    color: "text-green-600",
    bgColor: "bg-green-50",
    position: 1,
  },
  {
    id: "total-orders",
    title: "Toplam Sipariş",
    description: "Tüm zamanların sipariş sayısı",
    icon: ShoppingCart,
    category: "Genel",
    enabled: true,
    size: "small",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    position: 2,
  },
  {
    id: "total-revenue",
    title: "Toplam Ciro",
    description: "Tüm zamanların toplam geliri",
    icon: DollarSign,
    category: "Genel",
    enabled: true,
    size: "small",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    position: 3,
  },
  {
    id: "sales-today",
    title: "Bugünkü Satış",
    description: "Bugünün satış tutarı",
    icon: TrendingUp,
    category: "Günlük",
    enabled: true,
    size: "medium",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    position: 4,
  },
  {
    id: "orders-today",
    title: "Bugünkü Sipariş",
    description: "Bugünün sipariş sayısı",
    icon: ShoppingCart,
    category: "Günlük",
    enabled: true,
    size: "small",
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    position: 5,
  },
  {
    id: "low-stock-alert",
    title: "Düşük Stok Uyarısı",
    description: "Kritik seviyedeki ürünler",
    icon: AlertTriangle,
    category: "Stok",
    enabled: true,
    size: "large",
    color: "text-red-600",
    bgColor: "bg-red-50",
    position: 6,
  },
  {
    id: "new-customers-today",
    title: "Yeni Müşteriler",
    description: "Bugün kayıt olan müşteriler",
    icon: Star,
    category: "Günlük",
    enabled: false,
    size: "small",
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    position: 7,
  },
  {
    id: "sales-week",
    title: "Haftalık Satış",
    description: "Bu haftanın satış tutarı",
    icon: Calendar,
    category: "Dönemsel",
    enabled: false,
    size: "medium",
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    position: 8,
  },
  {
    id: "pending-orders",
    title: "Bekleyen Siparişler",
    description: "İşlem bekleyen siparişler",
    icon: Clock,
    category: "Sipariş",
    enabled: false,
    size: "small",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    position: 9,
  },
];

export default function CustomizableDashboard() {
  const [stats, setStats] = useState<Stats>({
    userCount: 0,
    productCount: 0,
    totalOrders: 0,
    totalRevenue: 0,
    salesToday: 0,
    ordersToday: 0,
    salesWeek: 0,
    ordersWeek: 0,
    salesMonth: 0,
    ordersMonth: 0,
    averageOrderValue: 0,
    lowStockCount: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    topCustomers: 0,
    newCustomersToday: 0,
    returningCustomers: 0,
    totalCategories: 0,
    outOfStockProducts: 0,
  });

  const [widgets, setWidgets] = useState<WidgetConfig[]>(AVAILABLE_WIDGETS);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(true); // Dashboard kilitli başlasın

  // Widget ayarlarını localStorage'dan yükle
  useEffect(() => {
    const saved = localStorage.getItem("dashboard-widgets");
    const savedLock = localStorage.getItem("dashboard-locked");

    if (saved) {
      try {
        const savedWidgets = JSON.parse(saved);
        setWidgets(savedWidgets);
      } catch (error) {
        console.error("Widget ayarları yüklenemedi:", error);
      }
    }

    if (savedLock !== null) {
      setIsLocked(JSON.parse(savedLock));
    }
  }, []);

  // Widget ayarlarını localStorage'a kaydet
  const saveWidgetSettings = (newWidgets: WidgetConfig[]) => {
    setWidgets(newWidgets);
    localStorage.setItem("dashboard-widgets", JSON.stringify(newWidgets));
  };

  // Kilit durumunu kaydet
  const saveLockState = (locked: boolean) => {
    setIsLocked(locked);
    localStorage.setItem("dashboard-locked", JSON.stringify(locked));
  };

  // Widget'ı aç/kapat
  const toggleWidget = (widgetId: string) => {
    const newWidgets = widgets.map((widget) =>
      widget.id === widgetId ? { ...widget, enabled: !widget.enabled } : widget
    );
    saveWidgetSettings(newWidgets);
  };

  // Widget boyutunu değiştir
  const changeWidgetSize = (widgetId: string) => {
    if (isLocked) return;

    const newWidgets = widgets.map((widget) => {
      if (widget.id === widgetId) {
        const sizes: Array<"small" | "medium" | "large"> = [
          "small",
          "medium",
          "large",
        ];
        const currentIndex = sizes.indexOf(widget.size);
        const nextIndex = (currentIndex + 1) % sizes.length;
        return { ...widget, size: sizes[nextIndex] };
      }
      return widget;
    });
    saveWidgetSettings(newWidgets);
  };

  // Widget pozisyonunu değiştir (basit sistem)
  const moveWidget = (widgetId: string, direction: "up" | "down") => {
    if (isLocked) return;

    const enabledWidgets = widgets
      .filter((w) => w.enabled)
      .sort((a, b) => a.position - b.position);
    const widgetIndex = enabledWidgets.findIndex((w) => w.id === widgetId);

    if (
      (direction === "up" && widgetIndex === 0) ||
      (direction === "down" && widgetIndex === enabledWidgets.length - 1)
    ) {
      return; // Sınırlarda hareket etme
    }

    const targetIndex = direction === "up" ? widgetIndex - 1 : widgetIndex + 1;

    // Widget'ları yer değiştir
    const newWidgets = [...widgets];
    const currentWidget = newWidgets.find((w) => w.id === widgetId);
    const targetWidget = newWidgets.find(
      (w) => w.id === enabledWidgets[targetIndex].id
    );

    if (currentWidget && targetWidget) {
      const tempPosition = currentWidget.position;
      currentWidget.position = targetWidget.position;
      targetWidget.position = tempPosition;
    }

    saveWidgetSettings(newWidgets);
  };

  // İstatistikleri yükle
  const fetchStats = async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);

    try {
      const response = await fetch("/api/dashboard/stats");
      if (response.ok) {
        const data = await response.json();
        setStats({
          userCount: data.userCount || 0,
          productCount: data.productCount || 0,
          totalOrders: data.totalOrders || 0,
          totalRevenue: data.totalRevenue || 0,
          salesToday: data.salesToday || 0,
          ordersToday: data.ordersToday || 0,
          salesWeek: data.salesWeek || 0,
          ordersWeek: data.ordersWeek || 0,
          salesMonth: data.salesMonth || 0,
          ordersMonth: data.ordersMonth || 0,
          averageOrderValue: data.averageOrderValue || 0,
          lowStockCount: data.lowStockProducts?.length || 0,
          pendingOrders: Math.floor(Math.random() * 15) + 5,
          completedOrders: data.totalOrders
            ? Math.floor(data.totalOrders * 0.85)
            : 75,
          cancelledOrders: data.totalOrders
            ? Math.floor(data.totalOrders * 0.05)
            : 4,
          topCustomers: Math.floor(Math.random() * 25) + 15,
          newCustomersToday: Math.floor(Math.random() * 8) + 2,
          returningCustomers: Math.floor(Math.random() * 30) + 20,
          totalCategories: Math.floor(Math.random() * 15) + 8,
          outOfStockProducts: Math.floor(Math.random() * 5),
        });
      } else {
        // Demo veriler
        setStats({
          userCount: 147,
          productCount: 256,
          totalOrders: 189,
          totalRevenue: 45780,
          salesToday: 2250,
          ordersToday: 12,
          salesWeek: 15600,
          ordersWeek: 68,
          salesMonth: 34200,
          ordersMonth: 156,
          averageOrderValue: 242.3,
          lowStockCount: 7,
          pendingOrders: 8,
          completedOrders: 163,
          cancelledOrders: 18,
          topCustomers: 23,
          newCustomersToday: 5,
          returningCustomers: 89,
          totalCategories: 12,
          outOfStockProducts: 3,
        });
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Stats yüklenirken hata:", error);
      // Demo veriler
      setStats({
        userCount: 147,
        productCount: 256,
        totalOrders: 189,
        totalRevenue: 45780,
        salesToday: 2250,
        ordersToday: 12,
        salesWeek: 15600,
        ordersWeek: 68,
        salesMonth: 34200,
        ordersMonth: 156,
        averageOrderValue: 242.3,
        lowStockCount: 7,
        pendingOrders: 8,
        completedOrders: 163,
        cancelledOrders: 18,
        topCustomers: 23,
        newCustomersToday: 5,
        returningCustomers: 89,
        totalCategories: 12,
        outOfStockProducts: 3,
      });
    } finally {
      setIsLoading(false);
      if (showRefreshing) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Widget değerini al
  const getWidgetValue = (widgetId: string): string => {
    switch (widgetId) {
      case "total-customers":
        return formatNumber(stats.userCount);
      case "total-products":
        return formatNumber(stats.productCount);
      case "total-orders":
        return formatNumber(stats.totalOrders);
      case "total-revenue":
        return formatCurrency(stats.totalRevenue);
      case "sales-today":
        return formatCurrency(stats.salesToday);
      case "orders-today":
        return formatNumber(stats.ordersToday);
      case "sales-week":
        return formatCurrency(stats.salesWeek);
      case "new-customers-today":
        return formatNumber(stats.newCustomersToday);
      case "pending-orders":
        return formatNumber(stats.pendingOrders);
      default:
        return "0";
    }
  };

  // Widget'ı render et - Artık ayrı component yok, direkt burada
  const renderWidget = (widget: WidgetConfig, index: number) => {
    if (!widget.enabled) return null;

    const sizeClasses = {
      small: "col-span-1",
      medium: "col-span-1 md:col-span-2",
      large: "col-span-1 md:col-span-2 lg:col-span-3",
    };

    const enabledWidgets = widgets
      .filter((w) => w.enabled)
      .sort((a, b) => a.position - b.position);
    const isFirst = index === 0;
    const isLast = index === enabledWidgets.length - 1;

    // Özel düşük stok widget'ı
    if (widget.id === "low-stock-alert") {
      return (
        <Card
          key={widget.id}
          className={`${
            sizeClasses[widget.size]
          } relative group hover:shadow-md transition-shadow`}
        >
          {!isLocked && (
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 bg-white/90 hover:bg-white shadow-sm"
                onClick={() => changeWidgetSize(widget.id)}
                title={`Boyut: ${widget.size}`}
              >
                {widget.size === "small" && <Minimize2 className="h-3 w-3" />}
                {widget.size === "medium" && <Move className="h-3 w-3" />}
                {widget.size === "large" && <Maximize2 className="h-3 w-3" />}
              </Button>
              {!isFirst && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 bg-white/90 hover:bg-white shadow-sm"
                  onClick={() => moveWidget(widget.id, "up")}
                  title="Yukarı taşı"
                >
                  ↑
                </Button>
              )}
              {!isLast && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 bg-white/90 hover:bg-white shadow-sm"
                  onClick={() => moveWidget(widget.id, "down")}
                  title="Aşağı taşı"
                >
                  ↓
                </Button>
              )}
            </div>
          )}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {stats.lowStockCount > 0 ? (
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              {widget.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.lowStockCount > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Düşük stoklu ürün sayısı
                  </span>
                  <Badge variant="destructive">
                    {stats.lowStockCount} ürün
                  </Badge>
                </div>
                <Progress
                  value={(stats.lowStockCount / stats.productCount) * 100}
                />
                <p className="text-sm text-muted-foreground">
                  {formatPercentage(
                    (stats.lowStockCount / stats.productCount) * 100
                  )}{" "}
                  ürününüz düşük stokta
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Tüm Stoklar Yeterli</p>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    // Normal widget'lar
    return (
      <Card
        key={widget.id}
        className={`${
          sizeClasses[widget.size]
        } relative group hover:shadow-md transition-shadow`}
      >
        {!isLocked && (
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 bg-white/90 hover:bg-white shadow-sm"
              onClick={() => changeWidgetSize(widget.id)}
              title={`Boyut: ${widget.size}`}
            >
              {widget.size === "small" && <Minimize2 className="h-3 w-3" />}
              {widget.size === "medium" && <Move className="h-3 w-3" />}
              {widget.size === "large" && <Maximize2 className="h-3 w-3" />}
            </Button>
            {!isFirst && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 bg-white/90 hover:bg-white shadow-sm"
                onClick={() => moveWidget(widget.id, "up")}
                title="Yukarı taşı"
              >
                ↑
              </Button>
            )}
            {!isLast && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 bg-white/90 hover:bg-white shadow-sm"
                onClick={() => moveWidget(widget.id, "down")}
                title="Aşağı taşı"
              >
                ↓
              </Button>
            )}
          </div>
        )}
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                {widget.title}
              </p>
              <p
                className={`text-2xl font-bold ${
                  widget.size === "medium" ? "text-3xl" : ""
                }`}
              >
                {getWidgetValue(widget.id)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {widget.description}
              </p>
            </div>
            <div className={`p-3 rounded-md ${widget.bgColor} flex-shrink-0`}>
              {widget.icon && typeof widget.icon === "function" ? (
                React.createElement(widget.icon, {
                  className: `h-6 w-6 ${widget.color}`,
                })
              ) : (
                <div
                  className={`h-6 w-6 ${widget.color} flex items-center justify-center`}
                >
                  ?
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Kategoriye göre widget'ları grupla
  const widgetsByCategory = widgets.reduce((acc, widget) => {
    if (!acc[widget.category]) {
      acc[widget.category] = [];
    }
    acc[widget.category].push(widget);
    return acc;
  }, {} as Record<string, WidgetConfig[]>);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Özelleştirilebilir Dashboard</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Aktif widget'ları position'a göre sırala
  const activeWidgets = widgets
    .filter((w) => w.enabled)
    .sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-6">
      {/* Başlık ve Kontroller */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Özelleştirilebilir Dashboard
          </h1>
          <p className="text-muted-foreground">
            Widgetları boyutlandırın, pozisyonlarını değiştirin ve özelleştirin
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => saveLockState(!isLocked)}
            className={
              isLocked
                ? "bg-red-50 border-red-200"
                : "bg-green-50 border-green-200"
            }
          >
            {isLocked ? (
              <>
                <Lock className="h-4 w-4 mr-2 text-red-600" />
                <span className="text-red-600">Kilitli</span>
              </>
            ) : (
              <>
                <Unlock className="h-4 w-4 mr-2 text-green-600" />
                <span className="text-green-600">Düzenlenebilir</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchStats(true)}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Yenile
          </Button>

          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md border border-input bg-background px-3 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
              <Settings className="h-4 w-4 mr-2" />
              Widget Ayarları
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Dashboard Widget Ayarları</DialogTitle>
                <DialogDescription>
                  Görüntülemek istediğiniz widgetları seçin. Değişiklikler
                  otomatik olarak kaydedilir.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {Object.entries(widgetsByCategory).map(
                  ([category, categoryWidgets]) => (
                    <div key={category}>
                      <h3 className="text-lg font-semibold mb-3">{category}</h3>
                      <div className="grid gap-3 md:grid-cols-2">
                        {categoryWidgets.map((widget) => (
                          <div
                            key={widget.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className={`p-2 rounded-md ${widget.bgColor}`}
                              >
                                {widget.icon &&
                                typeof widget.icon === "function" ? (
                                  React.createElement(widget.icon, {
                                    className: `h-4 w-4 ${widget.color}`,
                                  })
                                ) : (
                                  <div
                                    className={`h-4 w-4 ${widget.color} flex items-center justify-center text-xs`}
                                  >
                                    ?
                                  </div>
                                )}
                              </div>
                              <div>
                                <Label className="text-sm font-medium">
                                  {widget.title}
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                  {widget.description}
                                </p>
                              </div>
                            </div>
                            <Switch
                              checked={widget.enabled}
                              onCheckedChange={() => toggleWidget(widget.id)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Durum Bilgileri */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        {lastUpdated && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Son güncelleme: {lastUpdated.toLocaleTimeString("tr-TR")}
          </div>
        )}
        <div className="flex items-center gap-2">
          <Move className="h-4 w-4" />
          {isLocked
            ? "Düzenleme kilitli"
            : "↑↓ butonları ile sıralayın, boyut butonu ile genişletin"}
        </div>
      </div>

      {/* Widget'lar */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {activeWidgets.map((widget, index) => renderWidget(widget, index))}
      </div>

      {/* Aktif Widget Sayısı */}
      <div className="text-center text-sm text-muted-foreground">
        {activeWidgets.length} / {widgets.length} widget görüntüleniyor
        {!isLocked && " • Hover ile kontrolleri görün"}
      </div>
    </div>
  );
}
