import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { order, customer } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { requireAuth, createErrorResponse } from "@/lib/auth-middleware";

// Types for invoice data
interface InvoiceItem {
  productId: string;
  quantity: number;
  price: number;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceType: string;
  orderId?: string | null;
  customerId?: string;
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  paymentMethod: string;
  status: string;
  issuedAt: Date;
  dueDate: Date;
  items: InvoiceItem[];
  userId: string;
}

// Fatura oluştur ve kaydet
export async function POST(request: NextRequest) {
  try {
    // Authentication required for creating invoices
    const { user: authUser } = await requireAuth(request);

    const body = await request.json();
    const { saleData, invoiceType = "e-arsiv" } = body;

    // Fatura numarası oluştur (Seri + Sıra)
    const invoiceNumber = await generateInvoiceNumber();

    // Fatura verilerini hazırla
    const invoiceData = {
      invoiceNumber,
      invoiceType, // e-fatura, e-arsiv, irsaliye
      orderId: null, // Satış tamamlandıktan sonra güncellenecek
      customerId: saleData.customerId,
      totalAmount: saleData.total,
      taxAmount: saleData.tax,
      discountAmount: saleData.discount || 0,
      paymentMethod: saleData.paymentMethod,
      status: "draft", // draft, issued, cancelled
      issuedAt: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün
      items: saleData.items,
      userId: authUser.id,
    };

    // Fatura verilerini kaydet (şimdilik memory'de, sonra database'e)
    const savedInvoice = await saveInvoiceData(invoiceData);

    return NextResponse.json({
      success: true,
      invoice: savedInvoice,
      message: "Fatura oluşturuldu",
    });
  } catch (error) {
    return createErrorResponse(error, "Fatura oluşturulamadı");
  }
}

// Fatura numarası oluştur
async function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, "0");

  // Bu ayki son fatura numarasını bul
  const lastInvoice = await db
    .select({ invoiceNumber: order.id })
    .from(order)
    .where(eq(order.status, "PAID"))
    .orderBy(order.createdAt)
    .limit(1);

  let sequence = 1;
  if (lastInvoice.length > 0) {
    // Basit sıra numarası - gerçek uygulamada daha karmaşık olabilir
    sequence =
      parseInt(lastInvoice[0].invoiceNumber.split("_").pop() || "0") + 1;
  }

  return `INV-${year}${month}-${String(sequence).padStart(4, "0")}`;
}

// Fatura verilerini kaydet (şimdilik basit, sonra database'e taşınacak)
async function saveInvoiceData(invoiceData: InvoiceData) {
  // Gerçek uygulamada ayrı bir invoice tablosu olacak
  return {
    ...invoiceData,
    id: `invoice_${Date.now()}`,
    createdAt: new Date(),
  };
}

// Faturaları listele
export async function GET(request: NextRequest) {
  try {
    // Authentication required for viewing invoices
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Satış verilerini getir (fatura olarak)
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
        invoiceNumber: order.id, // Geçici olarak order ID'yi kullan
        customerId: order.customerId,
        totalAmount: order.total,
        taxAmount: order.tax,
        discountAmount: order.discount,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt,
        status: order.status,
      })
      .from(order)
      .where(and(...conditions))
      .orderBy(order.createdAt);

    // Müşteri bilgilerini de getir
    const invoicesWithCustomers = await Promise.all(
      salesData.map(async (sale) => {
        if (sale.customerId) {
          const customerData = await db
            .select()
            .from(customer)
            .where(eq(customer.id, sale.customerId))
            .limit(1);

          return {
            ...sale,
            customer: customerData[0] || null,
          };
        }
        return {
          ...sale,
          customer: null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      invoices: invoicesWithCustomers,
    });
  } catch (error) {
    return createErrorResponse(error, "Faturalar getirilemedi");
  }
}
