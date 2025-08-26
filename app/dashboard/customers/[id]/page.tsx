"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  ShoppingBag,
  Calendar,
  Receipt,
  Package,
  Eye,
  EyeOff,
  Search,
  Filter,
  ChevronDown,
  CreditCard,
  Banknote,
  Clock,
  Star,
  TrendingUp,
  MapPin,
  UserCheck,
  Hash,
  ChevronUp,
  Building,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import Link from "next/link";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  frequentBuyer: boolean;
  averageOrderValue: number;
  createdAt: string;
}

interface Order {
  id: string;
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  items?: {
    id: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [isOrderHistoryExpanded, setIsOrderHistoryExpanded] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  // Telefon numarasını maskele
  const maskPhone = (phone: string) => {
    if (phone.length <= 4) return phone;
    return phone.slice(0, 3) + "*".repeat(phone.length - 6) + phone.slice(-3);
  };

  // Sipariş genişletme/küçültme
  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  // Filtrelenmiş ve sıralanmış siparişler
  const filteredOrders = Array.isArray(orders)
    ? orders
        .filter((order) => {
          const matchesSearch =
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.items?.some((item) =>
              item.productName.toLowerCase().includes(searchTerm.toLowerCase())
            );
          const matchesStatus =
            statusFilter === "all" || order.status === statusFilter;
          return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
          switch (sortBy) {
            case "date":
              return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
              );
            case "amount":
              return b.total - a.total;
            case "items":
              return (b.items?.length || 0) - (a.items?.length || 0);
            default:
              return 0;
          }
        })
    : [];

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        // Müşteri bilgilerini fetch et
        const customerResponse = await fetch(`/api/customers/${customerId}`);
        if (customerResponse.ok) {
          const customerData = await customerResponse.json();
          setCustomer(customerData);
        }

        // Siparişleri fetch et
        const ordersResponse = await fetch(
          `/api/orders?customerId=${customerId}`
        );
        if (ordersResponse.ok) {
          const ordersResult = await ordersResponse.json();
          // API { success: true, orders: [] } formatında döndürüyor
          setOrders(ordersResult.orders || []);
        }
      } catch (error) {
        console.error("Veri yüklenirken hata:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerData();
  }, [customerId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Müşteri bilgileri yükleniyor...
          </p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <User className="h-16 w-16 mx-auto text-muted-foreground/50" />
        <h3 className="text-lg font-semibold mt-4">Müşteri bulunamadı</h3>
        <p className="text-muted-foreground">
          Aradığınız müşteri mevcut değil veya silinmiş olabilir.
        </p>
        <Button className="mt-4" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri Dön
        </Button>
      </div>
    );
  }

  const monthlyOrders = Array.isArray(orders)
    ? orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        const currentDate = new Date();
        return (
          orderDate.getMonth() === currentDate.getMonth() &&
          orderDate.getFullYear() === currentDate.getFullYear()
        );
      }).length
    : 0;

  const monthlyTotal = Array.isArray(orders)
    ? orders
        .filter((order) => {
          const orderDate = new Date(order.createdAt);
          const currentDate = new Date();
          return (
            orderDate.getMonth() === currentDate.getMonth() &&
            orderDate.getFullYear() === currentDate.getFullYear()
          );
        })
        .reduce((sum, order) => sum + order.total, 0)
    : 0;

  const lastOrder =
    Array.isArray(orders) && orders.length > 0 ? orders[0] : null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{customer.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={customer.frequentBuyer ? "default" : "secondary"}>
                {customer.frequentBuyer ? "Sadık Müşteri" : "Yeni Müşteri"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                #{customer.id.slice(-8)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/pos?customer=${customer.id}`}>
            <Button className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              Satış Yap
            </Button>
          </Link>
        </div>
      </div>

      {/* Detaylı Müşteri Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Müşteri Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Kişisel Bilgiler */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-blue-500" />
                Kişisel Bilgiler
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Müşteri ID</p>
                    <p className="font-medium">{customer.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ad Soyad</p>
                    <p className="font-medium">{customer.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Telefon</p>
                      <p className="font-medium">
                        {showPhone ? customer.phone : maskPhone(customer.phone)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPhone(!showPhone)}
                      className="h-6 w-6 p-0"
                    >
                      {showPhone ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>

                {customer.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">E-posta</p>
                      <p className="font-medium">{customer.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Adres Bilgileri */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-500" />
                Adres Bilgileri
              </h3>

              <div className="space-y-3">
                {customer.address ? (
                  <div className="flex items-start gap-3">
                    <Building className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Adres</p>
                      <p className="font-medium leading-relaxed">
                        {customer.address}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Building className="h-4 w-4" />
                    <p className="text-sm">Adres bilgisi bulunmuyor</p>
                  </div>
                )}
              </div>
            </div>

            {/* Hesap Bilgileri */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-500" />
                Hesap Bilgileri
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Kayıt Tarihi
                    </p>
                    <p className="font-medium">
                      {new Date(customer.createdAt).toLocaleDateString(
                        "tr-TR",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Toplam Sipariş
                    </p>
                    <p className="font-medium">
                      {customer.totalOrders} sipariş
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Toplam Harcama
                    </p>
                    <p className="font-medium text-primary">
                      {formatCurrency(customer.totalSpent)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Ortalama Sipariş
                    </p>
                    <p className="font-medium">
                      {formatCurrency(customer.averageOrderValue)}
                    </p>
                  </div>
                </div>

                {lastOrder && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Son Sipariş
                      </p>
                      <p className="font-medium text-sm">
                        {new Date(lastOrder.createdAt).toLocaleDateString(
                          "tr-TR"
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(lastOrder.total)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Genişletilebilir Alışveriş Geçmişi */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Alışveriş Geçmişi ({filteredOrders.length})
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setIsOrderHistoryExpanded(!isOrderHistoryExpanded)
                }
                className="gap-2"
              >
                {isOrderHistoryExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Küçült
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Genişlet
                  </>
                )}
              </Button>
            </div>

            {isOrderHistoryExpanded && (
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Sipariş ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Durum
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                      Tümü
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("PAID")}>
                      Ödendi
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("PENDING")}
                    >
                      Bekliyor
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      Sırala
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSortBy("date")}>
                      Tarihe Göre
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("amount")}>
                      Tutara Göre
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("items")}>
                      Ürün Sayısına Göre
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </CardHeader>

        {isOrderHistoryExpanded && (
          <CardContent>
            {filteredOrders.length === 0 ? (
              searchTerm || statusFilter !== "all" ? (
                <div className="text-center py-12">
                  <Search className="h-20 w-20 mx-auto text-muted-foreground/30" />
                  <h3 className="text-xl font-semibold mt-6">
                    Sonuç bulunamadı
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    Arama kriterlerinize uygun sipariş bulunamadı
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                  >
                    Filtreleri Temizle
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingBag className="h-20 w-20 mx-auto text-muted-foreground/30" />
                  <h3 className="text-xl font-semibold mt-6">
                    Henüz sipariş yok
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    Bu müşterinin sipariş geçmişi bulunmuyor
                  </p>
                  <Link href={`/dashboard/pos?customer=${customer.id}`}>
                    <Button className="mt-6 gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      İlk Siparişi Oluştur
                    </Button>
                  </Link>
                </div>
              )
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const isExpanded = expandedOrders.has(order.id);
                  return (
                    <div
                      key={order.id}
                      className="border rounded-xl bg-card transition-all duration-200 hover:shadow-md"
                    >
                      {/* Kompakt Sipariş Başlığı */}
                      <div
                        className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => toggleOrderExpansion(order.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                              <Receipt className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg">
                                #{order.id}
                              </h4>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {new Date(order.createdAt).toLocaleDateString(
                                  "tr-TR",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                                <span className="mx-1">•</span>
                                <span>{order.items?.length || 0} ürün</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-bold text-xl text-primary">
                                {formatCurrency(order.total)}
                              </p>
                              <div className="flex items-center gap-2 justify-end">
                                <Badge
                                  variant={
                                    order.status === "PAID"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {order.status === "PAID"
                                    ? "✓ Ödendi"
                                    : order.status}
                                </Badge>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  {order.paymentMethod === "card" ? (
                                    <CreditCard className="h-3 w-3" />
                                  ) : (
                                    <Banknote className="h-3 w-3" />
                                  )}
                                  {order.paymentMethod === "card"
                                    ? "Kart"
                                    : "Nakit"}
                                </div>
                              </div>
                            </div>

                            <Button variant="ghost" size="sm" className="ml-2">
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Genişletilebilir Detay Bölümü */}
                      {isExpanded && (
                        <div className="border-t bg-muted/20">
                          <div className="p-6 space-y-6">
                            {/* Order Stats */}
                            <div className="grid grid-cols-3 gap-4">
                              <div className="text-center p-4 bg-background rounded-lg border">
                                <Package className="h-5 w-5 text-blue-500 mx-auto mb-2" />
                                <p className="font-bold text-lg">
                                  {order.items?.length || 0}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Ürün Çeşidi
                                </p>
                              </div>
                              <div className="text-center p-4 bg-background rounded-lg border">
                                <Star className="h-5 w-5 text-yellow-500 mx-auto mb-2" />
                                <p className="font-bold text-lg">
                                  {order.items?.reduce(
                                    (sum, item) => sum + item.quantity,
                                    0
                                  ) || 0}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Toplam Adet
                                </p>
                              </div>
                              <div className="text-center p-4 bg-background rounded-lg border">
                                <TrendingUp className="h-5 w-5 text-green-500 mx-auto mb-2" />
                                <p className="font-bold text-lg">
                                  {formatCurrency(
                                    order.total /
                                      (order.items?.reduce(
                                        (sum, item) => sum + item.quantity,
                                        0
                                      ) || 1)
                                  )}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Ortalama Fiyat
                                </p>
                              </div>
                            </div>

                            {/* Order Items */}
                            <div className="space-y-3">
                              <h5 className="font-semibold text-lg flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Sipariş Detayları
                              </h5>
                              {order.items?.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between p-3 bg-background rounded-lg border"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                      <Package className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                      <p className="font-semibold">
                                        {item.productName}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        Birim fiyat:{" "}
                                        {formatCurrency(item.price)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="flex items-center gap-2">
                                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm font-bold">
                                        {item.quantity}x
                                      </span>
                                      <span className="font-bold">
                                        {formatCurrency(
                                          item.price * item.quantity
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Order Actions */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between pt-4 border-t gap-4">
                              <div className="text-sm text-muted-foreground">
                                <span className="font-medium">Sipariş ID:</span>{" "}
                                {order.id}
                              </div>
                              <div className="flex items-center gap-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-2"
                                >
                                  <Receipt className="h-4 w-4" />
                                  Fatura Yazdır
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-2"
                                >
                                  <Eye className="h-4 w-4" />
                                  Detaylı Görünüm
                                </Button>
                                <Button size="sm" className="gap-2">
                                  <ShoppingBag className="h-4 w-4" />
                                  Tekrar Sipariş Ver
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
