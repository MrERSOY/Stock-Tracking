"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  User,
  Phone,
  Mail,
  Eye,
  EyeOff,
  Users,
  ShoppingBag,
  Calendar,
} from "lucide-react";
import Link from "next/link";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalOrders: number;
  frequentBuyer: boolean;
  createdAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [visiblePhones, setVisiblePhones] = useState<Set<string>>(new Set());

  // Telefon görünürlüğünü toggle et
  const togglePhoneVisibility = (customerId: string) => {
    setVisiblePhones((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(customerId)) {
        newSet.delete(customerId);
      } else {
        newSet.add(customerId);
      }
      return newSet;
    });
  };

  // Telefon numarasını maskele
  const maskPhone = (phone: string) => {
    if (phone.length <= 4) return phone;
    return phone.slice(0, 3) + "*".repeat(phone.length - 6) + phone.slice(-3);
  };

  // Müşteri arama - debounced
  const searchCustomers = async (query: string = "") => {
    setIsLoading(true);
    try {
      const url = query.trim()
        ? `/api/customers?q=${encodeURIComponent(query)}&limit=50`
        : `/api/customers?limit=50`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || []);
      }
    } catch (error) {
      // Müşteri arama hatası
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchCustomers(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    searchCustomers(); // İlk yüklemede tüm müşterileri getir
  }, []);

  // İstatistikler
  const stats = {
    total: customers.length,
    frequent: customers.filter((c) => c.frequentBuyer).length,
    thisMonth: customers.filter((c) => {
      const created = new Date(c.createdAt);
      const now = new Date();
      return (
        created.getMonth() === now.getMonth() &&
        created.getFullYear() === now.getFullYear()
      );
    }).length,
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Müşteri Yönetimi
          </h1>
          <p className="text-muted-foreground mt-1">
            Müşteri bilgilerini yönetin ve satış geçmişlerini takip edin
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="gap-2 shadow-md hover:shadow-lg transition-shadow"
        >
          <Plus className="h-4 w-4" />
          Yeni Müşteri
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Müşteri ara (isim, telefon)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Toplam Müşteri
                </p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {stats.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  Sadık Müşteri
                </p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                  {stats.frequent}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  Bu Ay Yeni
                </p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                  {stats.thisMonth}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-200 dark:bg-purple-800 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Müşteriler yükleniyor...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-12">
          <User className="h-16 w-16 mx-auto text-muted-foreground/50" />
          <h3 className="text-xl font-semibold mt-4">Müşteri bulunamadı</h3>
          <p className="text-muted-foreground mt-2">
            {searchTerm
              ? "Arama kriterlerinize uygun müşteri yok"
              : "Henüz müşteri eklenmemiş"}
          </p>
          {!searchTerm && (
            <Button
              onClick={() => setShowAddModal(true)}
              className="mt-4 gap-2"
            >
              <Plus className="h-4 w-4" />
              İlk Müşteriyi Ekle
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((customer) => (
            <Card
              key={customer.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{customer.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        {customer.frequentBuyer && (
                          <Badge variant="secondary" className="text-xs">
                            ⭐ Sadık Müşteri
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Link href={`/dashboard/customers/${customer.id}`}>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm group">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono">
                    {visiblePhones.has(customer.id)
                      ? customer.phone
                      : maskPhone(customer.phone)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePhoneVisibility(customer.id);
                    }}
                  >
                    {visiblePhones.has(customer.id) ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </Button>
                </div>

                {customer.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 pt-3 border-t">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Toplam Sipariş
                    </p>
                    <p className="font-semibold">{customer.totalOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <AddCustomerModal
          onClose={() => setShowAddModal(false)}
          onCustomerAdded={() => {
            setShowAddModal(false);
            searchCustomers(searchTerm);
          }}
        />
      )}
    </div>
  );
}

// Basit müşteri ekleme modal
function AddCustomerModal({
  onClose,
  onCustomerAdded,
}: {
  onClose: () => void;
  onCustomerAdded: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.phone.trim()) {
      alert("İsim ve telefon zorunludur!");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Müşteri eklenemedi");
      }

      onCustomerAdded();
    } catch (error) {
      // Müşteri ekleme hatası
      alert(error instanceof Error ? error.message : "Müşteri eklenemedi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg">
        <div className="flex flex-col space-y-1.5">
          <h3 className="text-lg font-semibold">Yeni Müşteri Ekle</h3>
          <p className="text-sm text-muted-foreground">
            Sadece isim ve telefon yeterli
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">İsim Soyisim *</label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Müşteri adı soyadı"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Telefon *</label>
            <Input
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="05XX XXX XX XX"
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={
                isSubmitting || !formData.name.trim() || !formData.phone.trim()
              }
            >
              {isSubmitting ? "Ekleniyor..." : "Müşteri Ekle"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
