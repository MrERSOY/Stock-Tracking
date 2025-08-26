"use client";

import { useState, useEffect, useMemo } from "react";
import { toast, Toaster } from "sonner";
import { Product } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  X,
  Plus,
  Minus,
  ShoppingCart,
  DollarSign,
  Loader2,
  CreditCard,
  Package,
  Hash,
  Scan,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import CustomerSelector, { Customer } from "@/components/pos/CustomerSelector";
import ProductImage from "@/components/ProductImage";
import { ProductImageModal } from "@/components/pos/ProductImageModal";

// Sabitler
const TAX_RATE = 0.2; // %20 KDV

// Ödeme yöntemleri
const PAYMENT_METHODS = [
  { id: "cash", name: "Nakit", icon: DollarSign },
  { id: "card", name: "Kart", icon: CreditCard },
];

// Satış listesindeki bir ürünü temsil eden tip
interface SaleItem extends Product {
  quantity: number;
}

export default function POSPage() {
  // State'ler
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [saleList, setSaleList] = useState<SaleItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cashAmount, setCashAmount] = useState("");
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [imageModal, setImageModal] = useState<{
    isOpen: boolean;
    src?: string;
    alt: string;
    productName: string;
  }>({
    isOpen: false,
    src: "",
    alt: "",
    productName: "",
  });
  // Yerel taslak (draft) persistence kontrolü
  const DRAFT_KEY = "posDraft:v1"; // versiyon ekleyerek ileride schema değişikliklerinde ayıralım
  const [hydrated, setHydrated] = useState(false);

  // İlk yüklemede localStorage'dan taslak oku
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.items)) {
          // Basit doğrulama: her item'da id, name, price, quantity var mı
          const validItems: SaleItem[] = parsed.items.filter(
            (it: unknown) =>
              it &&
              typeof it === "object" &&
              it !== null &&
              "id" in it &&
              "name" in it &&
              "price" in it &&
              "quantity" in it &&
              typeof (it as Record<string, unknown>).id === "string" &&
              typeof (it as Record<string, unknown>).name === "string" &&
              typeof (it as Record<string, unknown>).price === "number" &&
              typeof (it as Record<string, unknown>).quantity === "number"
          ) as SaleItem[];
          if (validItems.length) {
            setSaleList(validItems);
          }
        }
        if (parsed && typeof parsed.paymentMethod === "string") {
          setPaymentMethod(parsed.paymentMethod);
        }
        if (parsed && typeof parsed.cashAmount === "string") {
          setCashAmount(parsed.cashAmount);
        }
      }
    } catch (e) {
      console.warn("POS draft parse error", e);
    } finally {
      setHydrated(true);
    }
  }, []);

  // Değişikliklerde taslağı kaydet / boşsa sil
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    try {
      if (saleList.length === 0) {
        window.localStorage.removeItem(DRAFT_KEY);
        return;
      }
      const payload = {
        items: saleList.map(({ quantity, ...rest }) => ({
          ...rest,
          quantity,
        })),
        paymentMethod,
        cashAmount,
        savedAt: Date.now(),
      };
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
    } catch (e) {
      // Yazılamazsa sessiz geç
      console.warn("POS draft save error", e);
    }
  }, [saleList, paymentMethod, cashAmount, hydrated]);

  // Toplam hesaplamaları
  const subtotal = useMemo(() => {
    return saleList.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [saleList]);

  const tax = useMemo(() => {
    return subtotal * TAX_RATE;
  }, [subtotal]);

  const totalAmount = useMemo(() => {
    return subtotal + tax;
  }, [subtotal, tax]);

  // Para üstü hesaplama
  const changeAmount = useMemo(() => {
    if (!cashAmount || paymentMethod !== "cash") return 0;
    const cash = parseFloat(cashAmount);
    return cash - totalAmount;
  }, [cashAmount, totalAmount, paymentMethod]);

  // Barkod tarama sonucunu işle
  const handleBarcodeScanned = async (barcode: string) => {
    setShowBarcodeScanner(false);

    // Önce barcode ile ürün ara
    try {
      const response = await fetch(
        `/api/products?barcode=${encodeURIComponent(barcode)}`
      );
      if (response.ok) {
        const data = await response.json();
        const products = data.products || data || [];

        if (products.length > 0) {
          const product = products[0];
          addToSale(product);
          toast.success(`${product.name} barkod ile eklendi!`);
        } else {
          // Ürün bulunamadı, manuel arama yap
          setSearchTerm(barcode);
          searchProducts(barcode);
          toast.warning(`Barkod: ${barcode} - Manuel arama yapılıyor...`);
        }
      } else {
        setSearchTerm(barcode);
        searchProducts(barcode);
        toast.warning(`Barkod taraması tamamlandı: ${barcode}`);
      }
    } catch (error) {
      console.error("Barkod arama hatası:", error);
      setSearchTerm(barcode);
      toast.error("Barkod arama hatası");
    }
  };

  // Ürün arama
  const searchProducts = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/products?query=${encodeURIComponent(query)}&limit=10`
      );
      if (response.ok) {
        const data = await response.json();
        console.log("Arama sonuçları:", data);
        setSearchResults(data.products || data || []);
      } else {
        console.error("API hatası:", response.status);
        toast.error("Ürün arama başarısız");
      }
    } catch (error) {
      console.error("Arama hatası:", error);
      toast.error("Ürün arama hatası");
    } finally {
      setIsSearching(false);
    }
  };

  // Arama input değiştiğinde
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      searchProducts(value);
    } else {
      setSearchResults([]);
    }
  };

  // Sepete ürün ekleme
  const addToSale = (product: Product) => {
    setSaleList((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
    setSearchTerm("");
    setSearchResults([]);
    toast.success(`${product.name} sepete eklendi`);
  };

  // Miktar güncelleme
  const updateQuantity = (productId: string, amount: number) => {
    setSaleList((prev) => {
      const updated = prev.map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.max(0, item.quantity + amount) }
          : item
      );
      return updated.filter((item) => item.quantity > 0);
    });
  };

  // Sepeti temizle
  const clearSale = () => {
    setSaleList([]);
    toast.success("Sepet temizlendi");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(DRAFT_KEY);
    }
  };

  // Ödeme işlemi
  const processPayment = async () => {
    if (saleList.length === 0) {
      toast.error("Sepet boş!");
      return;
    }

    // Nakit ödeme validasyonu
    if (paymentMethod === "cash") {
      if (!cashAmount || parseFloat(cashAmount) <= 0) {
        toast.error("Lütfen müşterinin verdiği parayı girin!");
        return;
      }

      if (parseFloat(cashAmount) < totalAmount) {
        toast.error("Müşterinin verdiği para toplam tutardan az olamaz!");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        items: saleList.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        paymentMethod,
        discount: 0,
        tax: tax,
        total: totalAmount,
        customerId: selectedCustomer?.id || undefined, // null yerine undefined gönder
      };

      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        if (orderResponse.status === 409) {
          let msg = "Stok değişti. Lütfen listeyi yenileyip tekrar deneyin.";
          try {
            const data = await orderResponse.json();
            if (data?.error) msg = data.error;
          } catch {}
          toast.error(msg);
          return;
        }
        let errMsg = "Sipariş kaydedilemedi.";
        try {
          const data = await orderResponse.json();
          if (data?.error) errMsg = data.error;
        } catch {
          const text = await orderResponse.text();
          console.error("Sipariş kaydetme hatası (raw):", text);
        }
        throw new Error(errMsg);
      }

      setSaleList([]);
      setShowPaymentModal(false);
      setCashAmount(""); // Para alanını temizle
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(DRAFT_KEY);
      }

      toast.success("Satış başarıyla tamamlandı!");
    } catch (error) {
      console.error("Ödeme işlemi hatası:", error);
      toast.error(
        error instanceof Error ? error.message : "Ödeme işlemi başarısız oldu."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Toaster richColors position="top-right" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
        {/* Sol Taraf: Ürün Arama ve Satış Listesi */}
        <div className="lg:col-span-2 bg-card p-4 rounded-lg shadow-md border flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Hızlı Satış</h1>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {saleList.length} ürün
              </Badge>
              {saleList.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSale}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Sepeti Temizle
                </Button>
              )}
            </div>
          </div>

          {/* Arama Kısmı */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Ürün adı veya barkod ile ara..."
                className="pl-10 text-base h-12"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                autoFocus
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin" />
              )}
            </div>
            <Button
              size="lg"
              onClick={() => setShowBarcodeScanner(true)}
              className="h-12 px-6"
              variant="outline"
            >
              <Scan className="h-5 w-5 mr-2" />
              Barkod Tara
            </Button>
          </div>

          {/* Arama Sonuçları */}
          {searchResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 max-h-60 overflow-y-auto">
              {searchResults.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => addToSale(product)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageModal({
                          isOpen: true,
                          src: product.images?.[0],
                          alt: product.name,
                          productName: product.name,
                        });
                      }}
                    >
                      <ProductImage
                        src={product.images?.[0]}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-1">
                        {product.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          {product.barcode}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          Stok: {product.stock}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-primary">
                      {formatCurrency(product.price)}
                    </p>
                    <Button size="sm" className="mt-2">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {searchTerm && !isSearching && searchResults.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Ürün bulunamadı</p>
              <p className="text-sm">Farklı bir arama terimi deneyin</p>
            </div>
          )}

          {/* Satış Listesi */}
          <div className="flex-grow overflow-y-auto border-t pt-4">
            {saleList.length > 0 ? (
              <div className="space-y-3">
                {saleList.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                          setImageModal({
                            isOpen: true,
                            src: item.images?.[0],
                            alt: item.name,
                            productName: item.name,
                          });
                        }}
                      >
                        <ProductImage
                          src={item.images?.[0]}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.price)} x {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Miktar Kontrolleri */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="h-8 w-8"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-12 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="h-8 w-8"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() =>
                            setSaleList((prev) =>
                              prev.filter((p) => p.id !== item.id)
                            )
                          }
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Satış listesi boş</p>
                <p className="text-sm">Ürün arayarak satışa başlayın</p>
              </div>
            )}
          </div>
        </div>

        {/* Sağ Taraf: Ödeme Özeti */}
        <div className="bg-card p-6 rounded-lg shadow-md border flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold mb-6">Ödeme Özeti</h2>

            {/* Müşteri Seçimi */}
            <CustomerSelector
              selectedCustomer={selectedCustomer}
              onCustomerSelect={setSelectedCustomer}
              className="mb-6"
            />

            {/* Satış Listesi Özeti */}
            {saleList.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Seçilen Ürünler
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {saleList.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => {
                            setImageModal({
                              isOpen: true,
                              src: item.images?.[0],
                              alt: item.name,
                              productName: item.name,
                            });
                          }}
                        >
                          <ProductImage
                            src={item.images?.[0]}
                            alt={item.name}
                            width={24}
                            height={24}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <span className="truncate">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">{item.quantity}x</span>
                        <span className="ml-1">
                          {formatCurrency(item.price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fiyat Detayları */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex justify-between text-lg">
                <span className="text-muted-foreground">Ara Toplam</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-muted-foreground">KDV (%20)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-2xl font-bold">
                <span>TOPLAM</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            {/* Ödeme Yöntemi */}
            <div className="mt-6">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Ödeme Yöntemi
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  return (
                    <Button
                      key={method.id}
                      variant={
                        paymentMethod === method.id ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        setPaymentMethod(method.id);
                        if (method.id !== "cash") {
                          setCashAmount("");
                        }
                      }}
                      className="flex flex-col h-16"
                    >
                      <Icon className="h-4 w-4 mb-1" />
                      <span className="text-xs">{method.name}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full h-16 text-xl mt-6"
            disabled={saleList.length === 0}
            onClick={() => setShowPaymentModal(true)}
          >
            <DollarSign className="mr-2 h-6 w-6" />
            Ödemeye Geç
          </Button>
        </div>
      </div>

      {/* Barkod Scanner Modal */}
      {showBarcodeScanner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="max-w-4xl w-full mx-4">
            <BarcodeScanner
              title="POS Barkod Tarayıcı"
              onScan={handleBarcodeScanned}
              onClose={() => setShowBarcodeScanner(false)}
              enableTestBarcodes={true}
            />
          </div>
        </div>
      )}

      {/* Ödeme Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[95vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Ödeme</h2>

            {/* Satış Listesi */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Satış Listesi
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {saleList.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 bg-muted/30 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                          setImageModal({
                            isOpen: true,
                            src: item.images?.[0],
                            alt: item.name,
                            productName: item.name,
                          });
                        }}
                      >
                        <ProductImage
                          src={item.images?.[0]}
                          alt={item.name}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} x {formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fiyat Detayları */}
            <div className="space-y-2 border-t pt-4 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ara Toplam</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">KDV (%20)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-xl font-bold">
                <span>TOPLAM</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>

              {/* Nakit Ödeme Alanı */}
              {paymentMethod === "cash" && (
                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Müşterinin verdiği para"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCashAmount(totalAmount.toString())}
                    >
                      Tam
                    </Button>
                  </div>

                  {cashAmount && parseFloat(cashAmount) > 0 && (
                    <div className="space-y-2 bg-muted/30 p-3 rounded">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Müşterinin Verdiği
                        </span>
                        <span className="font-medium">
                          {formatCurrency(parseFloat(cashAmount))}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Toplam Tutar
                        </span>
                        <span className="font-medium">
                          {formatCurrency(totalAmount)}
                        </span>
                      </div>
                      <div className="border-t pt-2 flex justify-between text-lg font-bold">
                        <span>Para Üstü</span>
                        <span
                          className={
                            changeAmount >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {formatCurrency(changeAmount)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Butonlar */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowPaymentModal(false)}
                className="flex-1"
              >
                İptal
              </Button>
              <Button
                onClick={processPayment}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <DollarSign className="mr-2 h-4 w-4" />
                )}
                {isSubmitting ? "İşleniyor..." : "Ödemeyi Tamamla"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Product Image Modal */}
      <ProductImageModal
        src={imageModal.src}
        alt={imageModal.alt}
        productName={imageModal.productName}
        isOpen={imageModal.isOpen}
        onClose={() =>
          setImageModal({ isOpen: false, src: "", alt: "", productName: "" })
        }
      />
    </>
  );
}
