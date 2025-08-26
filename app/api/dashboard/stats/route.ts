// app/api/dashboard/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { db } from "@/db/drizzle";
import { product, order, orderItem, user, customer } from "@/db/schema";
import { sql, eq, desc, count, sum } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    // Bugünün başlangıç ve bitiş tarihleri
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

    // Bu haftanın başlangıcı (Pazartesi)
    const startOfWeek = new Date(today);
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    // Bu ayın başlangıcı
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Paralel olarak temel sayıları çek
    const [
      userCountResult,
      productCountResult,
      totalOrdersResult,
      totalRevenueResult,
      todaySalesResult,
      weekSalesResult,
      monthSalesResult,
      avgOrderValueResult,
    ] = await Promise.all([
      db.select({ count: count() }).from(user),
      db.select({ count: count() }).from(product),
      db.select({ count: count() }).from(order),
      db
        .select({ total: sum(order.total) })
        .from(order)
        .where(eq(order.status, "DELIVERED")),
      db
        .select({ total: sum(order.total), count: count() })
        .from(order)
        .where(
          sql`${order.createdAt} >= ${startOfToday} AND ${order.createdAt} < ${endOfToday} AND ${order.status} = 'DELIVERED'`
        ),
      db
        .select({ total: sum(order.total), count: count() })
        .from(order)
        .where(
          sql`${order.createdAt} >= ${startOfWeek} AND ${order.status} = 'DELIVERED'`
        ),
      db
        .select({ total: sum(order.total), count: count() })
        .from(order)
        .where(
          sql`${order.createdAt} >= ${startOfMonth} AND ${order.status} = 'DELIVERED'`
        ),
      db
        .select({ avg: sql<number>`AVG(${order.total})` })
        .from(order)
        .where(eq(order.status, "DELIVERED")),
    ]);

    // En çok satan ürünler
    const topProducts = await db
      .select({
        productId: orderItem.productId,
        productName: product.name,
        total: sum(sql<number>`${orderItem.quantity} * ${orderItem.price}`),
        quantity: sum(orderItem.quantity),
      })
      .from(orderItem)
      .innerJoin(order, eq(orderItem.orderId, order.id))
      .innerJoin(product, eq(orderItem.productId, product.id))
      .where(eq(order.status, "DELIVERED"))
      .groupBy(orderItem.productId, product.name)
      .orderBy(
        desc(sum(sql<number>`${orderItem.quantity} * ${orderItem.price}`))
      )
      .limit(5);

    // Son siparişler
    const recentOrders = await db
      .select({
        id: order.id,
        customerName: customer.name,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
      })
      .from(order)
      .leftJoin(customer, eq(order.customerId, customer.id))
      .orderBy(desc(order.createdAt))
      .limit(10);

    // Düşük stok ürünleri (configurable minimum stok)
    const MIN_STOCK_THRESHOLD = 10;
    const lowStockProducts = await db
      .select({
        id: product.id,
        name: product.name,
        stock: product.stock,
        minStock: sql<number>`${MIN_STOCK_THRESHOLD}`,
      })
      .from(product)
      .where(sql`${product.stock} < ${MIN_STOCK_THRESHOLD}`)
      .orderBy(product.stock)
      .limit(10);

    // Gerçek büyüme hesaplamaları
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate()
    );
    const yesterdayEnd = new Date(
      yesterdayStart.getTime() + 24 * 60 * 60 * 1000
    );

    const lastWeekStart = new Date(startOfWeek);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const lastMonthStart = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 1);

    // Önceki dönem verilerini çek
    const [yesterdayStats, lastWeekStats, lastMonthStats] = await Promise.all([
      db
        .select({ total: sum(order.total) })
        .from(order)
        .where(
          sql`${order.createdAt} >= ${yesterdayStart} AND ${order.createdAt} < ${yesterdayEnd} AND ${order.status} = 'DELIVERED'`
        ),
      db
        .select({ total: sum(order.total) })
        .from(order)
        .where(
          sql`${order.createdAt} >= ${lastWeekStart} AND ${order.createdAt} < ${startOfWeek} AND ${order.status} = 'DELIVERED'`
        ),
      db
        .select({ total: sum(order.total) })
        .from(order)
        .where(
          sql`${order.createdAt} >= ${lastMonthStart} AND ${order.createdAt} < ${lastMonthEnd} AND ${order.status} = 'DELIVERED'`
        ),
    ]);

    // Büyüme hesaplamaları
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const salesGrowth = {
      daily: calculateGrowth(
        Number(todaySalesResult[0].total) || 0,
        Number(yesterdayStats[0]?.total) || 0
      ),
      weekly: calculateGrowth(
        Number(weekSalesResult[0].total) || 0,
        Number(lastWeekStats[0]?.total) || 0
      ),
      monthly: calculateGrowth(
        Number(monthSalesResult[0].total) || 0,
        Number(lastMonthStats[0]?.total) || 0
      ),
    };

    const stats = {
      userCount: userCountResult[0].count,
      productCount: productCountResult[0].count,
      totalRevenue: Number(totalRevenueResult[0].total) || 0,
      totalOrders: totalOrdersResult[0].count,
      salesToday: Number(todaySalesResult[0].total) || 0,
      ordersToday: todaySalesResult[0].count || 0,
      salesWeek: Number(weekSalesResult[0].total) || 0,
      ordersWeek: weekSalesResult[0].count || 0,
      salesMonth: Number(monthSalesResult[0].total) || 0,
      ordersMonth: monthSalesResult[0].count || 0,
      averageOrderValue: Number(avgOrderValueResult[0].avg) || 0,
      dailyAverageSales: Number(monthSalesResult[0].total) / 30 || 0,
      topProducts: topProducts.map((p) => ({
        productId: p.productId,
        productName: p.productName,
        total: Number(p.total),
        quantity: Number(p.quantity),
      })),
      recentOrders: recentOrders.map((orderResult) => ({
        id: orderResult.id,
        customerName: orderResult.customerName || "Misafir",
        total: Number(orderResult.total),
        status: orderResult.status || "PENDING",
        createdAt: orderResult.createdAt.toISOString(),
      })),
      lowStockProducts: lowStockProducts.map((product) => ({
        id: product.id,
        name: product.name,
        stock: product.stock,
        minStock: Number(product.minStock),
      })),
      salesGrowth,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "İstatistikler alınırken hata oluştu" },
      { status: 500 }
    );
  }
}

// Export as a dynamic route (disable caching for real-time data)
export const dynamic = "force-dynamic";
