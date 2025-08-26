// app/api/analytics/customers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { order, orderItem, product, customer } from "@/db/schema";
import { sql, desc, eq, and, gte, lte, count } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    // Geçici olarak auth kontrolü kapatıldı - test için
    // const headersList = await headers();
    // const session = await auth.api.getSession({
    //   headers: headersList,
    // });

    // if (!session?.user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe") || "month";

    // Tarih aralığını belirleme
    const now = new Date();
    let fromDate: Date;

    switch (timeframe) {
      case "week":
        fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "quarter":
        fromDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case "year":
        fromDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        break;
      default: // month
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Toplam müşteri sayısı
    const totalCustomersResult = await db
      .select({
        totalCustomers: count(customer.id),
      })
      .from(customer);

    // Yeni müşteriler (belirlenen tarih aralığında)
    const newCustomersResult = await db
      .select({
        newCustomers: count(customer.id),
      })
      .from(customer)
      .where(
        and(gte(customer.createdAt, fromDate), lte(customer.createdAt, now))
      );

    // Geri dönen müşteriler (en az 2 sipariş vermiş)
    const returningCustomersResult = await db
      .select({
        customerId: order.customerId,
        orderCount: count(order.id),
      })
      .from(order)
      .where(eq(order.status, "PAID"))
      .groupBy(order.customerId)
      .having(sql`COUNT(${order.id}) >= 2`);

    // Önceki dönem müşteri sayısı (büyüme hesaplamak için)
    const previousPeriodStart = new Date(fromDate);
    const periodDiff = now.getTime() - fromDate.getTime();
    previousPeriodStart.setTime(fromDate.getTime() - periodDiff);

    const previousCustomersResult = await db
      .select({
        previousCustomers: count(customer.id),
      })
      .from(customer)
      .where(
        and(
          gte(customer.createdAt, previousPeriodStart),
          lte(customer.createdAt, fromDate)
        )
      );

    // Ortalama müşteri yaşam boyu değeri (CLV)
    const clvResult = await db
      .select({
        customerId: order.customerId,
        totalSpent: sql<number>`SUM(${order.total})`,
        orderCount: count(order.id),
      })
      .from(order)
      .where(eq(order.status, "PAID"))
      .groupBy(order.customerId);

    const averageLifetimeValue =
      clvResult.length > 0
        ? clvResult.reduce((sum, c) => sum + c.totalSpent, 0) / clvResult.length
        : 0;

    // En değerli müşteriler
    const topCustomers = await db
      .select({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        totalSpent: sql<number>`COALESCE(SUM(${order.total}), 0)`,
        orderCount: sql<number>`COUNT(${order.id})`,
        lastOrder: sql<string>`MAX(${order.createdAt})`,
      })
      .from(customer)
      .leftJoin(order, eq(customer.id, order.customerId))
      .where(eq(order.status, "PAID"))
      .groupBy(customer.id, customer.name, customer.email)
      .orderBy(desc(sql`SUM(${order.total})`))
      .limit(10);

    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const totalCustomers = totalCustomersResult[0]?.totalCustomers || 0;
    const newCustomers = newCustomersResult[0]?.newCustomers || 0;
    const returningCustomers = returningCustomersResult.length;
    const previousCustomers =
      previousCustomersResult[0]?.previousCustomers || 0;
    const customerGrowth = calculateGrowth(newCustomers, previousCustomers);

    // Churn rate hesaplama (basit yaklaşım)
    const churnRate =
      totalCustomers > 0
        ? Math.max(
            0,
            ((totalCustomers - newCustomers - returningCustomers) /
              totalCustomers) *
              100
          )
        : 0;

    const response = {
      totalCustomers,
      newCustomers,
      returningCustomers,
      customerGrowth: Math.round(customerGrowth * 10) / 10,
      averageLifetimeValue: Math.round(averageLifetimeValue * 100) / 100,
      churnRate: Math.round(churnRate * 10) / 10,
      topCustomers: topCustomers.map((customer) => ({
        id: customer.id,
        name: customer.name,
        totalSpent: Math.round((customer.totalSpent || 0) * 100) / 100,
        orderCount: customer.orderCount || 0,
        lastOrder: customer.lastOrder || new Date().toISOString(),
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Customer analytics error:", error);
    return NextResponse.json(
      { error: "Müşteri analitikleri alınırken hata oluştu" },
      { status: 500 }
    );
  }
}
