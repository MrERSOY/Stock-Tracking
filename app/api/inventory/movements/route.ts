// app/api/inventory/movements/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { product } from "@/db/schema";
import { eq } from "drizzle-orm";

// Mock stock movements data (in production, this would come from a database table)
const mockStockMovements = [
  {
    id: "1",
    productId: "1",
    type: "increase" as const,
    quantity: 50,
    previousStock: 10,
    newStock: 60,
    reason: "Yeni stok girişi",
    timestamp: new Date(Date.now() - 86400000), // 1 day ago
    userId: "user1",
    cost: 2500,
    reference: "PO-2024-001",
  },
  {
    id: "2",
    productId: "1",
    type: "decrease" as const,
    quantity: 5,
    previousStock: 60,
    newStock: 55,
    reason: "Satış",
    timestamp: new Date(Date.now() - 43200000), // 12 hours ago
    userId: "user2",
    reference: "INV-2024-001",
  },
  {
    id: "3",
    productId: "2",
    type: "adjustment" as const,
    quantity: 3,
    previousStock: 15,
    newStock: 18,
    reason: "Stok sayım düzeltmesi",
    timestamp: new Date(Date.now() - 21600000), // 6 hours ago
    userId: "user1",
  },
  {
    id: "4",
    productId: "3",
    type: "return" as const,
    quantity: 2,
    previousStock: 8,
    newStock: 10,
    reason: "Müşteri iadesi",
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    userId: "user2",
    reference: "RET-2024-001",
  },
];

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let movements = mockStockMovements;

    // Filter by product if specified
    if (productId) {
      movements = movements.filter(
        (movement) => movement.productId === productId
      );
    }

    // Sort by timestamp (newest first)
    movements = movements.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );

    // Apply pagination
    const paginatedMovements = movements.slice(offset, offset + limit);

    return NextResponse.json({
      movements: paginatedMovements,
      total: movements.length,
      hasMore: offset + limit < movements.length,
    });
  } catch (error) {
    console.error("Stock movements fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock movements" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, type, quantity, reason, reference, cost } = body;

    if (!productId || !type || quantity === undefined || !reason) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get current product stock
    const productData = await db
      .select()
      .from(product)
      .where(eq(product.id, productId))
      .limit(1);

    if (productData.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const currentStock = productData[0].stock;
    let newStock = currentStock;

    // Calculate new stock based on movement type
    switch (type) {
      case "increase":
        newStock = currentStock + quantity;
        break;
      case "decrease":
        newStock = Math.max(0, currentStock - quantity);
        break;
      case "adjustment":
        newStock = Math.max(0, currentStock + quantity);
        break;
      case "sale":
        newStock = Math.max(0, currentStock - quantity);
        break;
      case "return":
        newStock = currentStock + quantity;
        break;
      default:
        return NextResponse.json(
          { error: "Invalid movement type" },
          { status: 400 }
        );
    }

    // Update product stock in database
    await db
      .update(product)
      .set({ stock: newStock })
      .where(eq(product.id, productId));

    // Create movement record (in production, save to movements table)
    const movement = {
      id: Date.now().toString(),
      productId,
      type,
      quantity,
      previousStock: currentStock,
      newStock,
      reason,
      timestamp: new Date(),
      userId: session.user.id!,
      cost,
      reference,
    };

    // In production, save movement to database
    // await db.insert(stockMovements).values(movement);

    return NextResponse.json({
      success: true,
      movement,
      previousStock: currentStock,
      newStock,
    });
  } catch (error) {
    console.error("Stock movement creation error:", error);
    return NextResponse.json(
      { error: "Failed to create stock movement" },
      { status: 500 }
    );
  }
}
