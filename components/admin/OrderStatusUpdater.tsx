"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: "PENDING", label: "Beklemede" },
  { value: "PAID", label: "Ödendi" },
  { value: "SHIPPED", label: "Kargolandı" },
  { value: "DELIVERED", label: "Teslim Edildi" },
  { value: "CANCELLED", label: "İptal Edildi" },
];

interface OrderStatusUpdaterProps {
  orderId: string;
  currentStatus: OrderStatus;
}

export function OrderStatusUpdater({
  orderId,
  currentStatus,
}: OrderStatusUpdaterProps) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async () => {
    if (status === currentStatus) {
      toast.info("Durum zaten güncel");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Durum güncellenemedi");
      }

      toast.success("Sipariş durumu başarıyla güncellendi");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Bir hata oluştu");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      <Select
        value={status}
        onValueChange={(value) => setStatus(value as OrderStatus)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Durum seçin" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        onClick={handleStatusUpdate}
        disabled={isUpdating || status === currentStatus}
        className="w-full"
      >
        {isUpdating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Güncelleniyor...
          </>
        ) : (
          "Durumu Güncelle"
        )}
      </Button>
    </div>
  );
}
