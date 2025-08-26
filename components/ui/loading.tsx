"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function LoadingSpinner({
  size = "md",
  className,
  text,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}

export function LoadingCard() {
  return (
    <div className="space-y-3">
      <LoadingSkeleton className="h-4 w-2/3" />
      <LoadingSkeleton className="h-4 w-1/2" />
      <LoadingSkeleton className="h-32 w-full" />
    </div>
  );
}

export function LoadingTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <LoadingSkeleton className="h-4 w-1/4" />
          <LoadingSkeleton className="h-4 w-1/4" />
          <LoadingSkeleton className="h-4 w-1/4" />
          <LoadingSkeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}
