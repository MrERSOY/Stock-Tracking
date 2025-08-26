// Dosya: app/api/products/[productId]/stock/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { product } from "@/db/schema";
import { getSession } from "@/lib/auth";

// Enhanced stock update schema
const stockUpdateSchema = z.object({
  stock: z
    .number()
    .int()
    .min(0, "Stok miktarı sıfır veya pozitif olmalıdır.")
    .optional(),
  adjustment: z
    .number()
    .int("Ayarlama değeri bir tam sayı olmalıdır.")
    .optional(),
  reason: z.string().min(1, "İşlem sebebi belirtilmelidir.").optional(),
  type: z.enum(["increase", "decrease", "set", "adjustment"]).optional(),
  reference: z.string().optional(),
  cost: z.number().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;

  try {
    // Session check
    const session = await getSession();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!productId) {
      return new NextResponse("Product ID is required", { status: 400 });
    }

    const body = await req.json();
    const validation = stockUpdateSchema.safeParse(body);
    if (!validation.success) {
      return new NextResponse(validation.error.message, { status: 400 });
    }

    const { stock, adjustment, reason, type, reference, cost } =
      validation.data;

    // Get current product information
    const existing = await db
      .select()
      .from(product)
      .where(eq(product.id, productId))
      .limit(1);

    if (existing.length === 0) {
      return new NextResponse("Product not found", { status: 404 });
    }

    const currentStock = existing[0].stock ?? 0;
    let newStock: number;

    // Calculate new stock based on the type of operation
    if (stock !== undefined) {
      // Direct stock setting
      newStock = stock;
    } else if (adjustment !== undefined) {
      // Stock adjustment (can be positive or negative)
      newStock = currentStock + adjustment;
    } else {
      return new NextResponse(
        "Either 'stock' or 'adjustment' must be provided",
        { status: 400 }
      );
    }

    // Ensure stock doesn't go below zero
    if (newStock < 0) {
      return new NextResponse("Stok miktarı sıfırın altına düşemez.", {
        status: 400,
      });
    }

    // Update stock in database
    const updatedArr = await db
      .update(product)
      .set({
        stock: newStock,
        updatedAt: new Date(),
      })
      .where(eq(product.id, productId))
      .returning();

    if (updatedArr.length === 0) {
      return new NextResponse("Product not found after update", {
        status: 404,
      });
    }

    const updatedProduct = updatedArr[0];

    // Log stock movement (in production, this would be saved to a movements table)
    const movementType =
      type || (newStock > currentStock ? "increase" : "decrease");
    const quantityChanged = Math.abs(newStock - currentStock);

    console.log("Stock Movement Log:", {
      productId,
      productName: updatedProduct.name,
      type: movementType,
      quantity: quantityChanged,
      previousStock: currentStock,
      newStock,
      reason: reason || "Manual adjustment",
      userId: session.user.id,
      timestamp: new Date(),
      reference,
      cost,
    });

    // Create response with additional movement information
    const response = {
      ...updatedProduct,
      stockMovement: {
        previousStock: currentStock,
        newStock,
        change: newStock - currentStock,
        type: movementType,
        reason: reason || "Manual adjustment",
        timestamp: new Date(),
        reference,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[STOCK_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Get stock information and recent movements
export async function GET(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;

  try {
    const session = await getSession();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!productId) {
      return new NextResponse("Product ID is required", { status: 400 });
    }

    // Get product with stock information
    const productData = await db
      .select()
      .from(product)
      .where(eq(product.id, productId))
      .limit(1);

    if (productData.length === 0) {
      return new NextResponse("Product not found", { status: 404 });
    }

    const productInfo = productData[0];

    // Calculate stock status
    const stockStatus = getStockStatus(productInfo.stock);
    const stockMetrics = calculateStockMetrics(productInfo);

    const response = {
      ...productInfo,
      stockStatus,
      stockMetrics,
      alerts: generateStockAlerts(productInfo),
      lastUpdated: new Date(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[STOCK_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Helper functions
function getStockStatus(stock: number) {
  if (stock === 0)
    return { level: "out-of-stock", color: "red", message: "Stokta Yok" };
  if (stock <= 5)
    return { level: "critical", color: "red", message: "Kritik Seviye" };
  if (stock <= 10)
    return { level: "low", color: "yellow", message: "Düşük Stok" };
  if (stock <= 20)
    return { level: "medium", color: "blue", message: "Orta Seviye" };
  return { level: "good", color: "green", message: "Yeterli Stok" };
}

function calculateStockMetrics(product: any) {
  const stockValue = product.stock * product.price;
  const daysOfStock = calculateDaysOfStock(product.stock); // Mock calculation

  return {
    totalValue: stockValue,
    daysOfStock,
    reorderPoint: 20, // Default reorder point
    minimumStock: 10, // Default minimum stock
    averageUsage: 2, // Mock daily usage
    lastMovement: new Date(), // Would come from movements table
  };
}

function calculateDaysOfStock(stock: number): number {
  // Mock calculation - in production, this would be based on historical usage
  const averageDailyUsage = 2;
  return Math.floor(stock / Math.max(averageDailyUsage, 1));
}

function generateStockAlerts(product: any) {
  const alerts = [];

  if (product.stock === 0) {
    alerts.push({
      type: "critical",
      message: `${product.name} stokta yok`,
      action: "Acil sipariş verin",
    });
  } else if (product.stock <= 5) {
    alerts.push({
      type: "critical",
      message: `${product.name} kritik stok seviyesinde (${product.stock} adet)`,
      action: "Hemen sipariş verin",
    });
  } else if (product.stock <= 10) {
    alerts.push({
      type: "warning",
      message: `${product.name} düşük stok seviyesinde (${product.stock} adet)`,
      action: "Sipariş planlaması yapın",
    });
  }

  return alerts;
}
