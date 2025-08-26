// app/dashboard/layout.tsx
"use client";

import { AppSidebar } from "@/components/auth-based-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/lib/auth-context";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

// Bu layout, tüm yönetici paneli sayfalarını sarmalar.
// Sol tarafta bir kenar çubuğu ve üstte bir başlık alanı oluşturur.
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  useEffect(() => {
    async function checkUserRole() {
      if (!session?.user) {
        setIsCheckingRole(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const userData = await response.json();
          setUserRole(userData.role);

          // CUSTOMER rolündeki kullanıcıları dashboard'dan uzaklaştır
          if (userData.role === "CUSTOMER") {
            router.push("/unauthorized");
            return;
          }
        }
      } catch (error) {
        console.error("Role check error:", error);
      } finally {
        setIsCheckingRole(false);
      }
    }

    if (!isPending) {
      checkUserRole();
    }
  }, [session, isPending, router]);

  // Yüklenme durumları
  if (isPending || isCheckingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">
            Yetki kontrol ediliyor...
          </p>
        </div>
      </div>
    );
  }

  // Giriş yapmamış kullanıcılar
  if (!session?.user) {
    router.push("/login");
    return null;
  }

  // CUSTOMER rolündeki kullanıcılar
  if (userRole === "CUSTOMER") {
    return null; // Router.push zaten çalışacak
  }

  return (
    <AuthProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          {/* Sol taraftaki, daraltılıp genişletilebilen kenar çubuğu */}
          <AppSidebar />

          {/* Ana içerik alanı */}
          <div className="flex flex-1 flex-col">
            {/* Üstteki sabit başlık çubuğu */}
            <SiteHeader />

            {/* Değişken sayfa içeriği (children), bu alana yerleştirilir */}
            <main className="flex-1 p-4 md:p-6 lg:p-10">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </AuthProvider>
  );
}
