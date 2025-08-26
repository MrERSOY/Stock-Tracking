import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { customer, order } from "@/db/schema";
import { eq, or, ilike, sql, count, sum } from "drizzle-orm";
import { requireAuth, createErrorResponse } from "@/lib/auth-middleware";

// Customer interface
interface CustomerData {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

// Create new customer
export async function POST(request: NextRequest) {
  try {
    // Authentication required for creating customers
    await requireAuth(request);

    const body = await request.json();
    const { name, phone, email, address }: CustomerData = body;

    // Validation
    if (!name || !phone) {
      return NextResponse.json(
        { error: "İsim ve telefon zorunludur" },
        { status: 400 }
      );
    }

    // Check if customer already exists with this phone
    const existingCustomer = await db
      .select()
      .from(customer)
      .where(eq(customer.phone, phone))
      .limit(1);

    if (existingCustomer.length > 0) {
      return NextResponse.json(
        { error: "Bu telefon numarası ile zaten bir müşteri kayıtlı" },
        { status: 409 }
      );
    }

    // Create customer
    const newCustomer = await db
      .insert(customer)
      .values({
        id: `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        phone,
        email: email || null,
        address: address || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      customer: newCustomer[0],
      message: "Müşteri başarıyla oluşturuldu",
    });
  } catch (error) {
    return createErrorResponse(error, "Müşteri oluşturulamadı");
  }
}

// Search customers
export async function GET(request: NextRequest) {
  try {
    // Authentication required for viewing customers
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "20");

    let customers;

    if (query && query.length >= 2) {
      // Search by name or phone
      customers = await db
        .select()
        .from(customer)
        .where(
          or(
            ilike(customer.name, `%${query}%`),
            ilike(customer.phone, `%${query}%`)
          )
        )
        .limit(limit)
        .orderBy(customer.createdAt);
    } else {
      // Get recent customers
      customers = await db
        .select()
        .from(customer)
        .limit(limit)
        .orderBy(customer.createdAt);
    }

    // Get customer stats (total orders, total spent)
    const customersWithStats = await Promise.all(
      customers.map(async (cust) => {
        const orderStats = await db
          .select({
            totalOrders: count(),
            totalSpent: sum(order.total),
          })
          .from(order)
          .where(eq(order.customerId, cust.id));

        const stats = orderStats[0] || { totalOrders: 0, totalSpent: 0 };

        return {
          ...cust,
          totalOrders: Number(stats.totalOrders) || 0,
          totalSpent: Number(stats.totalSpent) || 0,
          frequentBuyer: Number(stats.totalOrders) >= 5, // 5+ orders = frequent buyer
        };
      })
    );

    return NextResponse.json({
      success: true,
      customers: customersWithStats,
    });
  } catch (error) {
    return createErrorResponse(error, "Müşteriler getirilemedi");
  }
}
