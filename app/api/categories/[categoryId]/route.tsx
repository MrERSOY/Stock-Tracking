import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { category } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const categorySchema = z.object({
  name: z
    .string()
    .min(2, { message: "Kategori adı en az 2 karakter olmalıdır." }),
});

// GET fonksiyonu
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const { categoryId } = await params;
  try {
    if (!categoryId) {
      return new NextResponse("Category ID is required", { status: 400 });
    }

    const categoryResult = await db
      .select()
      .from(category)
      .where(eq(category.id, categoryId))
      .limit(1);

    if (categoryResult.length === 0) {
      return new NextResponse("Category not found", { status: 404 });
    }

    return NextResponse.json(categoryResult[0]);
  } catch (error) {
    console.error("[CATEGORY_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// PATCH fonksiyonu
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const { categoryId } = await params;
  try {
    // TODO: Implement proper session check with better-auth
    // For now, we'll allow the operation
    // const session = await auth.api.getSession();
    // if (!session?.user) {
    //   return new NextResponse("Unauthorized", { status: 401 });
    // }

    if (!categoryId) {
      return new NextResponse("Category ID is required", { status: 400 });
    }

    const body = await request.json();
    const validation = categorySchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(validation.error.message, { status: 400 });
    }

    const updatedCategory = await db
      .update(category)
      .set({
        name: validation.data.name,
      })
      .where(eq(category.id, categoryId))
      .returning();

    if (updatedCategory.length === 0) {
      return new NextResponse("Category not found to update", { status: 404 });
    }

    return NextResponse.json(updatedCategory[0]);
  } catch (error) {
    console.error("[CATEGORY_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// DELETE fonksiyonu
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const { categoryId } = await params;
  try {
    // TODO: Implement proper session check with better-auth
    // For now, we'll allow the operation
    // const session = await auth.api.getSession();
    // if (!session?.user) {
    //   return new NextResponse("Unauthorized", { status: 401 });
    // }

    if (!categoryId) {
      return new NextResponse("Category ID is required", { status: 400 });
    }

    const deletedCategory = await db
      .delete(category)
      .where(eq(category.id, categoryId))
      .returning();

    if (deletedCategory.length === 0) {
      return new NextResponse("Category not found to delete", { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CATEGORY_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
