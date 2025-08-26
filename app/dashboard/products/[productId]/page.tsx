"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Edit,
  Trash2,
  ArrowLeft,
  Package,
  Tag,
  DollarSign,
  Calendar,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  images?: string[];
  barcode?: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const fetchProduct = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) {
        throw new Error("Ürün bulunamadı");
      }
      const data = await response.json();
      setProduct(data);
    } catch {
      toast.error("Ürün yüklenemedi");
      router.push("/dashboard/products");
    } finally {
      setIsLoading(false);
    }
  }, [productId, router]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Ürün başarıyla silindi");
        router.push("/dashboard/products");
      } else {
        toast.error("Ürün silinemedi");
      }
    } catch {
      toast.error("Bir hata oluştu");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0)
      return { text: "Stokta Yok", variant: "destructive" as const };
    if (stock <= 10)
      return { text: "Düşük Stok", variant: "secondary" as const };
    return { text: "Stokta Var", variant: "default" as const };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Ürün bulunamadı</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/products">Ürünlere Dön</Link>
        </Button>
      </div>
    );
  }

  const stockStatus = getStockStatus(product.stock);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground">
              {product.category?.name || "Kategorisiz"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/dashboard/products/edit/${product.id}`}>
              <Edit className="h-4 w-4 mr-2" />
              Düzenle
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? "Siliniyor..." : "Sil"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                <AlertDialogDescription>
                  &ldquo;{product.name}&rdquo; ürünü kalıcı olarak silinecektir.
                  Bu işlem geri alınamaz.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Evet, Sil
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ürün Görselleri */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Ürün Görselleri
            </CardTitle>
          </CardHeader>
          <CardContent>
            {product.images && product.images.length > 0 ? (
              <div className="space-y-4">
                {/* Ana görsel */}
                <div className="relative aspect-square rounded-lg overflow-hidden">
                  <Image
                    src={
                      product.images[selectedImage] ||
                      "https://placehold.co/400x400/e2e8f0/94a3b8?text=G%C3%B6rsel"
                    }
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Küçük görseller */}
                {product.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 ${
                          selectedImage === index
                            ? "ring-2 ring-primary"
                            : "ring-1 ring-border"
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Görsel yok</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ürün Bilgileri */}
        <div className="space-y-6">
          {/* Temel Bilgiler */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Temel Bilgiler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Ürün Adı
                </label>
                <p className="text-lg font-semibold">{product.name}</p>
              </div>

              {product.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Açıklama
                  </label>
                  <p className="text-sm">{product.description}</p>
                </div>
              )}

              {product.barcode && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Barkod
                  </label>
                  <p className="font-mono text-sm bg-muted px-2 py-1 rounded">
                    {product.barcode}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fiyat ve Stok */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Fiyat ve Stok
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Fiyat
                </span>
                <span className="text-2xl font-bold text-green-600">
                  ₺{product.price.toLocaleString("tr-TR")}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Stok
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-lg font-semibold ${
                      product.stock === 0
                        ? "text-red-600"
                        : product.stock <= 10
                        ? "text-orange-600"
                        : "text-green-600"
                    }`}
                  >
                    {product.stock}
                  </span>
                  <Badge variant={stockStatus.variant}>
                    {stockStatus.text}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kategori */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Kategori
              </CardTitle>
            </CardHeader>
            <CardContent>
              {product.category ? (
                <Badge variant="outline" className="text-base px-3 py-1">
                  {product.category.name}
                </Badge>
              ) : (
                <p className="text-muted-foreground">Kategori atanmamış</p>
              )}
            </CardContent>
          </Card>

          {/* Tarih Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Tarih Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Oluşturulma
                </label>
                <p className="text-sm">{formatDate(product.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Son Güncelleme
                </label>
                <p className="text-sm">{formatDate(product.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
