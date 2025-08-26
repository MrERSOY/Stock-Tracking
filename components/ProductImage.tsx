"use client";

import Image from "next/image";
import { useState } from "react";

interface ProductImageProps {
  src?: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

// Yardımcı fonksiyon: Sadece izin verilen domainlerden gelen görselleri döndür
function getValidImageUrl(url?: string) {
  if (!url) return "/placeholder.png";
  if (url.startsWith("https://i.ibb.co/")) return url;
  if (url.startsWith("https://placehold.co/")) return url;
  return "/placeholder.png";
}

const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  width = 40,
  height = 40,
  className = "rounded object-cover",
}) => {
  const [imageError, setImageError] = useState(false);

  if (!src || imageError) {
    return (
      <div
        className="bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        Görsel Yok
      </div>
    );
  }

  return (
    <Image
      src={getValidImageUrl(src)}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setImageError(true)}
    />
  );
};

export default ProductImage;
