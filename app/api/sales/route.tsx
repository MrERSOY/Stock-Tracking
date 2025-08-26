import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { order, orderItem, product } from "@/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { requireAuth, createErrorResponse } from "@/lib/auth-middleware";

// Types for sale data
interface SaleItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

// Satış verilerini kaydet
export async function POST(request: NextRequest) {
  try {
    // Authentication required for creating sales
    const { user: authUser } = await requireAuth(request);

    const body = await request.json();
    const { saleData } = body;

    // Satış verilerini kaydet
    const result = await db
      .insert(order)
      .values({
        id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        customerId: saleData.customerId || null,
        total: saleData.total,
        tax: saleData.tax,
        discount: saleData.discount || 0,
        paymentMethod: saleData.paymentMethod,
        status: "PAID",
        userId: authUser.id,
        createdAt: new Date(),
      })
      .returning();

    const orderId = result[0].id;

    // Sipariş kalemlerini kaydet
    const orderItemsData = saleData.items.map((item: SaleItem) => ({
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      orderId: orderId,
      productId: item.productId,
      quantity: item.quantity,
      price: item.unitPrice,
    }));

    await db.insert(orderItem).values(orderItemsData);

    // Stok güncelle
    for (const item of saleData.items) {
      await db
        .update(product)
        .set({
          stock: sql`${product.stock} - ${item.quantity}`,
        })
        .where(eq(product.id, item.productId));
    }

    return NextResponse.json({
      success: true,
      orderId: orderId,
      message: "Satış başarıyla kaydedildi",
    });
  } catch (error) {
    return createErrorResponse(error, "Satış kaydedilemedi");
  }
}

// Ciro analizi için satış verilerini getir
export async function GET(request: NextRequest) {
  try {
    // Authentication required for viewing sales data
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Satış verilerini getir
    const conditions = [eq(order.status, "PAID")];

    if (startDate && endDate) {
      conditions.push(
        gte(order.createdAt, new Date(startDate)),
        lte(order.createdAt, new Date(endDate))
      );
    }

    const salesData = await db
      .select({
        id: order.id,
        totalAmount: order.total,
        taxAmount: order.tax,
        discountAmount: order.discount,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt,
        customerId: order.customerId,
      })
      .from(order)
      .where(and(...conditions))
      .orderBy(order.createdAt);

    // Toplam ciro hesapla
    const totalRevenue = salesData.reduce(
      (sum, sale) => sum + (sale.totalAmount || 0),
      0
    );
    const totalTax = salesData.reduce(
      (sum, sale) => sum + (sale.taxAmount || 0),
      0
    );
    const totalDiscount = salesData.reduce(
      (sum, sale) => sum + (sale.discountAmount || 0),
      0
    );

    // Ödeme yöntemlerine göre grupla
    const paymentMethodStats = salesData.reduce((acc, sale) => {
      const method = sale.paymentMethod || "unknown";
      if (!acc[method]) {
        acc[method] = { count: 0, total: 0 };
      }
      acc[method].count += 1;
      acc[method].total += sale.totalAmount || 0;
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    // Günlük satış verileri
    const dailyStats = salesData.reduce((acc, sale) => {
      const date = sale.createdAt.toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = { sales: 0, revenue: 0 };
      }
      acc[date].sales += 1;
      acc[date].revenue += sale.totalAmount || 0;
      return acc;
    }, {} as Record<string, { sales: number; revenue: number }>);

    return NextResponse.json({
      success: true,
      data: {
        totalSales: salesData.length,
        totalRevenue,
        totalTax,
        totalDiscount,
        paymentMethodStats,
        dailyStats,
        salesData,
      },
    });
  } catch (error) {
    return createErrorResponse(error, "Ciro analizi yapılamadı");
  }
}
