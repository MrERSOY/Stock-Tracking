import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { customer, order } from "@/db/schema";
import { eq, count, sum } from "drizzle-orm";
import { requireAuth, createErrorResponse } from "@/lib/auth-middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(request);

    const { id: customerId } = await params;

    // Müşteri bilgilerini getir
    const customerData = await db
      .select()
      .from(customer)
      .where(eq(customer.id, customerId))
      .limit(1);

    if (customerData.length === 0) {
      return NextResponse.json(
        { error: "Müşteri bulunamadı" },
        { status: 404 }
      );
    }

    // Müşteri istatistiklerini getir
    const orderStats = await db
      .select({
        totalOrders: count(),
        totalSpent: sum(order.total),
      })
      .from(order)
      .where(eq(order.customerId, customerId));

    const stats = orderStats[0] || { totalOrders: 0, totalSpent: 0 };

    const customerWithStats = {
      ...customerData[0],
      totalOrders: Number(stats.totalOrders) || 0,
      totalSpent: Number(stats.totalSpent) || 0,
      frequentBuyer: Number(stats.totalOrders) >= 5,
      averageOrderValue:
        stats.totalOrders > 0
          ? Number(stats.totalSpent) / Number(stats.totalOrders)
          : 0,
    };

    return NextResponse.json(customerWithStats);
  } catch (error) {
    return createErrorResponse(error, "Müşteri bilgileri getirilemedi");
  }
}
