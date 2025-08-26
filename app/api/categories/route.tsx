import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { category } from "@/db/schema";
import { eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { buildCategoryTree, generateUniqueSlug } from "@/lib/category-utils";
import {
  requireAuth,
  createErrorResponse,
  createValidationErrorResponse,
} from "@/lib/auth-middleware";

const categorySchema = z.object({
  name: z.string().min(2, "Kategori adı en az 2 karakter olmalıdır."),
  description: z.string().optional(),
  parentId: z.string().optional(),
  image: z.string().optional(),
});

export async function GET() {
  try {
    const allCategories = await db
      .select()
      .from(category)
      .orderBy(category.sortOrder, category.name);

    // Hiyerarşik yapı oluştur
    const categoryTree = buildCategoryTree(allCategories);
    return NextResponse.json(categoryTree);
  } catch (error) {
    return createErrorResponse(error, "Kategoriler yüklenemedi");
  }
}

export async function POST(req: NextRequest) {
  try {
    // Authentication required for creating categories
    await requireAuth(req);

    const body = await req.json();
    const validation = categorySchema.safeParse(body);

    if (!validation.success) {
      return createValidationErrorResponse(validation.error.message);
    }

    const { name, description, parentId, image } = validation.data;

    // Mevcut slug'ları al
    const existingCategories = await db
      .select({ slug: category.slug })
      .from(category);
    const existingSlugs = existingCategories.map((cat) => cat.slug);

    // Benzersiz slug oluştur
    const slug = generateUniqueSlug(name, existingSlugs);

    // Parent kategori varsa level hesapla
    let level = 0;
    if (parentId) {
      const parentCategory = await db
        .select({ level: category.level })
        .from(category)
        .where(eq(category.id, parentId))
        .limit(1);

      if (parentCategory.length > 0) {
        level = parentCategory[0].level + 1;
      }
    }

    // En yüksek sortOrder'ı bul
    const maxSortOrder = await db
      .select({ sortOrder: category.sortOrder })
      .from(category)
      .where(
        parentId ? eq(category.parentId, parentId) : isNull(category.parentId)
      )
      .orderBy(category.sortOrder)
      .limit(1);

    const newSortOrder = (maxSortOrder[0]?.sortOrder || 0) + 1;

    const newCategory = await db
      .insert(category)
      .values({
        id: `cat_${crypto.randomUUID()}`,
        name,
        slug,
        description,
        parentId,
        level,
        sortOrder: newSortOrder,
        isActive: true,
        image,
      })
      .returning();

    return NextResponse.json(newCategory[0]);
  } catch (error) {
    return createErrorResponse(error, "Kategori oluşturulamadı");
  }
}
