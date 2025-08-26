"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductImage from "@/components/ProductImage";

interface ProductImageModalProps {
  src?: string;
  alt: string;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductImageModal({
  src,
  alt,
  productName,
  isOpen,
  onClose,
}: ProductImageModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="relative max-w-4xl max-h-[90vh] w-full mx-4 bg-card rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{productName}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Image */}
        <div className="p-6 flex items-center justify-center">
          <ProductImage
            src={src}
            alt={alt}
            width={600}
            height={600}
            className="max-w-full max-h-[60vh] object-contain rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
