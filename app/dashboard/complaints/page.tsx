// app/dashboard/complaints/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Şikayetler & Geri Bildirimler | Dashboard",
};

export default function ComplaintsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Şikayetler & Geri Bildirimler</h1>
      <p className="text-gray-600">
        Kullanıcılardan gelen şikayetler, talepler ve geri bildirimler burada
        listelenecek ve yönetilecektir.
      </p>
      {/* Buraya şikayet listesi ve detay görüntüleme bileşenleri gelecek */}
    </div>
  );
}
