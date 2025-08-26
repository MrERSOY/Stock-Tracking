import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { product } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { z } from "zod";

const bulkDeleteSchema = z.object({
  productIds: z.array(z.string()).min(1, "En az bir ürün seçilmelidir."),
});

export async function DELETE(req: Request) {
  try {
    // TODO: Implement proper session check with better-auth
    // const session = await auth.api.getSession();
    // if (!session?.user) {
    //   return new NextResponse("Unauthorized", { status: 401 });
    // }

    const body = await req.json();
    const validation = bulkDeleteSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(validation.error.message, { status: 400 });
    }

    const { productIds } = validation.data;

    const deletedProducts = await db
      .delete(product)
      .where(inArray(product.id, productIds))
      .returning();

    return NextResponse.json({
      message: `${deletedProducts.length} ürün başarıyla silindi`,
      deletedCount: deletedProducts.length,
    });
  } catch (error) {
    console.error("[PRODUCTS_BULK_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
