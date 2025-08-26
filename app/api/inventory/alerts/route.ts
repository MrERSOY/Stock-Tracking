// app/api/inventory/alerts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { product } from "@/db/schema";
import { lt, lte, eq, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const alertType = searchParams.get("type"); // critical, low, reorder, all
    const acknowledged = searchParams.get("acknowledged") === "true";

    // Get all products to analyze stock levels
    const products = await db.select().from(product);

    // Generate real-time alerts based on current stock levels
    const alerts = [];

    for (const prod of products) {
      const stockAlerts = generateProductAlerts(prod);
      alerts.push(...stockAlerts);
    }

    // Filter alerts based on type
    let filteredAlerts = alerts;
    if (alertType && alertType !== "all") {
      filteredAlerts = alerts.filter((alert) => alert.type === alertType);
    }

    // Sort by priority (critical first) and timestamp
    filteredAlerts.sort((a, b) => {
      const priorityOrder = { critical: 3, low: 2, reorder: 1, overstock: 0 };
      const aPriority =
        priorityOrder[a.type as keyof typeof priorityOrder] || 0;
      const bPriority =
        priorityOrder[b.type as keyof typeof priorityOrder] || 0;

      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Higher priority first
      }

      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    const summary = {
      total: filteredAlerts.length,
      critical: filteredAlerts.filter((a) => a.type === "critical").length,
      low: filteredAlerts.filter((a) => a.type === "low").length,
      reorder: filteredAlerts.filter((a) => a.type === "reorder").length,
      overstock: filteredAlerts.filter((a) => a.type === "overstock").length,
      unacknowledged: filteredAlerts.filter((a) => !a.acknowledged).length,
    };

    return NextResponse.json({
      alerts: filteredAlerts,
      summary,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Alerts fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { alertIds, action } = body; // action: 'acknowledge', 'dismiss'

    if (!alertIds || !Array.isArray(alertIds)) {
      return NextResponse.json(
        { error: "Alert IDs array is required" },
        { status: 400 }
      );
    }

    // In production, this would update the alerts in database
    // For now, we'll just return success
    console.log(`Alert action '${action}' performed on alerts:`, alertIds);

    return NextResponse.json({
      success: true,
      message: `${alertIds.length} alerts ${action}d successfully`,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Alert update error:", error);
    return NextResponse.json(
      { error: "Failed to update alerts" },
      { status: 500 }
    );
  }
}

// Generate alerts for a specific product
function generateProductAlerts(product: any) {
  const alerts = [];
  const now = new Date();

  // Critical stock alert (0-5 items)
  if (product.stock <= 5) {
    alerts.push({
      id: `critical-${product.id}-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      type: "critical",
      priority: "high",
      message:
        product.stock === 0
          ? `${product.name} stokta yok!`
          : `${product.name} kritik stok seviyesinde (${product.stock} adet kaldı)`,
      threshold: 5,
      currentStock: product.stock,
      timestamp: now,
      acknowledged: false,
      category: "stock-level",
      actions:
        product.stock === 0
          ? ["Acil sipariş ver", "Alternatif ürün bul"]
          : ["Hemen sipariş ver", "Stok girişi yap"],
      severity: product.stock === 0 ? "critical" : "high",
    });
  }

  // Low stock alert (6-15 items)
  else if (product.stock <= 15) {
    alerts.push({
      id: `low-${product.id}-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      type: "low",
      priority: "medium",
      message: `${product.name} düşük stok seviyesinde (${product.stock} adet)`,
      threshold: 15,
      currentStock: product.stock,
      timestamp: now,
      acknowledged: false,
      category: "stock-level",
      actions: ["Sipariş planla", "Stok kontrolü yap"],
      severity: "medium",
    });
  }

  // Reorder point alert (16-25 items)
  else if (product.stock <= 25) {
    alerts.push({
      id: `reorder-${product.id}-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      type: "reorder",
      priority: "low",
      message: `${product.name} yeniden sipariş noktasında (${product.stock} adet)`,
      threshold: 25,
      currentStock: product.stock,
      timestamp: now,
      acknowledged: false,
      category: "stock-level",
      actions: ["Sipariş hazırla", "Tedarikçi kontrol et"],
      severity: "low",
    });
  }

  // Overstock alert (very high stock)
  else if (product.stock > 200) {
    alerts.push({
      id: `overstock-${product.id}-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      type: "overstock",
      priority: "low",
      message: `${product.name} aşırı stok seviyesinde (${product.stock} adet)`,
      threshold: 200,
      currentStock: product.stock,
      timestamp: now,
      acknowledged: false,
      category: "stock-level",
      actions: ["Promosyon düzenle", "Tedarik planını gözden geçir"],
      severity: "info",
    });
  }

  // Price-based alerts
  if (product.price * product.stock > 50000) {
    // High value inventory
    alerts.push({
      id: `high-value-${product.id}-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      type: "high-value",
      priority: "medium",
      message: `${product.name} yüksek değerli envanter (${(
        product.price * product.stock
      ).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })})`,
      threshold: 50000,
      currentStock: product.stock,
      currentValue: product.price * product.stock,
      timestamp: now,
      acknowledged: false,
      category: "value-based",
      actions: ["Güvenlik önlemleri kontrol et", "Sigorta durumu gözden geçir"],
      severity: "info",
    });
  }

  return alerts;
}

// Get product-specific alerts
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productIds } = body;

    if (!productIds || !Array.isArray(productIds)) {
      return NextResponse.json(
        { error: "Product IDs array is required" },
        { status: 400 }
      );
    }

    // Get specific products
    const products = await db
      .select()
      .from(product)
      .where(sql`${product.id} = ANY(${productIds})`);

    const alerts = [];
    for (const prod of products) {
      const productAlerts = generateProductAlerts(prod);
      alerts.push(...productAlerts);
    }

    return NextResponse.json({
      alerts,
      productCount: products.length,
      alertCount: alerts.length,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Product alerts fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product alerts" },
      { status: 500 }
    );
  }
}
