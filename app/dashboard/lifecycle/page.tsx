// app/dashboard/lifecycle/page.tsx
import type { Metadata } from "next";
import { Recycle, AlertTriangle, PackageCheck, PackageX } from "lucide-react";

export const metadata: Metadata = {
  title: "Stok Takibi | Dashboard",
};

// Örnek Stok Hareketleri Verisi
const stockMovements = [
  {
    id: "sm001",
    product: "Akıllı Telefon X1 Pro",
    type: "Giriş",
    quantity: 50,
    date: "01.06.2024",
    reason: "Yeni Sevkiyat",
  },
  {
    id: "sm002",
    product: "Kablosuz Kulaklık AirSound",
    type: "Çıkış",
    quantity: -20,
    date: "01.06.2024",
    reason: "Satış Siparişi #S1234",
  },
  {
    id: "sm003",
    product: "Yoga Matı Kaymaz Yüzey",
    type: "Giriş",
    quantity: 100,
    date: "31.05.2024",
    reason: "Yeni Sevkiyat",
  },
  {
    id: "sm004",
    product: "Ofis Sandalyesi Ergonomik",
    type: "Düzeltme",
    quantity: -1,
    date: "30.05.2024",
    reason: "Hasarlı Ürün",
  },
  {
    id: "sm005",
    product: "Akıllı Saat FitPro 5",
    type: "Çıkış",
    quantity: -15,
    date: "30.05.2024",
    reason: "Satış Siparişi #S1230",
  },
];

export default function LifecyclePage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Recycle className="w-8 h-8 text-gray-700" />
        <h1 className="text-3xl font-bold">Stok Takibi (Lifecycle)</h1>
      </div>
      <p className="text-gray-600 mb-8">
        Envanterinizin genel durumu ve son stok hareketlerini buradan takip
        edin.
      </p>

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-lg shadow">
          <h3 className="text-md font-medium text-gray-500">
            Toplam Stok Değeri
          </h3>
          <p className="text-3xl font-semibold mt-2">₺1,450,230</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow">
          <h3 className="text-md font-medium text-gray-500">
            Kritik Stoktaki Ürünler
          </h3>
          <p className="text-3xl font-semibold text-red-500 mt-2 flex items-center gap-2">
            <AlertTriangle size={28} /> 12
          </p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow">
          <h3 className="text-md font-medium text-gray-500">
            Bugünkü Stok Girişi
          </h3>
          <p className="text-3xl font-semibold text-green-500 mt-2 flex items-center gap-2">
            <PackageCheck size={28} /> 50
          </p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow">
          <h3 className="text-md font-medium text-gray-500">
            Bugünkü Stok Çıkışı
          </h3>
          <p className="text-3xl font-semibold text-orange-500 mt-2 flex items-center gap-2">
            <PackageX size={28} /> 35
          </p>
        </div>
      </div>

      {/* Son Stok Hareketleri Tablosu */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Son Hareketler
      </h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ürün
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Hareket Tipi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Miktar
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tarih
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Açıklama
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stockMovements.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.product}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`font-semibold ${
                      item.type === "Giriş"
                        ? "text-green-600"
                        : item.type === "Çıkış"
                        ? "text-orange-600"
                        : "text-gray-600"
                    }`}
                  >
                    {item.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                  {item.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.reason}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
