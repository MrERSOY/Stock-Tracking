// app/dashboard/quick-create/page.tsx
import type { Metadata } from "next";
import { PlusCircle, UserPlus, PackagePlus, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Hızlı Oluştur | Dashboard",
};

export default function QuickCreatePage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <PlusCircle className="w-8 h-8 text-gray-700" />
        <h1 className="text-3xl font-bold">Hızlı Oluştur</h1>
      </div>
      <p className="text-gray-600 mb-8">
        Sık kullanılan işlemleri buradan hızlıca başlatın.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Yeni Ürün Ekle Kartı */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer">
          <PackagePlus className="w-10 h-10 text-blue-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Yeni Ürün Ekle</h2>
          <p className="text-gray-500">Stoklarınıza yeni bir ürün kaydedin.</p>
        </div>

        {/* Yeni Kullanıcı Ekle Kartı */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer">
          <UserPlus className="w-10 h-10 text-green-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Yeni Kullanıcı Davet Et
          </h2>
          <p className="text-gray-500">Ekibinize yeni bir üye davet edin.</p>
        </div>

        {/* Yeni Rapor Oluştur Kartı */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer">
          <FileText className="w-10 h-10 text-purple-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Yeni Rapor Oluştur</h2>
          <p className="text-gray-500">Satış veya envanter raporu oluşturun.</p>
        </div>
      </div>
    </div>
  );
}
