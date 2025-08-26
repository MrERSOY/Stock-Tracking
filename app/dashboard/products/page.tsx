// app/dashboard/products/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  PlusCircle,
  Search as SearchIcon,
  Filter,
  SortAsc,
  SortDesc,
  Trash2,
  Edit,
  Eye,
  Download,
  Upload,
  Camera,
} from "lucide-react";
import { toast } from "sonner";
import { saveAs } from "file-saver";
import { BarcodeScanner } from "@/components/BarcodeScanner";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  images?: string[];
  barcode?: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  const ITEMS_PER_PAGE = 10;

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch {
      console.error("Kategoriler yüklenemedi");
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        query: searchQuery,
        category: selectedCategory,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
        stock: stockFilter,
        sortBy,
        sortOrder,
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });

      const response = await fetch(`/api/products?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch {
      toast.error("Ürünler yüklenemedi");
    } finally {
      setIsLoading(false);
    }
  }, [
    searchQuery,
    selectedCategory,
    priceRange.min,
    priceRange.max,
    stockFilter,
    sortBy,
    sortOrder,
    currentPage,
  ]);

  // Kategorileri yükle
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Ürünleri yükle
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(new Set(products.map((p) => p.id)));
    } else {
      setSelectedProducts(new Set());
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    const newSelected = new Set(selectedProducts);
    if (checked) {
      newSelected.add(productId);
    } else {
      newSelected.delete(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) {
      toast.error("Lütfen silinecek ürünleri seçin");
      return;
    }

    setIsBulkDeleting(true);
    try {
      const response = await fetch("/api/products/bulk-delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: Array.from(selectedProducts) }),
      });

      if (response.ok) {
        toast.success(`${selectedProducts.size} ürün başarıyla silindi`);
        setSelectedProducts(new Set());
        fetchProducts();
      } else {
        toast.error("Ürünler silinemedi");
      }
    } catch {
      toast.error("Bir hata oluştu");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleBulkCategoryChange = async (categoryId: string) => {
    if (selectedProducts.size === 0) {
      toast.error("Lütfen güncellenecek ürünleri seçin");
      return;
    }

    try {
      const response = await fetch("/api/products/bulk-update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: Array.from(selectedProducts),
          categoryId,
        }),
      });

      if (response.ok) {
        toast.success(`${selectedProducts.size} ürünün kategorisi güncellendi`);
        setSelectedProducts(new Set());
        fetchProducts();
      } else {
        toast.error("Ürünler güncellenemedi");
      }
    } catch {
      toast.error("Bir hata oluştu");
    }
  };

  // Excel Export fonksiyonu
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        query: searchQuery,
        category: selectedCategory,
        stock: stockFilter,
      });

      const response = await fetch(`/api/products/export?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const timestamp = new Date()
          .toISOString()
          .slice(0, 19)
          .replace(/:/g, "-");
        const filename = `urunler_${timestamp}.xlsx`;
        saveAs(blob, filename);
        toast.success("Excel dosyası başarıyla indirildi");
      } else {
        toast.error("Export hatası");
      }
    } catch {
      toast.error("Export sırasında hata oluştu");
    } finally {
      setIsExporting(false);
    }
  };

  // Excel Import fonksiyonu
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/products/import", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        if (result.errors.length > 0) {
          console.error("Import hataları:", result.errors);
        }
        fetchProducts();
        fetchCategories();
      } else {
        const error = await response.text();
        toast.error(error || "Import hatası");
      }
    } catch {
      toast.error("Import sırasında hata oluştu");
    } finally {
      setIsImporting(false);
      // Input'u temizle
      event.target.value = "";
    }
  };

  // Barkod tarama fonksiyonu
  const handleBarcodeScan = (barcode: string) => {
    setSearchQuery(barcode);
    setShowBarcodeScanner(false);
    toast.success(`Barkod aranıyor: ${barcode}`);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || product.categoryId === selectedCategory;

    const matchesPrice =
      (!priceRange.min || product.price >= Number(priceRange.min)) &&
      (!priceRange.max || product.price <= Number(priceRange.max));

    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "inStock" && product.stock > 0) ||
      (stockFilter === "outOfStock" && product.stock === 0) ||
      (stockFilter === "lowStock" && product.stock > 0 && product.stock <= 10);

    return matchesSearch && matchesCategory && matchesPrice && matchesStock;
  });

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Ürün Yönetimi</h1>
          <p className="text-muted-foreground">
            {products.length} ürün • {selectedProducts.size} seçili
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "İndiriliyor..." : "Dışa Aktar"}
          </Button>
          <div className="relative">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImport}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isImporting}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={isImporting}
              className="relative"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isImporting ? "Yükleniyor..." : "İçe Aktar"}
            </Button>
          </div>
          <Link href="/dashboard/products/new">
            <Button className="whitespace-nowrap">
              <PlusCircle size={18} className="mr-2" />
              Yeni Ürün
            </Button>
          </Link>
        </div>
      </div>

      {/* Filtreler */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtreler ve Sıralama
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Arama */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Ürün, barkod, kategori ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-9"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBarcodeScanner(true)}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>

            {/* Kategori Filtresi */}
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Kategori seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Stok Filtresi */}
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Stok durumu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Ürünler</SelectItem>
                <SelectItem value="inStock">Stokta Var</SelectItem>
                <SelectItem value="outOfStock">Stokta Yok</SelectItem>
                <SelectItem value="lowStock">Düşük Stok</SelectItem>
              </SelectContent>
            </Select>

            {/* Sıralama */}
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Oluşturma Tarihi</SelectItem>
                  <SelectItem value="name">Ürün Adı</SelectItem>
                  <SelectItem value="price">Fiyat</SelectItem>
                  <SelectItem value="stock">Stok</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
              >
                {sortOrder === "asc" ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Fiyat Aralığı */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Min Fiyat</label>
              <input
                type="number"
                placeholder="0"
                value={priceRange.min}
                onChange={(e) =>
                  setPriceRange((prev) => ({ ...prev, min: e.target.value }))
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Max Fiyat</label>
              <input
                type="number"
                placeholder="∞"
                value={priceRange.max}
                onChange={(e) =>
                  setPriceRange((prev) => ({ ...prev, max: e.target.value }))
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Toplu İşlemler */}
      {selectedProducts.size > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {selectedProducts.size} ürün seçildi
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProducts(new Set())}
                >
                  Seçimi Temizle
                </Button>
              </div>
              <div className="flex gap-2">
                <Select onValueChange={handleBulkCategoryChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Kategori değiştir" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={isBulkDeleting}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isBulkDeleting ? "Siliniyor..." : "Toplu Sil"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {selectedProducts.size} ürün kalıcı olarak silinecektir.
                        Bu işlem geri alınamaz.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>İptal</AlertDialogCancel>
                      <AlertDialogAction onClick={handleBulkDelete}>
                        Evet, Sil
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ürün Tablosu */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedProducts.size === products.length &&
                        products.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-[80px]">Görsel</TableHead>
                  <TableHead>Ürün Adı</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Fiyat</TableHead>
                  <TableHead className="text-right">Stok</TableHead>
                  <TableHead className="text-right">Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Yükleniyor...
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedProducts.has(product.id)}
                          onCheckedChange={(checked) =>
                            handleSelectProduct(product.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Image
                          src={
                            product.images?.[0] ||
                            "https://placehold.co/40x40/e2e8f0/94a3b8?text=G%C3%B6rsel"
                          }
                          alt={product.name}
                          width={40}
                          height={40}
                          className="rounded-md object-cover aspect-square"
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          {product.barcode && (
                            <div className="text-xs text-muted-foreground">
                              {product.barcode}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.category ? (
                          <Badge variant="outline">
                            {product.category.name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₺{product.price.toLocaleString("tr-TR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`font-semibold ${
                            product.stock === 0
                              ? "text-red-600"
                              : product.stock <= 10
                              ? "text-orange-600"
                              : "text-green-600"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={
                            product.stock === 0
                              ? "destructive"
                              : product.stock <= 10
                              ? "secondary"
                              : "default"
                          }
                        >
                          {product.stock === 0
                            ? "Stokta Yok"
                            : product.stock <= 10
                            ? "Düşük Stok"
                            : "Stokta Var"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/dashboard/products/${product.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button asChild variant="ghost" size="sm">
                            <Link
                              href={`/dashboard/products/edit/${product.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Ürün bulunamadı.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Önceki
          </Button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + 1;
            return (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
          >
            Sonraki
          </Button>
        </div>
      )}

      {/* Barkod Okuyucu Modal */}
      {showBarcodeScanner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <BarcodeScanner
            onScan={handleBarcodeScan}
            onClose={() => setShowBarcodeScanner(false)}
          />
        </div>
      )}
    </div>
  );
}
