"use client";

import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { Receipt, Store, Phone, Mail, MapPin } from "lucide-react";

interface InvoiceProps {
  order: {
    id: string;
    total: number;
    tax: number;
    discount: number;
    createdAt: Date;
    paymentMethod: string;
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
    }>;
    customer?: {
      name?: string;
      email?: string;
      phone?: string;
    };
  };
}

export function Invoice({ order }: InvoiceProps) {
  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const total = order.total;

  const paymentMethodLabels = {
    cash: "Nakit",
    card: "Kredi Kartı",
    transfer: "Havale/EFT",
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
      {/* Fatura Başlığı */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Store className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Mağaza Yönetimi</h1>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>İstanbul, Türkiye</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>+90 (212) 555-0123</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>info@magazayonetimi.com</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">FATURA</h2>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <div>Fatura No: {order.id}</div>
            <div>Tarih: {formatDateTime(order.createdAt)}</div>
            <div>
              Ödeme:{" "}
              {paymentMethodLabels[
                order.paymentMethod as keyof typeof paymentMethodLabels
              ] || "Bilinmiyor"}
            </div>
          </div>
        </div>
      </div>

      {/* Müşteri Bilgileri */}
      {order.customer && (
        <div className="mb-8 p-4 bg-muted/30 rounded-lg">
          <h3 className="font-semibold mb-2">Müşteri Bilgileri</h3>
          <div className="text-sm space-y-1">
            {order.customer.name && <div>Ad Soyad: {order.customer.name}</div>}
            {order.customer.email && <div>E-posta: {order.customer.email}</div>}
            {order.customer.phone && <div>Telefon: {order.customer.phone}</div>}
          </div>
        </div>
      )}

      {/* Ürün Listesi */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 font-semibold">Ürün</th>
              <th className="text-center py-2 font-semibold">Adet</th>
              <th className="text-right py-2 font-semibold">Birim Fiyat</th>
              <th className="text-right py-2 font-semibold">Toplam</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="py-3">{item.name}</td>
                <td className="py-3 text-center">{item.quantity}</td>
                <td className="py-3 text-right">
                  {formatCurrency(item.price)}
                </td>
                <td className="py-3 text-right font-semibold">
                  {formatCurrency(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Toplam Hesaplama */}
      <div className="border-t pt-4">
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Ara Toplam:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>İndirim:</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span>KDV (%20):</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>TOPLAM:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alt Bilgi */}
      <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
        <p>Teşekkür ederiz!</p>
        <p>Bu bir elektronik faturadır.</p>
      </div>
    </div>
  );
}
