"use client";

import { useState, useEffect } from "react";
import { Search, Plus, User, Phone, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formatters";

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: Date;
  frequentBuyer?: boolean;
}

interface CustomerSelectorProps {
  selectedCustomer: Customer | null;
  onCustomerSelect: (customer: Customer | null) => void;
  className?: string;
}

export default function CustomerSelector({
  selectedCustomer,
  onCustomerSelect,
  className = "",
}: CustomerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Customer search
  const searchCustomers = async (query: string) => {
    if (!query || query.length < 2) {
      setCustomers([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/customers?q=${encodeURIComponent(query)}&limit=10`
      );
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || []);
      } else {
        console.error("Customer search failed:", response.status);
      }
    } catch (error) {
      console.error("Customer search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const timeoutId = setTimeout(() => {
        searchCustomers(searchTerm);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setCustomers([]);
    }
  }, [searchTerm]);

  const CustomerItem = ({ customer }: { customer: Customer }) => (
    <div
      className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg cursor-pointer"
      onClick={() => {
        onCustomerSelect(customer);
        setIsOpen(false);
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{customer.name}</span>
            {customer.frequentBuyer && (
              <Badge variant="secondary" className="text-xs">
                Sadık Müşteri
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {customer.phone}
            </span>
            {customer.totalOrders && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {customer.totalOrders} sipariş
              </span>
            )}
          </div>
        </div>
      </div>
      {customer.totalSpent && (
        <div className="text-right">
          <div className="font-medium text-sm">
            {formatCurrency(customer.totalSpent)}
          </div>
          <div className="text-xs text-muted-foreground">toplam</div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-muted-foreground">
        Müşteri Seçimi (Opsiyonel)
      </label>

      <div className="relative">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between h-12"
        >
          {selectedCustomer ? (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="truncate">{selectedCustomer.name}</span>
              {selectedCustomer.frequentBuyer && (
                <Badge variant="secondary" className="text-xs">
                  ★
                </Badge>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">
              Müşteri yok (Opsiyonel)
            </span>
          )}
          <div className="flex items-center gap-1">
            {selectedCustomer && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onCustomerSelect(null);
                }}
                className="h-6 w-6 p-0 hover:bg-destructive/10"
              >
                <X className="h-3 w-3 text-destructive" />
              </Button>
            )}
            <Search className="h-4 w-4 opacity-50" />
          </div>
        </Button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-background border rounded-md shadow-lg max-h-[400px] overflow-y-auto">
            <div className="flex items-center border-b p-3">
              <Search className="h-4 w-4 text-muted-foreground mr-2" />
              <Input
                placeholder="İsim veya telefon ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 focus:ring-0 p-0"
              />
            </div>

            {/* Müşteri Ekle Butonu */}
            <div className="p-3 border-b">
              <Button
                onClick={() => {
                  setShowAddDialog(true);
                  setIsOpen(false);
                }}
                className="w-full gap-2 bg-primary hover:bg-primary/90"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                Müşteri Ekle
              </Button>
            </div>

            <div className="max-h-[250px] overflow-y-auto">
              {isLoading && (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              )}

              {!isLoading && searchTerm && customers.length === 0 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  "{searchTerm}" için müşteri bulunamadı
                </div>
              )}

              {customers.map((customer) => (
                <CustomerItem key={customer.id} customer={customer} />
              ))}

              {!searchTerm && customers.length === 0 && !isLoading && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Müşteri aramak için 2+ karakter yazın
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Müşteri Ekleme Dialog'u */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-background p-6 rounded-lg max-w-md w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Yeni Müşteri Ekle</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddDialog(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <AddCustomerForm
              onSuccess={(newCustomer) => {
                setShowAddDialog(false);
                onCustomerSelect(newCustomer);
                setCustomers((prev) => [newCustomer, ...prev]);
              }}
              onCancel={() => setShowAddDialog(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Müşteri ekleme formu bileşeni
function AddCustomerForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: (customer: Customer) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setError("İsim ve telefon zorunludur");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Müşteri eklenemedi");
      }

      const result = await response.json();
      const newCustomer: Customer = {
        id: result.customer.id,
        name: result.customer.name,
        phone: result.customer.phone,
        email: result.customer.email,
        address: result.customer.address,
        totalOrders: 0,
        totalSpent: 0,
        frequentBuyer: false,
      };

      onSuccess(newCustomer);
    } catch (error) {
      console.error("Müşteri ekleme hatası:", error);
      setError(error instanceof Error ? error.message : "Müşteri eklenemedi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">
          İsim Soyisim <span className="text-destructive">*</span>
        </label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Müşteri adı soyadı"
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Telefon <span className="text-destructive">*</span>
        </label>
        <Input
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="05xxxxxxxxx"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Ekleniyor...
            </>
          ) : (
            "Ekle"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          İptal
        </Button>
      </div>
    </form>
  );
}
