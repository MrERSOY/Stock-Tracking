"use client";

import { useState, useEffect } from "react";
import { toast, Toaster } from "sonner";
import { Product } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Loader2,
  Package,
  Plus,
  Minus,
  RefreshCw,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Eye,
  Edit3,
  Filter,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

interface StockMovement {
  id: string;
  productId: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  reason: string;
  date: Date;
}

type StockFilter = "all" | "normal" | "low" | "critical" | "out";

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [updatingProductId, setUpdatingProductId] = useState<string | null>(
    null
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/products?limit=1000");

      if (!response.ok) {
        throw new Error(`API Hatası: ${response.status}`);
      }

      const data = await response.json();
      let productList: Product[] = [];

      if (Array.isArray(data)) {
        productList = data;
      } else if (data && Array.isArray(data.products)) {
        productList = data.products;
      } else if (data && data.data && Array.isArray(data.data)) {
        productList = data.data;
      }

      setProducts(productList);
      toast.success(`${productList.length} ürün yüklendi`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Bilinmeyen hata";
      setError(errorMessage);
      toast.error(`Hata: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStock = async (
    productId: string,
    newStock: number,
    reason: string = "Manuel güncelleme"
  ) => {
    if (newStock < 0) {
      toast.error("Stok negatif olamaz");
      return;
    }

    setUpdatingProductId(productId);

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });

      if (!response.ok) {
        throw new Error("Stok güncellenirken hata oluştu");
      }

      const oldStock = products.find((p) => p.id === productId)?.stock || 0;

      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
      );

      // Stok hareketi logla (gelecekte kullanılabilir)
      console.log(
        `Stok hareketi: ${productId}, ${oldStock} -> ${newStock}, sebep: ${reason}`
      );

      toast.success(`Stok güncellendi: ${newStock} adet`);
    } catch (error) {
      toast.error("Stok güncellenirken hata oluştu");
    } finally {
      setUpdatingProductId(null);
    }
  };

  const handleStockAdjustment = async () => {
    if (!selectedProduct || !adjustmentQuantity) return;

    const quantity = parseInt(adjustmentQuantity);
    if (isNaN(quantity)) {
      toast.error("Geçerli bir sayı girin");
      return;
    }

    const newStock = selectedProduct.stock + quantity;
    await updateStock(
      selectedProduct.id,
      newStock,
      adjustmentReason || "Stok düzeltmesi"
    );

    setIsAdjustmentDialogOpen(false);
    setAdjustmentQuantity("");
    setAdjustmentReason("");
    setSelectedProduct(null);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0)
      return {
        label: "Stokta Yok",
        variant: "destructive" as const,
        icon: AlertTriangle,
        color: "text-red-600",
      };
    if (stock <= 5)
      return {
        label: "Kritik",
        variant: "destructive" as const,
        icon: TrendingDown,
        color: "text-red-600",
      };
    if (stock <= 20)
      return {
        label: "Düşük",
        variant: "secondary" as const,
        icon: TrendingDown,
        color: "text-yellow-600",
      };
    return {
      label: "Normal",
      variant: "default" as const,
      icon: TrendingUp,
      color: "text-green-600",
    };
  };

  const filteredProducts = products.filter((product) => {
    // Arama filtresi
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.barcode &&
        product.barcode.toLowerCase().includes(searchTerm.toLowerCase()));

    // Stok durumu filtresi
    let matchesStockFilter = true;
    switch (stockFilter) {
      case "normal":
        matchesStockFilter = product.stock > 20;
        break;
      case "low":
        matchesStockFilter = product.stock > 5 && product.stock <= 20;
        break;
      case "critical":
        matchesStockFilter = product.stock > 0 && product.stock <= 5;
        break;
      case "out":
        matchesStockFilter = product.stock === 0;
        break;
      default:
        matchesStockFilter = true;
    }

    return matchesSearch && matchesStockFilter;
  });

  const getStockStats = () => {
    const total = products.length;
    const normal = products.filter((p) => p.stock > 20).length;
    const low = products.filter((p) => p.stock > 5 && p.stock <= 20).length;
    const critical = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;
    const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

    return { total, normal, low, critical, outOfStock, totalValue };
  };

  const stats = getStockStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Stok verileri yükleniyor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-red-600 mb-4">Hata Oluştu</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={fetchProducts} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Tekrar Dene
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8 text-blue-600" />
            Stok Kontrol Paneli
          </h1>
          <p className="text-gray-600 mt-1">Envanter yönetimi ve stok takibi</p>
        </div>
        <Button
          onClick={fetchProducts}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Yenile
        </Button>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="md:col-span-1">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600">Toplam Ürün</div>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.normal}
            </div>
            <div className="text-sm text-gray-600">Normal Stok</div>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.low}
            </div>
            <div className="text-sm text-gray-600">Düşük Stok</div>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.critical}
            </div>
            <div className="text-sm text-gray-600">Kritik Stok</div>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-800">
              {stats.outOfStock}
            </div>
            <div className="text-sm text-gray-600">Stokta Yok</div>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardContent className="p-4 text-center">
            <div className="text-lg font-bold text-purple-600">
              ₺{formatCurrency(stats.totalValue)}
            </div>
            <div className="text-sm text-gray-600">Toplam Değer</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtreler */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Arama ve Filtreler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Ürün adı veya barkod ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={stockFilter}
              onValueChange={(value: StockFilter) => setStockFilter(value)}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Stok durumu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Ürünler</SelectItem>
                <SelectItem value="normal">Normal Stok</SelectItem>
                <SelectItem value="low">Düşük Stok</SelectItem>
                <SelectItem value="critical">Kritik Stok</SelectItem>
                <SelectItem value="out">Stokta Yok</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Ürün Tablosu */}
      <Card>
        <CardHeader>
          <CardTitle>Stok Listesi ({filteredProducts.length} ürün)</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ürün bulunamadı
              </h3>
              <p className="text-gray-500">
                {searchTerm || stockFilter !== "all"
                  ? "Filtrelere uygun ürün yok"
                  : "Henüz ürün eklenmemiş"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ürün</TableHead>
                    <TableHead>Barkod</TableHead>
                    <TableHead className="text-center">Mevcut Stok</TableHead>
                    <TableHead className="text-right">Birim Fiyat</TableHead>
                    <TableHead className="text-right">Toplam Değer</TableHead>
                    <TableHead className="text-center">Durum</TableHead>
                    <TableHead className="text-center">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product.stock);
                    const totalValue = product.price * product.stock;
                    const StatusIcon = stockStatus.icon;

                    return (
                      <TableRow
                        key={product.id}
                        className={product.stock <= 5 ? "bg-red-50" : ""}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center">
                              <Package className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              {product.description && (
                                <div className="text-sm text-gray-500 max-w-xs truncate">
                                  {product.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          {product.barcode ? (
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                              {product.barcode}
                            </code>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>

                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <StatusIcon
                              className={`h-4 w-4 ${stockStatus.color}`}
                            />
                            <span className="font-mono text-lg font-semibold">
                              {product.stock}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          ₺{formatCurrency(product.price)}
                        </TableCell>

                        <TableCell className="text-right font-medium">
                          ₺{formatCurrency(totalValue)}
                        </TableCell>

                        <TableCell className="text-center">
                          <Badge
                            variant={stockStatus.variant}
                            className="min-w-20"
                          >
                            {stockStatus.label}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateStock(
                                  product.id,
                                  product.stock - 1,
                                  "Stok azaltma"
                                )
                              }
                              disabled={
                                updatingProductId === product.id ||
                                product.stock <= 0
                              }
                              className="h-8 w-8 p-0"
                              title="Stok azalt"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateStock(
                                  product.id,
                                  product.stock + 1,
                                  "Stok artırma"
                                )
                              }
                              disabled={updatingProductId === product.id}
                              className="h-8 w-8 p-0"
                              title="Stok artır"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedProduct(product);
                                setIsAdjustmentDialogOpen(true);
                              }}
                              disabled={updatingProductId === product.id}
                              className="h-8 w-8 p-0"
                              title="Stok düzeltmesi"
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stok Düzeltme Dialogu */}
      <Dialog
        open={isAdjustmentDialogOpen}
        onOpenChange={setIsAdjustmentDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stok Düzeltmesi</DialogTitle>
            <DialogDescription>
              {selectedProduct?.name} için stok düzeltmesi yapın
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Mevcut Stok:{" "}
                <span className="font-mono text-lg">
                  {selectedProduct?.stock || 0}
                </span>
              </label>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Düzeltme Miktarı (+ veya -)
              </label>
              <Input
                type="number"
                placeholder="Örn: +10 veya -5"
                value={adjustmentQuantity}
                onChange={(e) => setAdjustmentQuantity(e.target.value)}
                autoFocus
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Düzeltme Sebebi
              </label>
              <Input
                placeholder="Örn: Sayım farkı, bozuk ürün..."
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
              />
            </div>

            {adjustmentQuantity && (
              <div className="p-3 bg-blue-50 rounded-md">
                <p className="text-sm">
                  <strong>Yeni Stok:</strong>{" "}
                  {(selectedProduct?.stock || 0) +
                    parseInt(adjustmentQuantity || "0")}
                </p>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsAdjustmentDialogOpen(false)}
              >
                İptal
              </Button>
              <Button onClick={handleStockAdjustment}>Düzeltmeyi Uygula</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
