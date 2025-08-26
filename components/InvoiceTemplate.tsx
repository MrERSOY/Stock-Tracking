"use client";

import { formatCurrency } from "@/lib/formatters";

interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceType: "e-fatura" | "e-arsiv" | "irsaliye";
  issuedAt: Date;
  dueDate: Date;
  customer: Customer | null;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string;
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    taxNumber: string;
    taxOffice: string;
  };
}

interface InvoiceTemplateProps {
  data: InvoiceData;
  onPrint?: () => void;
  onDownload?: () => void;
}

export default function InvoiceTemplate({
  data,
  onPrint,
  onDownload,
}: InvoiceTemplateProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("tr-TR");
  };

  const calculateSubtotal = () => {
    return data.items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  return (
    <div
      className="bg-white p-8 max-w-4xl mx-auto shadow-lg"
      ref={onPrint ? () => onPrint() : undefined}
    >
      {/* Fatura Başlığı */}
      <div className="border-b-2 border-gray-800 pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {data.invoiceType === "e-fatura"
                ? "E-FATURA"
                : data.invoiceType === "e-arsiv"
                ? "E-ARŞİV FATURA"
                : "İRSALİYE"}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Fatura No: {data.invoiceNumber}
            </p>
            <p className="text-sm text-gray-600">
              Tarih: {formatDate(data.issuedAt)}
            </p>
            <p className="text-sm text-gray-600">
              Vade: {formatDate(data.dueDate)}
            </p>
          </div>

          <div className="text-right">
            <div className="w-32 h-32 bg-gray-100 border-2 border-gray-300 flex items-center justify-center">
              <span className="text-xs text-gray-500 text-center">
                QR Kod
                <br />
                (E-Arşiv için)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Firma ve Müşteri Bilgileri */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        {/* Firma Bilgileri */}
        <div>
          <h3 className="font-bold text-lg mb-3 text-gray-800">SATICI</h3>
          <div className="space-y-1 text-sm">
            <p className="font-semibold">{data.companyInfo.name}</p>
            <p>{data.companyInfo.address}</p>
            <p>Tel: {data.companyInfo.phone}</p>
            <p>E-posta: {data.companyInfo.email}</p>
            <p>Vergi No: {data.companyInfo.taxNumber}</p>
            <p>Vergi Dairesi: {data.companyInfo.taxOffice}</p>
          </div>
        </div>

        {/* Müşteri Bilgileri */}
        <div>
          <h3 className="font-bold text-lg mb-3 text-gray-800">ALICI</h3>
          {data.customer ? (
            <div className="space-y-1 text-sm">
              <p className="font-semibold">{data.customer.name}</p>
              {data.customer.address && <p>{data.customer.address}</p>}
              <p>Tel: {data.customer.phone}</p>
              {data.customer.email && <p>E-posta: {data.customer.email}</p>}
              <p>TC/Vergi No: {data.customer.id}</p>
            </div>
          ) : (
            <div className="space-y-1 text-sm">
              <p className="font-semibold">Bilinmeyen Müşteri</p>
              <p>TC/Vergi No: Belirtilmemiş</p>
            </div>
          )}
        </div>
      </div>

      {/* Ürün Tablosu */}
      <div className="mb-6">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left text-sm font-semibold">
                Sıra
              </th>
              <th className="border border-gray-300 p-2 text-left text-sm font-semibold">
                Ürün/Hizmet
              </th>
              <th className="border border-gray-300 p-2 text-center text-sm font-semibold">
                Miktar
              </th>
              <th className="border border-gray-300 p-2 text-center text-sm font-semibold">
                Birim Fiyat
              </th>
              <th className="border border-gray-300 p-2 text-center text-sm font-semibold">
                KDV %
              </th>
              <th className="border border-gray-300 p-2 text-center text-sm font-semibold">
                Toplam
              </th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-2 text-sm">
                  {index + 1}
                </td>
                <td className="border border-gray-300 p-2 text-sm font-medium">
                  {item.productName}
                </td>
                <td className="border border-gray-300 p-2 text-sm text-center">
                  {item.quantity}
                </td>
                <td className="border border-gray-300 p-2 text-sm text-right">
                  {formatCurrency(item.unitPrice)}
                </td>
                <td className="border border-gray-300 p-2 text-sm text-center">
                  %20
                </td>
                <td className="border border-gray-300 p-2 text-sm text-right font-semibold">
                  {formatCurrency(item.totalPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Toplam Bilgileri */}
      <div className="flex justify-end">
        <div className="w-80 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Ara Toplam:</span>
            <span>{formatCurrency(calculateSubtotal())}</span>
          </div>
          {data.discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span>İndirim:</span>
              <span>-{formatCurrency(data.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span>KDV (%20):</span>
            <span>{formatCurrency(data.taxAmount)}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-bold text-lg">
            <span>GENEL TOPLAM:</span>
            <span>{formatCurrency(data.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Ödeme Bilgileri */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2">Ödeme Bilgileri</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Ödeme Yöntemi:</span>
            <span className="ml-2">
              {data.paymentMethod === "cash" ? "Nakit" : "Kart"}
            </span>
          </div>
          <div>
            <span className="font-medium">Fatura Türü:</span>
            <span className="ml-2">{data.invoiceType.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Yasal Uyarılar */}
      <div className="mt-6 text-xs text-gray-600 space-y-1">
        <p>• Bu fatura elektronik ortamda oluşturulmuştur.</p>
        <p>• E-Arşiv faturaları Maliye Bakanlığı sisteminde saklanmaktadır.</p>
        <p>• Fatura içeriği değiştirilemez ve üzerinde oynama yapılamaz.</p>
        <p>• Sorularınız için: {data.companyInfo.phone}</p>
      </div>

      {/* Butonlar */}
      {(onPrint || onDownload) && (
        <div className="mt-6 flex gap-4 justify-center">
          {onPrint && (
            <button
              onClick={onPrint}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Yazdır
            </button>
          )}
          {onDownload && (
            <button
              onClick={onDownload}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              PDF İndir
            </button>
          )}
        </div>
      )}
    </div>
  );
}
