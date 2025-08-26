// app/api/inventory/reports/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { product } from "@/db/schema";
import { sql, desc, asc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("type") || "summary";

    // Get all products for calculations
    const products = await db.select().from(product);

    switch (reportType) {
      case "summary":
        return await generateSummaryReport(products);

      case "stock-levels":
        return await generateStockLevelsReport(products);

      case "valuation":
        return await generateValuationReport(products);

      case "abc-analysis":
        return await generateABCAnalysisReport(products);

      case "movement-summary":
        return await generateMovementSummaryReport(products);

      default:
        return NextResponse.json(
          { error: "Invalid report type" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}

async function generateSummaryReport(products: any[]) {
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const averageStockValue = totalValue / Math.max(totalProducts, 1);

  // Stock level categorization
  const inStock = products.filter((p) => p.stock > 10).length;
  const lowStock = products.filter((p) => p.stock > 5 && p.stock <= 10).length;
  const criticalStock = products.filter(
    (p) => p.stock > 0 && p.stock <= 5
  ).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;

  // Top products by value
  const topProductsByValue = products
    .map((p) => ({ ...p, totalValue: p.price * p.stock }))
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 10);

  // Low stock products
  const lowStockProducts = products
    .filter((p) => p.stock <= 10 && p.stock > 0)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 20);

  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalProducts,
      totalValue,
      averageStockValue,
      stockLevels: {
        inStock,
        lowStock,
        criticalStock,
        outOfStock,
      },
    },
    topProductsByValue,
    lowStockProducts,
    stockDistribution: {
      zeroStock: outOfStock,
      lowStock: lowStock,
      adequateStock: inStock,
      criticalStock: criticalStock,
    },
  };

  return NextResponse.json(report);
}

async function generateStockLevelsReport(products: any[]) {
  const stockLevels = products.map((product) => ({
    id: product.id,
    name: product.name,
    barcode: product.barcode,
    currentStock: product.stock,
    stockStatus: getStockStatus(product.stock),
    daysOfStock: calculateDaysOfStock(product.stock), // Mock calculation
    reorderRecommendation: getReorderRecommendation(product.stock),
    lastUpdated: new Date().toISOString(),
  }));

  const report = {
    generatedAt: new Date().toISOString(),
    type: "stock-levels",
    products: stockLevels,
    summary: {
      totalProducts: products.length,
      needsReorder: stockLevels.filter(
        (p) => p.reorderRecommendation !== "none"
      ).length,
      criticalItems: stockLevels.filter((p) => p.stockStatus === "critical")
        .length,
    },
  };

  return NextResponse.json(report);
}

async function generateValuationReport(products: any[]) {
  const valuationData = products.map((product) => ({
    id: product.id,
    name: product.name,
    stock: product.stock,
    unitPrice: product.price,
    totalValue: product.price * product.stock,
    percentageOfTotal: 0, // Will be calculated below
  }));

  const totalInventoryValue = valuationData.reduce(
    (sum, item) => sum + item.totalValue,
    0
  );

  // Calculate percentage of total for each item
  valuationData.forEach((item) => {
    item.percentageOfTotal =
      totalInventoryValue > 0
        ? (item.totalValue / totalInventoryValue) * 100
        : 0;
  });

  // Sort by total value descending
  valuationData.sort((a, b) => b.totalValue - a.totalValue);

  const report = {
    generatedAt: new Date().toISOString(),
    type: "valuation",
    totalInventoryValue,
    averageItemValue: totalInventoryValue / Math.max(products.length, 1),
    products: valuationData,
    summary: {
      totalItems: products.length,
      highValueItems: valuationData.filter((p) => p.totalValue > 1000).length,
      lowValueItems: valuationData.filter((p) => p.totalValue < 100).length,
    },
  };

  return NextResponse.json(report);
}

async function generateABCAnalysisReport(products: any[]) {
  // Calculate total value for ABC analysis
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  // Sort products by value (descending)
  const sortedProducts = products
    .map((p) => ({ ...p, totalValue: p.price * p.stock }))
    .sort((a, b) => b.totalValue - a.totalValue);

  // Calculate cumulative values and classify
  let cumulativeValue = 0;
  const classifiedProducts = sortedProducts.map((product, index) => {
    cumulativeValue += product.totalValue;
    const cumulativePercentage = (cumulativeValue / totalValue) * 100;

    let category: "A" | "B" | "C";
    if (cumulativePercentage <= 80) {
      category = "A";
    } else if (cumulativePercentage <= 95) {
      category = "B";
    } else {
      category = "C";
    }

    return {
      ...product,
      cumulativeValue,
      cumulativePercentage,
      category,
      rank: index + 1,
    };
  });

  const categoryA = classifiedProducts.filter((p) => p.category === "A");
  const categoryB = classifiedProducts.filter((p) => p.category === "B");
  const categoryC = classifiedProducts.filter((p) => p.category === "C");

  const report = {
    generatedAt: new Date().toISOString(),
    type: "abc-analysis",
    totalValue,
    products: classifiedProducts,
    analysis: {
      categoryA: {
        count: categoryA.length,
        percentage: (categoryA.length / products.length) * 100,
        valuePercentage: 80,
        totalValue: categoryA.reduce((sum, p) => sum + p.totalValue, 0),
      },
      categoryB: {
        count: categoryB.length,
        percentage: (categoryB.length / products.length) * 100,
        valuePercentage: 15,
        totalValue: categoryB.reduce((sum, p) => sum + p.totalValue, 0),
      },
      categoryC: {
        count: categoryC.length,
        percentage: (categoryC.length / products.length) * 100,
        valuePercentage: 5,
        totalValue: categoryC.reduce((sum, p) => sum + p.totalValue, 0),
      },
    },
  };

  return NextResponse.json(report);
}

async function generateMovementSummaryReport(products: any[]) {
  // Mock movement data (in production, this would come from actual movement records)
  const movements = products.map((product) => ({
    productId: product.id,
    productName: product.name,
    totalMovements: Math.floor(Math.random() * 50) + 1,
    totalIncrease: Math.floor(Math.random() * 100) + 10,
    totalDecrease: Math.floor(Math.random() * 80) + 5,
    lastMovement: new Date(
      Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
    ),
    currentStock: product.stock,
    averageMovementSize: Math.floor(Math.random() * 20) + 1,
    movementFrequency: Math.random() * 10 + 1, // movements per month
  }));

  // Sort by movement frequency
  movements.sort((a, b) => b.movementFrequency - a.movementFrequency);

  const fastMovingProducts = movements.slice(0, 10);
  const slowMovingProducts = movements.slice(-10).reverse();

  const report = {
    generatedAt: new Date().toISOString(),
    type: "movement-summary",
    totalProducts: products.length,
    fastMovingProducts,
    slowMovingProducts,
    summary: {
      totalMovements: movements.reduce((sum, m) => sum + m.totalMovements, 0),
      averageMovementFrequency:
        movements.reduce((sum, m) => sum + m.movementFrequency, 0) /
        movements.length,
      activeProducts: movements.filter((m) => m.movementFrequency > 2).length,
      dormantProducts: movements.filter((m) => m.movementFrequency < 0.5)
        .length,
    },
  };

  return NextResponse.json(report);
}

// Helper functions
function getStockStatus(stock: number): string {
  if (stock === 0) return "out-of-stock";
  if (stock <= 5) return "critical";
  if (stock <= 10) return "low";
  return "adequate";
}

function calculateDaysOfStock(stock: number): number {
  // Mock calculation - in production, this would be based on average daily usage
  const averageDailyUsage = 2; // Mock value
  return Math.floor(stock / Math.max(averageDailyUsage, 1));
}

function getReorderRecommendation(stock: number): string {
  if (stock === 0) return "urgent";
  if (stock <= 5) return "immediate";
  if (stock <= 10) return "soon";
  return "none";
}
