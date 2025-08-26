// app/api/products/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { product, category } from "@/db/schema";
import { eq, like, and, gte, lte, desc, asc, or } from "drizzle-orm";
import { z } from "zod";
import {
  requireAuth,
  createErrorResponse,
  createValidationErrorResponse,
} from "@/lib/auth-middleware";

const productSchema = z.object({
  name: z.string().min(3, "Ürün adı en az 3 karakter olmalıdır."),
  description: z.string().optional(),
  price: z.number().min(0, "Fiyat 0'dan büyük olmalıdır."),
  stock: z.number().int().min(0, "Stok 0'dan büyük veya eşit olmalıdır."),
  categoryId: z.string().min(1, "Lütfen bir kategori seçin."),
  barcode: z.string().optional(),
  images: z
    .array(z.string().url())
    .min(1, "En az bir resim URL'i eklenmelidir."),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Query parametreleri
    const query = searchParams.get("query") || "";
    const categoryFilter = searchParams.get("category") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const stockFilter = searchParams.get("stock") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Filtreleme koşulları
    const conditions = [];

    // Arama filtresi
    if (query) {
      conditions.push(
        or(
          like(product.name, `%${query}%`),
          like(product.barcode || "", `%${query}%`),
          like(category.name, `%${query}%`)
        )
      );
    }

    // Kategori filtresi
    if (categoryFilter && categoryFilter !== "all") {
      conditions.push(eq(product.categoryId, categoryFilter));
    }

    // Fiyat aralığı
    if (minPrice && minPrice !== "") {
      conditions.push(gte(product.price, parseFloat(minPrice)));
    }
    if (maxPrice && maxPrice !== "") {
      conditions.push(lte(product.price, parseFloat(maxPrice)));
    }

    // Stok filtresi
    if (stockFilter && stockFilter !== "all") {
      switch (stockFilter) {
        case "inStock":
          conditions.push(gte(product.stock, 1));
          break;
        case "outOfStock":
          conditions.push(eq(product.stock, 0));
          break;
        case "lowStock":
          conditions.push(and(gte(product.stock, 1), lte(product.stock, 10)));
          break;
      }
    }

    // Base query with filters
    const baseQuery = db
      .select({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        images: product.images,
        barcode: product.barcode,
        categoryId: product.categoryId,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        category: {
          id: category.id,
          name: category.name,
        },
      })
      .from(product)
      .leftJoin(category, eq(product.categoryId, category.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Sıralama
    let orderByClause;
    switch (sortBy) {
      case "name":
        orderByClause =
          sortOrder === "asc" ? asc(product.name) : desc(product.name);
        break;
      case "price":
        orderByClause =
          sortOrder === "asc" ? asc(product.price) : desc(product.price);
        break;
      case "stock":
        orderByClause =
          sortOrder === "asc" ? asc(product.stock) : desc(product.stock);
        break;
      default:
        orderByClause =
          sortOrder === "asc"
            ? asc(product.createdAt)
            : desc(product.createdAt);
    }

    // Toplam sayıyı hesapla
    const totalCount = await db
      .select({ count: product.id })
      .from(product)
      .leftJoin(category, eq(product.categoryId, category.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    const totalProducts = totalCount.length;
    const totalPages = Math.ceil(totalProducts / limit);

    // Ürünleri çek
    const products = await baseQuery
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      products,
      totalProducts,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    console.error("[PRODUCTS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Authentication required for creating products
    await requireAuth(req);

    const body = await req.json();
    const validation = productSchema.safeParse(body);
    if (!validation.success) {
      return createValidationErrorResponse(validation.error.message);
    }

    const { name, description, price, stock, categoryId, barcode, images } =
      validation.data;

    // Early duplicate check to daha hızlı geri dönüş
    if (barcode) {
      const existing = await db
        .select({ id: product.id })
        .from(product)
        .where(eq(product.barcode, barcode))
        .limit(1);
      if (existing.length > 0) {
        return NextResponse.json(
          { error: "Bu barkod zaten kayıtlı", code: "duplicate_barcode" },
          { status: 409 }
        );
      }
    }

    try {
      const inserted = await db
        .insert(product)
        .values({
          id: `prod_${crypto.randomUUID()}`,
          name,
          description,
          price,
          stock,
          categoryId,
          barcode,
          images,
        })
        .returning();
      return NextResponse.json(inserted[0], { status: 201 });
    } catch (e: unknown) {
      // Yakalanmamış yarış durumunda unique constraint hatası
      const error = e as { code?: string; constraint?: string };
      if (
        error?.code === "23505" &&
        /product_barcode_unique/.test(error?.constraint || "")
      ) {
        return NextResponse.json(
          { error: "Bu barkod zaten kayıtlı", code: "duplicate_barcode" },
          { status: 409 }
        );
      }
      console.error("[PRODUCTS_POST] Insert error", e);
      return NextResponse.json(
        { error: "Ürün eklenemedi", code: "insert_failed" },
        { status: 500 }
      );
    }
  } catch (error) {
    return createErrorResponse(error, "Ürün oluşturulamadı");
  }
}
