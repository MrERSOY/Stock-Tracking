// app/dashboard/analytics/page.tsx
"use client";

import { useState, useEffect } from "react";
import type { Metadata } from "next";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Zap,
  Target,
  PieChart,
  LineChart,
  Activity,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatters";
import { toast } from "sonner";
import { SalesChart } from "@/components/charts/SalesChart";
import { CustomerChart } from "@/components/charts/CustomerChart";
import { InventoryChart } from "@/components/charts/InventoryChart";

// Analytics veri türleri
interface SalesAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  salesGrowth: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
  monthlyData: Array<{
    month: string;
    revenue: number;
    orders: number;
    growth: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    revenue: number;
    quantity: number;
    growth: number;
  }>;
}

interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  customerGrowth: number;
  averageLifetimeValue: number;
  churnRate: number;
  topCustomers: Array<{
    id: string;
    name: string;
    totalSpent: number;
    orderCount: number;
    lastOrder: string;
  }>;
}

interface InventoryAnalytics {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalInventoryValue: number;
  averageStockTurnover: number;
  fastMovingProducts: Array<{
    id: string;
    name: string;
    turnoverRate: number;
    revenue: number;
  }>;
  slowMovingProducts: Array<{
    id: string;
    name: string;
    daysInStock: number;
    stockValue: number;
  }>;
}

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState("month");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [salesData, setSalesData] = useState<SalesAnalytics | null>(null);
  const [customerData, setCustomerData] = useState<CustomerAnalytics | null>(
    null
  );
  const [inventoryData, setInventoryData] = useState<InventoryAnalytics | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("overview");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  // Gerçek veri yükleme fonksiyonu
  const fetchAnalyticsData = async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);

    try {
      // Paralel API çağrıları
      const [salesResponse, customerResponse, inventoryResponse] =
        await Promise.all([
          fetch(`/api/analytics/sales?timeframe=${timeframe}`, {
            headers: {
              "Content-Type": "application/json",
            },
          }),
          fetch(`/api/analytics/customers?timeframe=${timeframe}`, {
            headers: {
              "Content-Type": "application/json",
            },
          }),
          fetch(`/api/analytics/inventory?timeframe=${timeframe}`, {
            headers: {
              "Content-Type": "application/json",
            },
          }),
        ]);

      if (salesResponse.ok) {
        const salesData = await salesResponse.json();
        setSalesData(salesData);
      } else {
        console.error("Sales API error:", await salesResponse.text());
      }

      if (customerResponse.ok) {
        const customerData = await customerResponse.json();
        setCustomerData(customerData);
      } else {
        console.error("Customer API error:", await customerResponse.text());
      }

      if (inventoryResponse.ok) {
        const inventoryData = await inventoryResponse.json();
        setInventoryData(inventoryData);
      } else {
        console.error("Inventory API error:", await inventoryResponse.text());
      }
    } catch (error) {
      console.error("Analytics data fetch error:", error);
      toast.error("Analitik veriler yüklenirken hata oluştu");
    } finally {
      setIsLoading(false);
      if (showRefreshing) setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchAnalyticsData(true);
  };

  const handleExport = (format: string) => {
    toast.info(`${format.toUpperCase()} formatında rapor dışa aktarılıyor...`);
    // Export functionality will be implemented
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh((prev) => {
      const newValue = !prev;
      if (newValue) {
        // Start auto refresh every 30 seconds
        const interval = setInterval(() => {
          fetchAnalyticsData(true);
        }, 30000);
        setRefreshInterval(interval);
        toast.success("Otomatik yenileme aktif (30 saniye)");
      } else {
        // Stop auto refresh
        if (refreshInterval) {
          clearInterval(refreshInterval);
          setRefreshInterval(null);
        }
        toast.info("Otomatik yenileme durduruldu");
      }
      return newValue;
    });
  };

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeframe]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Analitik veriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Gelişmiş Analitikler</h1>
            <p className="text-gray-600">
              İşletmenizin performansını detaylı grafikler ve metriklerle analiz
              edin
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Bu Hafta</SelectItem>
              <SelectItem value="month">Bu Ay</SelectItem>
              <SelectItem value="quarter">Bu Çeyrek</SelectItem>
              <SelectItem value="year">Bu Yıl</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={toggleAutoRefresh}
          >
            <Zap
              className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-pulse" : ""}`}
            />
            {autoRefresh ? "Otomatik" : "Manuel"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Yenile
          </Button>

          <Select onValueChange={handleExport}>
            <SelectTrigger className="w-32">
              <Download className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Dışa Aktar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: "overview", label: "Genel Bakış", icon: Activity },
          { id: "sales", label: "Satış", icon: TrendingUp },
          { id: "customers", label: "Müşteriler", icon: Users },
          { id: "inventory", label: "Envanter", icon: Package },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === tab.id
                ? "bg-white shadow-sm text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Toplam Ciro</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(salesData?.totalRevenue || 0)}
                    </p>
                    <div className="flex items-center mt-1">
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-500">
                        +{salesData?.salesGrowth.monthly || 0}%
                      </span>
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-full">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Toplam Sipariş</p>
                    <p className="text-2xl font-bold">
                      {salesData?.totalOrders?.toLocaleString() || 0}
                    </p>
                    <div className="flex items-center mt-1">
                      <ArrowUpRight className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-blue-500">+12.3%</span>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-full">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Toplam Müşteri</p>
                    <p className="text-2xl font-bold">
                      {customerData?.totalCustomers?.toLocaleString() || 0}
                    </p>
                    <div className="flex items-center mt-1">
                      <ArrowUpRight className="h-4 w-4 text-purple-500" />
                      <span className="text-sm text-purple-500">
                        +{customerData?.customerGrowth || 0}%
                      </span>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-full">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Envanter Değeri</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(inventoryData?.totalInventoryValue || 0)}
                    </p>
                    <div className="flex items-center mt-1">
                      <ArrowUpRight className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-orange-500">+8.7%</span>
                    </div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-full">
                    <Package className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Satış Trendi
                </CardTitle>
              </CardHeader>
              <CardContent>
                {salesData?.monthlyData && salesData.monthlyData.length > 0 ? (
                  <SalesChart data={salesData.monthlyData} type="line" />
                ) : (
                  <div className="h-80 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">
                        Satış verisi yükleniyor...
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  En Çok Satan Ürünler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salesData?.topProducts?.slice(0, 5).map((product, index) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className="w-6 h-6 flex items-center justify-center p-0 text-xs"
                        >
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-gray-500">
                            {product.quantity} adet
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">
                          {formatCurrency(product.revenue)}
                        </p>
                        <div className="flex items-center gap-1">
                          {product.growth > 0 ? (
                            <ArrowUpRight className="h-3 w-3 text-green-500" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 text-red-500" />
                          )}
                          <span
                            className={`text-xs ${
                              product.growth > 0
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {product.growth > 0 ? "+" : ""}
                            {product.growth}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Sales Tab */}
      {activeTab === "sales" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      Ortalama Sipariş Değeri
                    </p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(salesData?.averageOrderValue || 0)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Günlük Büyüme</p>
                    <p className="text-2xl font-bold">
                      +{salesData?.salesGrowth.daily || 0}%
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Yıllık Büyüme</p>
                    <p className="text-2xl font-bold">
                      +{salesData?.salesGrowth.yearly || 0}%
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Sales Table */}
          <Card>
            <CardHeader>
              <CardTitle>Ürün Performans Detayları</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ürün</TableHead>
                    <TableHead>Satış Miktarı</TableHead>
                    <TableHead>Gelir</TableHead>
                    <TableHead>Büyüme</TableHead>
                    <TableHead>Durum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesData?.topProducts?.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>{product.quantity} adet</TableCell>
                      <TableCell>{formatCurrency(product.revenue)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {product.growth > 0 ? (
                            <ArrowUpRight className="h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-500" />
                          )}
                          <span
                            className={
                              product.growth > 0
                                ? "text-green-500"
                                : "text-red-500"
                            }
                          >
                            {product.growth > 0 ? "+" : ""}
                            {product.growth}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            product.growth > 0 ? "default" : "destructive"
                          }
                        >
                          {product.growth > 0 ? "Artan" : "Azalan"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === "customers" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Yeni Müşteriler</p>
                  <p className="text-2xl font-bold">
                    {customerData?.newCustomers || 0}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Activity className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Geri Dönen</p>
                  <p className="text-2xl font-bold">
                    {customerData?.returningCustomers || 0}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <DollarSign className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Ortalama CLV</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(customerData?.averageLifetimeValue || 0)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <TrendingDown className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Churn Rate</p>
                  <p className="text-2xl font-bold">
                    {customerData?.churnRate || 0}%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Segmentation Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Müşteri Segmentasyonu
                </CardTitle>
              </CardHeader>
              <CardContent>
                {customerData ? (
                  <CustomerChart
                    data={{
                      totalCustomers: customerData.totalCustomers,
                      newCustomers: customerData.newCustomers,
                      returningCustomers: customerData.returningCustomers,
                    }}
                    type="doughnut"
                  />
                ) : (
                  <div className="h-80 bg-gradient-to-br from-purple-50 to-pink-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Users className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">
                        Müşteri verisi yükleniyor...
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Müşteri Metrikleri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Müşteri Büyümesi
                    </span>
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                      <span className="font-semibold text-green-500">
                        +{customerData?.customerGrowth || 0}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Churn Rate</span>
                    <div className="flex items-center gap-2">
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                      <span className="font-semibold text-red-500">
                        {customerData?.churnRate || 0}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Müşteri Segmentleri</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">
                          Yeni Müşteriler
                        </span>
                        <span className="text-xs font-medium">
                          {customerData?.newCustomers || 0}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${
                              customerData?.totalCustomers
                                ? (customerData.newCustomers /
                                    customerData.totalCustomers) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">
                          Geri Dönen Müşteriler
                        </span>
                        <span className="text-xs font-medium">
                          {customerData?.returningCustomers || 0}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${
                              customerData?.totalCustomers
                                ? (customerData.returningCustomers /
                                    customerData.totalCustomers) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Customers */}
          <Card>
            <CardHeader>
              <CardTitle>En Değerli Müşteriler</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Müşteri</TableHead>
                    <TableHead>Toplam Harcama</TableHead>
                    <TableHead>Sipariş Sayısı</TableHead>
                    <TableHead>Son Sipariş</TableHead>
                    <TableHead>Durum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerData?.topCustomers?.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        {customer.name}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(customer.totalSpent)}
                      </TableCell>
                      <TableCell>{customer.orderCount}</TableCell>
                      <TableCell>
                        {new Date(customer.lastOrder).toLocaleDateString(
                          "tr-TR"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">Aktif</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === "inventory" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Package className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Toplam Ürün</p>
                  <p className="text-2xl font-bold">
                    {inventoryData?.totalProducts || 0}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <TrendingDown className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Düşük Stok</p>
                  <p className="text-2xl font-bold">
                    {inventoryData?.lowStockProducts || 0}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Clock className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Stokta Yok</p>
                  <p className="text-2xl font-bold">
                    {inventoryData?.outOfStockProducts || 0}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Activity className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Devir Hızı</p>
                  <p className="text-2xl font-bold">
                    {inventoryData?.averageStockTurnover || 0}x
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Inventory Analytics Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Ürün Performans Analizi
                </CardTitle>
              </CardHeader>
              <CardContent>
                {inventoryData?.fastMovingProducts &&
                inventoryData?.slowMovingProducts ? (
                  <InventoryChart
                    fastMovingProducts={inventoryData.fastMovingProducts}
                    slowMovingProducts={inventoryData.slowMovingProducts}
                  />
                ) : (
                  <div className="h-80 bg-gradient-to-br from-orange-50 to-yellow-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Package className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">
                        Envanter verisi yükleniyor...
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
