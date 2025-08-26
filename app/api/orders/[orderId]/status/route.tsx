// app/api/orders/[orderId]/status/route.ts

import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { order } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await req.json();
    const validation = updateStatusSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse("Geçersiz durum değeri", { status: 400 });
    }

    const { status } = validation.data;

    const updatedOrder = await db
      .update(order)
      .set({ status })
      .where(eq(order.id, orderId))
      .returning();

    if (updatedOrder.length === 0) {
      return new NextResponse("Sipariş bulunamadı", { status: 404 });
    }

    return NextResponse.json(updatedOrder[0]);
  } catch (error) {
    console.error("[ORDER_STATUS_UPDATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
