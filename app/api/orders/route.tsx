// app/api/orders/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { order, orderItem, product, user as userTable } from "@/db/schema";
import { eq, inArray, and, gte, sql } from "drizzle-orm";
import { z } from "zod";
import {
  requireAuth,
  createErrorResponse,
  createValidationErrorResponse,
} from "@/lib/auth-middleware";

// Types for order data
interface OrderItemData {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
}

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1),
      })
    )
    .min(1, "Sipariş en az bir ürün içermelidir."),
  customerId: z.string().nullable().optional(),
  paymentMethod: z.enum(["cash", "card", "transfer"]).default("card"),
  discount: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  total: z.number().min(0),
});
// Vergi oranını sabit (ileride ayar/tablo) tutuyoruz
const TAX_RATE = 0.2; // %20

export async function GET(req: NextRequest) {
  try {
    // Authentication required for viewing orders
    await requireAuth(req);

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    // Base query
    const baseQuery = db
      .select({
        id: order.id,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
        userId: order.userId,
        customerId: order.customerId,
        paymentMethod: order.paymentMethod,
        discount: order.discount,
        tax: order.tax,
        user: {
          id: userTable.id,
          name: userTable.name,
          email: userTable.email,
        },
      })
      .from(order)
      .leftJoin(userTable, eq(order.userId, userTable.id));

    // Execute query with or without filter
    const orders = customerId
      ? await baseQuery
          .where(eq(order.customerId, customerId))
          .orderBy(order.createdAt)
      : await baseQuery.orderBy(order.createdAt);

    // Eğer customerId var ise, order items'ları da getir
    if (customerId) {
      const ordersWithItems = await Promise.all(
        orders.map(async (orderData) => {
          const items = await db
            .select({
              id: orderItem.id,
              productName: product.name,
              quantity: orderItem.quantity,
              price: orderItem.price,
            })
            .from(orderItem)
            .leftJoin(product, eq(orderItem.productId, product.id))
            .where(eq(orderItem.orderId, orderData.id));

          return {
            ...orderData,
            items,
          };
        })
      );

      return NextResponse.json({
        success: true,
        orders: ordersWithItems,
      });
    }

    return NextResponse.json(orders);
  } catch (error) {
    return createErrorResponse(error, "Siparişler yüklenemedi");
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("[ORDER_POST] Başlangıç");
    const { user: authUser } = await requireAuth(req);

    const body = await req.json();
    console.log("[ORDER_POST] Gelen veri:", body);

    const validation = createOrderSchema.safeParse(body);
    if (!validation.success) {
      console.error("[ORDER_POST] Validation hatası:", validation.error);
      return createValidationErrorResponse(validation.error.message);
    }

    const { items, customerId, paymentMethod } = validation.data;
    let { discount } = validation.data;

    // Fiyatları ve tutarları server tarafında yeniden hesapla
    const productIds = items.map((i) => i.productId);
    const products = await db
      .select()
      .from(product)
      .where(inArray(product.id, productIds));

    // Ön doğrulama
    if (products.length === 0) {
      return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
    }

    let calculatedSubtotal = 0;
    for (const item of items) {
      const p = products.find((p) => p.id === item.productId);
      if (!p) {
        return NextResponse.json(
          { error: `Ürün bulunamadı: ${item.productId}` },
          { status: 404 }
        );
      }
      if (p.stock < item.quantity) {
        return NextResponse.json(
          { error: `Yetersiz stok: ${p.name}` },
          { status: 400 }
        );
      }
      calculatedSubtotal += p.price * item.quantity;
    }
    // İskonto sınırla
    if (discount > calculatedSubtotal) discount = calculatedSubtotal;
    const calculatedTax = Number((calculatedSubtotal * TAX_RATE).toFixed(2));
    const calculatedTotal = Number(
      (calculatedSubtotal - discount + calculatedTax).toFixed(2)
    );

    console.log("[ORDER_POST] Recalculated amounts", {
      subtotal: calculatedSubtotal,
      discount,
      tax: calculatedTax,
      total: calculatedTotal,
    });
    console.log(
      "[ORDER_POST] Bulunan ürünler:",
      products.map((p) => ({ id: p.id, stock: p.stock, price: p.price }))
    );

    console.log(
      "[ORDER_POST] Stok kontrolü başarılı, sipariş oluşturuluyor (transaction yok - neon-http)"
    );

    // Transaction olmadığı için koşullu stok azaltma + rollback yaklaşımı
    const decremented: { productId: string; quantity: number }[] = [];
    for (const item of items) {
      const p = products.find((p) => p.id === item.productId)!;
      const updated = await db
        .update(product)
        .set({ stock: sql`${product.stock} - ${item.quantity}` })
        .where(and(eq(product.id, p.id), gte(product.stock, item.quantity)))
        .returning({ id: product.id, stock: product.stock });
      if (updated.length === 0) {
        console.error("[ORDER_POST] Yarış - yetersiz stok", p.id);
        // rollback önceki azaltmalar
        for (const d of decremented) {
          await db
            .update(product)
            .set({ stock: sql`${product.stock} + ${d.quantity}` })
            .where(eq(product.id, d.productId));
        }
        return NextResponse.json(
          { error: `Yetersiz stok (yarış durumu): ${p.name}` },
          { status: 409 }
        );
      }
      decremented.push({ productId: p.id, quantity: item.quantity });
      console.log("[ORDER_POST] Stok azaltıldı", {
        productId: p.id,
        newStock: updated[0].stock,
      });
    }

    // Siparişi oluştur
    const newOrderId = `order_${crypto.randomUUID()}`;
    let createdOrder;
    try {
      const inserted = await db
        .insert(order)
        .values({
          id: newOrderId,
          customerId: customerId || null,
          paymentMethod,
          discount: discount || 0,
          tax: calculatedTax,
          total: calculatedTotal,
          status: "PAID",
          userId: authUser.id,
        })
        .returning();
      createdOrder = inserted[0];
    } catch (e) {
      console.error("[ORDER_POST] Order insert hatası, stok rollback", e);
      for (const d of decremented) {
        await db
          .update(product)
          .set({ stock: sql`${product.stock} + ${d.quantity}` })
          .where(eq(product.id, d.productId));
      }
      return createErrorResponse(e, "Sipariş oluşturulamadı");
    }

    const createdItems: OrderItemData[] = [];
    try {
      for (const item of items) {
        const p = products.find((p) => p.id === item.productId)!;
        const [createdIt] = await db
          .insert(orderItem)
          .values({
            id: `item_${crypto.randomUUID()}`,
            orderId: newOrderId,
            productId: p.id,
            quantity: item.quantity,
            price: p.price,
          })
          .returning();
        createdItems.push(createdIt);
      }
    } catch (e) {
      console.error(
        "[ORDER_POST] Order item insert hatası, geri alma girişimi",
        e
      );
      // order kaydını sil (best effort)
      try {
        await db.delete(order).where(eq(order.id, newOrderId));
      } catch {}
      // stok rollback
      for (const d of decremented) {
        try {
          await db
            .update(product)
            .set({ stock: sql`${product.stock} + ${d.quantity}` })
            .where(eq(product.id, d.productId));
        } catch {}
      }
      return createErrorResponse(e, "Sipariş kalemleri eklenemedi");
    }

    const result = { ...createdOrder, items: createdItems };
    console.log("[ORDER_POST] Başarılı sonuç:", result.id);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return createErrorResponse(error, "Sipariş işlemi başarısız");
  }
}
