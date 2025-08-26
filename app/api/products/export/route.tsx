import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import * as XLSX from "xlsx";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Query parametreleri
    const query = searchParams.get("query") || "";
    const categoryFilter = searchParams.get("category") || "";
    const stockFilter = searchParams.get("stock") || "";

    // Filtreleme koşulları
    const conditions = [];

    if (query) {
      conditions.push(
        `(product.name ILIKE '%${query}%' OR product.barcode ILIKE '%${query}%' OR category.name ILIKE '%${query}%')`
      );
    }

    if (categoryFilter && categoryFilter !== "all") {
      conditions.push(`product.categoryId = '${categoryFilter}'`);
    }

    if (stockFilter && stockFilter !== "all") {
      switch (stockFilter) {
        case "inStock":
          conditions.push("product.stock > 0");
          break;
        case "outOfStock":
          conditions.push("product.stock = 0");
          break;
        case "lowStock":
          conditions.push("product.stock BETWEEN 1 AND 10");
          break;
      }
    }

    // SQL sorgusu
    let sql = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.stock,
        p.barcode,
        p.images,
        p.createdAt,
        p.updatedAt,
        c.name as category_name
      FROM product p
      LEFT JOIN category c ON p.categoryId = c.id
    `;

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    sql += ` ORDER BY p.createdAt DESC`;

    const products = await db.execute(sql);

    // Excel için veri hazırlama
    const excelData = products.rows.map((p: Record<string, unknown>) => ({
      "Ürün ID": p.id as string,
      "Ürün Adı": p.name as string,
      Açıklama: (p.description as string) || "",
      "Fiyat (₺)": p.price as number,
      Stok: p.stock as number,
      Barkod: (p.barcode as string) || "",
      Kategori: (p.category_name as string) || "Kategorisiz",
      "Oluşturma Tarihi": new Date(p.createdAt as Date).toLocaleDateString(
        "tr-TR"
      ),
      "Güncelleme Tarihi": new Date(p.updatedAt as Date).toLocaleDateString(
        "tr-TR"
      ),
    }));

    // Excel dosyası oluşturma
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ürünler");

    // Sütun genişliklerini ayarlama
    const columnWidths = [
      { wch: 15 }, // Ürün ID
      { wch: 30 }, // Ürün Adı
      { wch: 40 }, // Açıklama
      { wch: 12 }, // Fiyat
      { wch: 8 }, // Stok
      { wch: 15 }, // Barkod
      { wch: 20 }, // Kategori
      { wch: 15 }, // Oluşturma Tarihi
      { wch: 15 }, // Güncelleme Tarihi
    ];
    worksheet["!cols"] = columnWidths;

    // Excel dosyasını buffer'a çevirme
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    // Dosya adı oluşturma
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    const filename = `urunler_${timestamp}.xlsx`;

    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[PRODUCTS_EXPORT]", error);
    return new NextResponse("Export hatası", { status: 500 });
  }
}
