// app/dashboard/products/new/page.tsx

import Link from "next/link";
import { db } from "@/db/drizzle";
import { category } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { ProductForm } from "./product-form";
import { Suspense } from "react";
import { asc } from "drizzle-orm";

// Basit Skeleton bileşeni
function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  );
}

// Yükleme durumu için bir iskelet bileşeni
function ProductFormSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}

export default async function NewProductPage() {
  const categories = await db
    .select({
      id: category.id,
      name: category.name,
    })
    .from(category)
    .orderBy(asc(category.name));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Yeni Ürün Ekle</h2>
        <Button asChild variant="outline">
          <Link href="/dashboard/products">&larr; Geri Dön</Link>
        </Button>
      </div>

      <Suspense fallback={<ProductFormSkeleton />}>
        <ProductForm categories={categories} />
      </Suspense>
    </div>
  );
}
