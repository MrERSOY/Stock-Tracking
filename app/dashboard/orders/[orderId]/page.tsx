import Link from "next/link";
import { db } from "@/db/drizzle";
import { notFound } from "next/navigation";
import { order, orderItem, product, user } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  User,
  Calendar,
  Truck,
  MapPin,
  Hash,
  ShoppingBag,
  Receipt,
  Download,
  Printer,
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { eq } from "drizzle-orm";
import { OrderStatusUpdater } from "@/components/admin/OrderStatusUpdater";
import { Invoice } from "@/components/invoice";

// Tip tanımlamaları
type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";

interface OrderWithDetails {
  id: string;
  total: number;
  status: OrderStatus;
  createdAt: Date;
  userId: string;
  paymentMethod: string;
  tax: number;
  discount: number;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    productId: string;
    product: {
      id: string;
      name: string;
      description: string | null;
      price: number;
      stock: number;
      images: string[] | null;
      barcode: string | null;
      createdAt: Date;
      updatedAt: Date;
      categoryId: string;
    };
  }>;
}

const getStatusBadgeVariant = (status: OrderStatus) => {
  switch (status) {
    case "PAID":
      return "bg-green-100 text-green-800 border-green-200 hover:bg-green-100";
    case "SHIPPED":
      return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100";
    case "DELIVERED":
      return "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100";
    case "CANCELLED":
      return "bg-red-100 text-red-800 border-red-200 hover:bg-red-100";
    default:
      return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100";
  }
};

const statusLabels: { [key in OrderStatus]: string } = {
  PENDING: "Beklemede",
  PAID: "Ödendi",
  SHIPPED: "Kargolandı",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal Edildi",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  // Önce siparişi bul
  const orderResult = await db
    .select({
      id: order.id,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      userId: order.userId,
      paymentMethod: order.paymentMethod,
      tax: order.tax,
      discount: order.discount,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
    .from(order)
    .leftJoin(user, eq(order.userId, user.id))
    .where(eq(order.id, orderId))
    .limit(1);

  if (orderResult.length === 0) {
    notFound();
  }

  const orderData = orderResult[0];

  // Sonra sipariş öğelerini bul
  const orderItems = await db
    .select({
      id: orderItem.id,
      quantity: orderItem.quantity,
      price: orderItem.price,
      productId: orderItem.productId,
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        images: product.images,
        barcode: product.barcode,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        categoryId: product.categoryId,
      },
    })
    .from(orderItem)
    .leftJoin(product, eq(orderItem.productId, product.id))
    .where(eq(orderItem.orderId, orderId));

  const orderWithDetails: OrderWithDetails = {
    ...orderData,
    userId: orderData.userId || "",
    status: (orderData.status as OrderStatus) || "PENDING",
    paymentMethod: orderData.paymentMethod || "card",
    tax: orderData.tax || 0,
    discount: orderData.discount || 0,
    user: orderData.user,
    items: orderItems.filter(
      (
        item
      ): item is typeof item & { product: NonNullable<typeof item.product> } =>
        item.product !== null
    ),
  };

  // Fatura için veri hazırla
  const invoiceData = {
    id: orderWithDetails.id,
    total: orderWithDetails.total,
    tax: orderWithDetails.tax || 0,
    discount: orderWithDetails.discount || 0,
    createdAt: orderWithDetails.createdAt,
    paymentMethod: orderWithDetails.paymentMethod,
    items: orderWithDetails.items.map((item) => ({
      id: item.id,
      name: item.product.name,
      price: item.price,
      quantity: item.quantity,
    })),
    customer: orderWithDetails.user
      ? {
          name: orderWithDetails.user.name,
          email: orderWithDetails.user.email,
        }
      : undefined,
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShoppingBag className="w-8 h-8" />
          Sipariş Detayları
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Fatura İndir
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-2" />
            Yazdır
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/orders">&larr; Tüm Siparişlere Dön</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Sipariş Edilen Ürünler</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ürün</TableHead>
                    <TableHead className="text-center">Miktar</TableHead>
                    <TableHead className="text-right">Birim Fiyat</TableHead>
                    <TableHead className="text-right">Ara Toplam</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderWithDetails.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.product.name}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.price * item.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Fatura Önizleme */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Fatura Önizleme
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Invoice order={invoiceData} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Sipariş Özeti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Hash className="w-4 h-4" /> Sipariş ID
                </span>
                <span className="font-mono text-xs">{orderWithDetails.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Sipariş Tarihi
                </span>
                <span className="font-medium">
                  {formatDateTime(orderWithDetails.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Truck className="w-4 h-4" /> Sipariş Durumu
                </span>
                <Badge
                  variant="outline"
                  className={getStatusBadgeVariant(orderWithDetails.status)}
                >
                  {statusLabels[orderWithDetails.status] ||
                    orderWithDetails.status}
                </Badge>
              </div>
              <div className="border-t pt-4 mt-4 flex justify-between text-xl font-bold">
                <span>Toplam Tutar</span>
                <span>{formatCurrency(orderWithDetails.total)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Durumu Güncelle</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderStatusUpdater
                orderId={orderWithDetails.id}
                currentStatus={orderWithDetails.status}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Müşteri Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">
                  {orderWithDetails.user?.name || "İsimsiz Kullanıcı"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {orderWithDetails.user?.email || "E-posta yok"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
