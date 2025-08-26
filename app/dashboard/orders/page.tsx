// app/dashboard/orders/page.tsx

import Link from "next/link";
import { db } from "@/db/drizzle";
import { order, orderItem, user, customer } from "@/db/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { eq } from "drizzle-orm";

// Tip tanımlamaları
type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";

interface OrderWithDetails {
  id: string;
  total: number;
  status: OrderStatus;
  createdAt: Date;
  userId: string;
  customerId: string | null;
  user: {
    name: string;
    email: string;
  } | null;
  customer: {
    name: string;
    phone: string | null;
    email: string | null;
  } | null;
  items: Array<{
    quantity: number;
  }>;
}

const getStatusBadgeVariant = (status: OrderStatus) => {
  switch (status) {
    case "PAID":
      return "bg-green-100 text-green-800 border-green-200 hover:bg-green-100";
    case "SHIPPED":
      return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-green-100";
    case "DELIVERED":
      return "bg-purple-100 text-purple-800 border-purple-200 hover:bg-green-100";
    case "CANCELLED":
      return "bg-red-100 text-red-800 border-red-200 hover:bg-green-100";
    default:
      return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-green-100";
  }
};

const statusLabels: { [key in OrderStatus]: string } = {
  PENDING: "Beklemede",
  PAID: "Ödendi",
  SHIPPED: "Kargolandı",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal Edildi",
};

export default async function OrdersPage() {
  // Siparişleri ve kullanıcı bilgilerini al
  const ordersWithUsers = await db
    .select({
      id: order.id,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      userId: order.userId,
      customerId: order.customerId,
      user: {
        name: user.name,
        email: user.email,
      },
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
      },
    })
    .from(order)
    .leftJoin(user, eq(order.userId, user.id))
    .leftJoin(customer, eq(order.customerId, customer.id))
    .orderBy(order.createdAt);

  // Her sipariş için öğe sayısını al
  const ordersWithDetails: OrderWithDetails[] = await Promise.all(
    ordersWithUsers.map(async (orderData) => {
      const items = await db
        .select({ quantity: orderItem.quantity })
        .from(orderItem)
        .where(eq(orderItem.orderId, orderData.id));

      return {
        ...orderData,
        userId: orderData.userId || "",
        status: (orderData.status as OrderStatus) || "PENDING",
        items,
      };
    })
  );

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Sipariş Yönetimi</h1>
        <p className="text-muted-foreground mt-2">
          Tüm mağaza içi ve online siparişleri buradan görüntüleyin ve yönetin.
        </p>
      </div>
      <div className="bg-card rounded-lg shadow-md border flex-grow overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-grow">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0">
              <TableRow>
                <TableHead className="w-[120px]">Sipariş ID</TableHead>
                <TableHead>Müşteri</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">Tutar</TableHead>
                <TableHead>
                  <span className="sr-only">Eylemler</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersWithDetails.length > 0 ? (
                ordersWithDetails.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {order.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-medium">
                          {order.customer?.name ||
                            order.user?.name ||
                            order.user?.email ||
                            "Bilinmeyen Müşteri"}
                        </div>
                        {order.customer?.phone && (
                          <div className="text-xs text-muted-foreground">
                            {order.customer.phone}
                          </div>
                        )}
                        {order.customer?.email && (
                          <div className="text-xs text-muted-foreground">
                            {order.customer.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusBadgeVariant(order.status)}
                      >
                        {statusLabels[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(order.total)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/orders/${order.id}`}>
                          Detayları Gör
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Henüz hiç sipariş oluşturulmamış.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
