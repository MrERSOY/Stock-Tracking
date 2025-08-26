"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Calendar,
  FileSpreadsheet,
  BarChart3,
  PieChart,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

interface RevenueData {
  totalSales: number;
  totalRevenue: number;
  totalTax: number;
  totalDiscount: number;
  paymentMethodStats: Record<string, { count: number; total: number }>;
  dailyStats: Record<string, { sales: number; revenue: number }>;
  salesData: Array<{
    id: string;
    totalAmount: number;
    taxAmount: number;
    discountAmount: number;
    paymentMethod: string;
    createdAt: string;
    customerId: string | null;
  }>;
}

export default function RevenuePage() {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("today");

  // Bugünün tarihini varsayılan olarak ayarla
  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    setEndDate(todayStr);

    // Bugün için
    if (selectedPeriod === "today") {
      setStartDate(todayStr);
    }
    // Bu hafta için
    else if (selectedPeriod === "week") {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      setStartDate(weekAgo.toISOString().split("T")[0]);
    }
    // Bu ay için
    else if (selectedPeriod === "month") {
      const monthAgo = new Date(today);
      monthAgo.setMonth(today.getMonth() - 1);
      setStartDate(monthAgo.toISOString().split("T")[0]);
    }
  }, [selectedPeriod]);

  // Ciro verilerini getir
  const fetchRevenueData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetch(`/api/sales?${params}`);
      if (!response.ok) throw new Error("Ciro verileri alınamadı");

      const data = await response.json();
      setRevenueData(data.data);
    } catch (error) {
      console.error("Ciro verileri hatası:", error);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (startDate && endDate) {
      fetchRevenueData();
    }
  }, [fetchRevenueData, startDate, endDate]);

  // Excel formatında rapor indir
  const downloadRevenueReport = () => {
    if (!revenueData) return;

    let csvContent = "CİRO RAPORU\n";
    csvContent += `Başlangıç Tarihi,${startDate}\n`;
    csvContent += `Bitiş Tarihi,${endDate}\n`;
    csvContent += "\n";

    // Genel istatistikler
    csvContent += "GENEL İSTATİSTİKLER\n";
    csvContent += `Toplam Satış Adedi,${revenueData.totalSales}\n`;
    csvContent += `Toplam Ciro,${revenueData.totalRevenue.toFixed(2)}\n`;
    csvContent += `Toplam KDV,${revenueData.totalTax.toFixed(2)}\n`;
    csvContent += `Toplam İndirim,${revenueData.totalDiscount.toFixed(2)}\n`;
    csvContent += "\n";

    // Ödeme yöntemleri
    csvContent += "ÖDEME YÖNTEMLERİ\n";
    csvContent += "Yöntem,Satış Adedi,Toplam Tutar\n";
    Object.entries(revenueData.paymentMethodStats).forEach(
      ([method, stats]) => {
        csvContent += `${method},${stats.count},${stats.total.toFixed(2)}\n`;
      }
    );
    csvContent += "\n";

    // Günlük satışlar
    csvContent += "GÜNLÜK SATIŞLAR\n";
    csvContent += "Tarih,Satış Adedi,Ciro\n";
    Object.entries(revenueData.dailyStats).forEach(([date, stats]) => {
      csvContent += `${date},${stats.sales},${stats.revenue.toFixed(2)}\n`;
    });
    csvContent += "\n";

    // Detaylı satış listesi
    csvContent += "DETAYLI SATIŞ LİSTESİ\n";
    csvContent +=
      "Satış ID,Tarih,Toplam Tutar,KDV,İndirim,Ödeme Yöntemi,Müşteri ID\n";
    revenueData.salesData.forEach((sale) => {
      csvContent += `${sale.id},${sale.createdAt},${sale.totalAmount.toFixed(
        2
      )},${sale.taxAmount.toFixed(2)},${sale.discountAmount.toFixed(2)},${
        sale.paymentMethod
      },${sale.customerId || "Müşteri Yok"}\n`;
    });

    // Dosyayı indir
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `ciro-raporu-${startDate}-${endDate}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ciro Takibi</h1>
          <p className="text-muted-foreground">
            Satış verilerinizi analiz edin ve ciro raporları oluşturun
          </p>
        </div>
        <Button onClick={downloadRevenueReport} disabled={!revenueData}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Excel Raporu İndir
        </Button>
      </div>

      {/* Tarih Filtreleri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Tarih Aralığı
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex gap-2">
              <Button
                variant={selectedPeriod === "today" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod("today")}
              >
                Bugün
              </Button>
              <Button
                variant={selectedPeriod === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod("week")}
              >
                Bu Hafta
              </Button>
              <Button
                variant={selectedPeriod === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod("month")}
              >
                Bu Ay
              </Button>
            </div>
            <div className="flex gap-2">
              <div>
                <label className="text-sm font-medium">Başlangıç</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Bitiş</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <Button onClick={fetchRevenueData} disabled={isLoading}>
                {isLoading ? "Yükleniyor..." : "Filtrele"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* İstatistik Kartları */}
      {revenueData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Toplam Satış
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{revenueData.totalSales}</div>
              <p className="text-xs text-muted-foreground">Satış adedi</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Ciro</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(revenueData.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">Toplam gelir</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam KDV</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(revenueData.totalTax)}
              </div>
              <p className="text-xs text-muted-foreground">KDV tutarı</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Toplam İndirim
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(revenueData.totalDiscount)}
              </div>
              <p className="text-xs text-muted-foreground">İndirim tutarı</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ödeme Yöntemleri */}
      {revenueData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Ödeme Yöntemleri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(revenueData.paymentMethodStats).map(
                  ([method, stats]) => (
                    <div
                      key={method}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {method === "cash" ? "Nakit" : "Kart"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {stats.count} satış
                        </span>
                      </div>
                      <span className="font-semibold">
                        {formatCurrency(stats.total)}
                      </span>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Günlük Satışlar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Günlük Satışlar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {Object.entries(revenueData.dailyStats)
                  .sort(
                    ([a], [b]) => new Date(b).getTime() - new Date(a).getTime()
                  )
                  .slice(0, 10)
                  .map(([date, stats]) => (
                    <div
                      key={date}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">
                          {new Date(date).toLocaleDateString("tr-TR")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {stats.sales} satış
                        </p>
                      </div>
                      <span className="font-semibold">
                        {formatCurrency(stats.revenue)}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Yükleme Durumu */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">
            Ciro verileri yükleniyor...
          </p>
        </div>
      )}

      {/* Veri Yok Durumu */}
      {!isLoading && !revenueData && startDate && endDate && (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">Veri Bulunamadı</h3>
          <p className="text-muted-foreground">
            Seçilen tarih aralığında satış verisi bulunamadı.
          </p>
        </div>
      )}
    </div>
  );
}
