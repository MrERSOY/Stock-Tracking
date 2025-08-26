// app/dashboard/products/scan/page.tsx
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Camera, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// Basit BarcodeScanner bileşeni
function BarcodeScanner({
  onScanSuccess,
}: {
  onScanSuccess: (barcode: string) => void;
}) {
  const [manualBarcode, setManualBarcode] = useState("");

  const handleManualSubmit = () => {
    if (manualBarcode.trim()) {
      onScanSuccess(manualBarcode.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleManualSubmit();
    }
  };

  return (
    <div className="w-full max-w-md space-y-4">
      {/* Kamera Simülasyonu */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center">
            <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-sm opacity-75">Kamera simülasyonu</p>
          </div>
        </div>

        {/* Tarama Çerçevesi */}
        <div className="absolute inset-4 border-2 border-green-400 rounded-lg">
          <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-green-400"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-green-400"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-green-400"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-green-400"></div>
        </div>
      </div>

      {/* Manuel Barkod Girişi */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Manuel Barkod Girişi
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Barkod numarasını girin..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            onClick={handleManualSubmit}
            disabled={!manualBarcode.trim()}
            size="sm"
          >
            Tara
          </Button>
        </div>
      </div>

      {/* Test Barkodları */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Test Barkodları
        </label>
        <div className="flex flex-wrap gap-2">
          {["123456789", "987654321", "456789123"].map((barcode) => (
            <Button
              key={barcode}
              variant="outline"
              size="sm"
              onClick={() => onScanSuccess(barcode)}
            >
              {barcode}
            </Button>
          ))}
        </div>
      </div>

      {/* Bilgi */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <div className="flex items-start">
          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Barkod Tarama</p>
            <p className="text-xs mt-1">
              Gerçek kamera entegrasyonu için bir barkod tarama kütüphanesi
              (örn: QuaggaJS, ZXing) kullanılması gerekir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ScanPage() {
  const router = useRouter();

  const handleScanSuccess = (barcode: string) => {
    console.log(`Barkod okundu: ${barcode}`);
    router.push(`/dashboard/products/new?barcode=${barcode}`);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-screen">
      <div className="w-full max-w-md mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Barkodu Tara</h1>
        <Link href="/dashboard/products">
          <Button variant="ghost" size="sm">
            <ChevronLeft size={16} className="mr-1" />
            Geri Dön
          </Button>
        </Link>
      </div>

      <p className="text-center text-gray-600 mb-6 max-w-md">
        Ürün barkodunu kameranın görüş alanındaki yeşil kesikli çizginin içine
        hizalayın veya manuel olarak girin.
      </p>

      <BarcodeScanner onScanSuccess={handleScanSuccess} />
    </div>
  );
}
