import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { product } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { z } from "zod";

const bulkUpdateSchema = z.object({
  productIds: z.array(z.string()).min(1, "En az bir ürün seçilmelidir."),
  categoryId: z.string().optional(),
  price: z.number().optional(),
  stock: z.number().optional(),
  isActive: z.boolean().optional(),
});

type BulkUpdateData = {
  categoryId?: string;
  price?: number;
  stock?: number;
  isActive?: boolean;
};

export async function PATCH(req: Request) {
  try {
    // TODO: Implement proper session check with better-auth
    // const session = await auth.api.getSession();
    // if (!session?.user) {
    //   return new NextResponse("Unauthorized", { status: 401 });
    // }

    const body = await req.json();
    const validation = bulkUpdateSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(validation.error.message, { status: 400 });
    }

    const { productIds, ...updateData } = validation.data;

    // Güncellenecek alanları filtrele
    const fieldsToUpdate: BulkUpdateData = {};
    if (updateData.categoryId !== undefined)
      fieldsToUpdate.categoryId = updateData.categoryId;
    if (updateData.price !== undefined) fieldsToUpdate.price = updateData.price;
    if (updateData.stock !== undefined) fieldsToUpdate.stock = updateData.stock;
    if (updateData.isActive !== undefined)
      fieldsToUpdate.isActive = updateData.isActive;

    if (Object.keys(fieldsToUpdate).length === 0) {
      return new NextResponse("Güncellenecek alan bulunamadı", { status: 400 });
    }

    const updatedProducts = await db
      .update(product)
      .set({
        ...fieldsToUpdate,
        updatedAt: new Date(),
      })
      .where(inArray(product.id, productIds))
      .returning();

    return NextResponse.json({
      message: `${updatedProducts.length} ürün başarıyla güncellendi`,
      updatedCount: updatedProducts.length,
    });
  } catch (error) {
    console.error("[PRODUCTS_BULK_UPDATE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
