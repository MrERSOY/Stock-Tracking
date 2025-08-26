import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { product, category } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

type ProductUpdateData = {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  categoryId?: string;
  barcode?: string;
  images?: string[];
  updatedAt?: Date;
};

const updateProductSchema = z.object({
  name: z.string().min(3, "Ürün adı en az 3 karakter olmalıdır.").optional(),
  description: z.string().optional(),
  price: z.number().min(0, "Fiyat 0'dan büyük olmalıdır.").optional(),
  stock: z
    .number()
    .int()
    .min(0, "Stok 0'dan büyük veya eşit olmalıdır.")
    .optional(),
  categoryId: z.string().min(1, "Lütfen bir kategori seçin.").optional(),
  barcode: z.string().optional(),
  images: z
    .array(z.string().url())
    .min(1, "En az bir resim URL'i eklenmelidir.")
    .optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;

    const productData = await db
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
      .where(eq(product.id, productId))
      .limit(1);

    if (productData.length === 0) {
      return new NextResponse("Ürün bulunamadı", { status: 404 });
    }

    return NextResponse.json(productData[0]);
  } catch (error) {
    console.error("[PRODUCT_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    // TODO: Implement proper session check with better-auth
    // const session = await auth.api.getSession();
    // if (!session?.user) {
    //   return new NextResponse("Unauthorized", { status: 401 });
    // }

    const { productId } = await params;
    const body = await request.json();
    const validation = updateProductSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(validation.error.message, { status: 400 });
    }

    const updateData = validation.data;
    const fieldsToUpdate: ProductUpdateData = {};

    // Sadece gönderilen alanları güncelle
    if (updateData.name !== undefined) fieldsToUpdate.name = updateData.name;
    if (updateData.description !== undefined)
      fieldsToUpdate.description = updateData.description;
    if (updateData.price !== undefined) fieldsToUpdate.price = updateData.price;
    if (updateData.stock !== undefined) fieldsToUpdate.stock = updateData.stock;
    if (updateData.categoryId !== undefined)
      fieldsToUpdate.categoryId = updateData.categoryId;
    if (updateData.barcode !== undefined)
      fieldsToUpdate.barcode = updateData.barcode;
    if (updateData.images !== undefined)
      fieldsToUpdate.images = updateData.images;

    if (Object.keys(fieldsToUpdate).length === 0) {
      return new NextResponse("Güncellenecek alan bulunamadı", { status: 400 });
    }

    fieldsToUpdate.updatedAt = new Date();

    const updatedProduct = await db
      .update(product)
      .set(fieldsToUpdate)
      .where(eq(product.id, productId))
      .returning();

    if (updatedProduct.length === 0) {
      return new NextResponse("Ürün bulunamadı", { status: 404 });
    }

    return NextResponse.json(updatedProduct[0]);
  } catch (error) {
    console.error("[PRODUCT_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    // TODO: Implement proper session check with better-auth
    // const session = await auth.api.getSession();
    // if (!session?.user) {
    //   return new NextResponse("Unauthorized", { status: 401 });
    // }

    const { productId } = await params;

    const deletedProduct = await db
      .delete(product)
      .where(eq(product.id, productId))
      .returning();

    if (deletedProduct.length === 0) {
      return new NextResponse("Ürün bulunamadı", { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[PRODUCT_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
