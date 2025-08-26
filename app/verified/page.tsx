"use client";

import { Suspense, useEffect } from "react";

// Basit 10 saniye sonra dashboard'a yönlendirme komponenti
function AutoRedirect() {
  useEffect(() => {
    const t = setTimeout(() => {
      window.location.href = "/dashboard";
    }, 10000);
    return () => clearTimeout(t);
  }, []);
  return null;
}

export default function EmailVerifiedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center p-8">
      <div className="space-y-4 max-w-md">
        <h1 className="text-2xl font-semibold">E-posta Doğrulandı ✅</h1>
        <p className="text-muted-foreground">
          E-posta adresiniz başarıyla doğrulandı. 10 saniye içinde otomatik
          olarak panelinize yönlendirileceksiniz.
        </p>
        <p className="text-sm text-muted-foreground">
          Beklemek istemiyorsanız aşağıdaki butona tıklayın.
        </p>
        <a
          href="/dashboard"
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:opacity-90 transition"
        >
          Dashboard&apos;a Git
        </a>
        <div className="text-xs text-muted-foreground pt-4">
          Otomatik yönlendirme çalışmazsa tarayıcınızın adres çubuğuna
          <code className="mx-1 px-1 py-0.5 bg-muted rounded">/dashboard</code>
          yazabilirsiniz.
        </div>
      </div>
      <Suspense fallback={null}>
        <AutoRedirect />
      </Suspense>
    </div>
  );
}
