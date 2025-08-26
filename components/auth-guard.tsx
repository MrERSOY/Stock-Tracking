"use client";

import { useAuth } from "@/lib/auth-context";
import { hasPageAccess, PAGE_PERMISSIONS } from "@/lib/permissions";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredPermission: keyof typeof PAGE_PERMISSIONS;
  fallbackPath?: string;
}

export function AuthGuard({
  children,
  requiredPermission,
  fallbackPath = "/dashboard",
}: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (
      !isLoading &&
      (!user || !hasPageAccess(user.role, requiredPermission))
    ) {
      router.push(fallbackPath);
    }
  }, [user, isLoading, requiredPermission, fallbackPath, router]);

  // Yüklenirken loading göster
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="text-gray-600">Yetki kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  // Kullanıcı yok ya da yetkisi yok
  if (!user || !hasPageAccess(user.role, requiredPermission)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Yetkisiz Erişim
          </h2>
          <p className="text-gray-600 mb-4">
            Bu sayfaya erişim yetkiniz bulunmuyor.
          </p>
          <button
            onClick={() => router.push(fallbackPath)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Kolaylık için HOC versiyonu
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: keyof typeof PAGE_PERMISSIONS,
  fallbackPath?: string
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard
        requiredPermission={requiredPermission}
        fallbackPath={fallbackPath}
      >
        <Component {...props} />
      </AuthGuard>
    );
  };
}
