import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { product, category } from "@/db/schema";
import * as XLSX from "xlsx";
import { z } from "zod";

interface ImportRow {
  "Ürün Adı"?: string;
  "Ürün Adi"?: string;
  "Product Name"?: string;
  Açıklama?: string;
  Description?: string;
  "Fiyat (₺)"?: string | number;
  Fiyat?: string | number;
  Price?: string | number;
  Stok?: string | number;
  Stock?: string | number;
  Barkod?: string;
  Barcode?: string;
  Kategori?: string;
  Category?: string;
}

const productImportSchema = z.object({
  "Ürün Adı": z.string().min(1, "Ürün adı gerekli"),
  Açıklama: z.string().optional(),
  "Fiyat (₺)": z.number().min(0, "Fiyat 0'dan büyük olmalı"),
  Stok: z.number().int().min(0, "Stok 0'dan büyük olmalı"),
  Barkod: z.string().optional(),
  Kategori: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new NextResponse("Dosya gerekli", { status: 400 });
    }

    // Dosya türü kontrolü
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      return new NextResponse(
        "Sadece Excel dosyaları (.xlsx, .xls) kabul edilir",
        { status: 400 }
      );
    }

    // Dosyayı buffer'a çevirme
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "buffer" });

    // İlk sayfayı al
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // JSON'a çevirme
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      return new NextResponse("Excel dosyası boş", { status: 400 });
    }

    const results = {
      success: 0,
      errors: [] as string[],
      total: jsonData.length,
    };

    // Kategorileri cache'le
    const categories = await db.select().from(category);
    const categoryMap = new Map(
      categories.map((c) => [c.name.toLowerCase(), c.id])
    );

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as ImportRow;
      const rowNumber = i + 2; // Excel'de 1. satır başlık, 2. satırdan başlar

      try {
        // Veri doğrulama
        const validatedData = productImportSchema.parse({
          "Ürün Adı": row["Ürün Adı"] || row["Ürün Adi"] || row["Product Name"],
          Açıklama: row["Açıklama"] || row["Description"],
          "Fiyat (₺)": parseFloat(
            String(row["Fiyat (₺)"] || row["Fiyat"] || row["Price"] || "0")
          ),
          Stok: parseInt(String(row["Stok"] || row["Stock"] || "0")),
          Barkod: row["Barkod"] || row["Barcode"],
          Kategori: row["Kategori"] || row["Category"],
        });

        // Kategori ID'sini bul
        let categoryId = null;
        if (validatedData["Kategori"]) {
          const categoryName = validatedData["Kategori"].toLowerCase();
          categoryId = categoryMap.get(categoryName);

          if (!categoryId) {
            // Kategori yoksa oluştur
            const newCategory = await db
              .insert(category)
              .values({
                id: `cat_${crypto.randomUUID()}`,
                name: validatedData["Kategori"],
                slug: validatedData["Kategori"]
                  .toLowerCase()
                  .replace(/\s+/g, "-"),
                level: 0,
                sortOrder: 0,
                isActive: true,
              })
              .returning();

            categoryId = newCategory[0].id;
            categoryMap.set(categoryName, categoryId);
          }
        }

        // Ürünü ekle
        await db.insert(product).values({
          id: `prod_${crypto.randomUUID()}`,
          name: validatedData["Ürün Adı"],
          description: validatedData["Açıklama"],
          price: validatedData["Fiyat (₺)"],
          stock: validatedData["Stok"],
          barcode: validatedData["Barkod"],
          categoryId: categoryId || "default-category-id", // Provide a default category ID
          images: [],
        });

        results.success++;
      } catch (error) {
        if (error instanceof z.ZodError) {
          results.errors.push(`Satır ${rowNumber}: ${error.issues[0].message}`);
        } else {
          results.errors.push(`Satır ${rowNumber}: Bilinmeyen hata`);
        }
      }
    }

    return NextResponse.json({
      message: `${results.success}/${results.total} ürün başarıyla içe aktarıldı`,
      success: results.success,
      errors: results.errors,
      total: results.total,
    });
  } catch (error) {
    console.error("[PRODUCTS_IMPORT]", error);
    return new NextResponse("Import hatası", { status: 500 });
  }
}
