"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, Home, LogOut } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      toast.success("Başarıyla çıkış yapıldı!");
      router.push("/login");
    } catch (error) {
      toast.error("Çıkış yapılırken bir hata oluştu!");
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Erişim Reddedildi
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Bu sayfaya erişim yetkiniz bulunmamaktadır.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
            <p>
              Dashboard sayfaları sadece <strong>Personel</strong> ve{" "}
              <strong>Admin</strong> kullanıcıları için tasarlanmıştır.
            </p>
            <p className="mt-2">
              Müşteri hesabınız henüz yetkililer tarafından onaylanmamıştır. 
              Lütfen onay sürecinin tamamlanmasını bekleyin.
            </p>
          </div>

          <div className="space-y-2 pt-4">
            <Button asChild className="w-full" variant="default">
              <Link href="/customer-portal" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Üyelik Durumunu Görüntüle
              </Link>
            </Button>

            <Button onClick={handleLogout} className="w-full" variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Farklı Hesapla Giriş Yap
            </Button>
          </div>

          <div className="text-xs text-center text-gray-400 dark:text-gray-500 pt-4 border-t">
            Eğer bu bir hata olduğunu düşünüyorsanız, sistem yöneticisi ile
            iletişime geçin.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
