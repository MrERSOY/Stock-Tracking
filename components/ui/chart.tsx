"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    config: Record<
      string,
      {
        label?: string;
        color?: string;
      }
    >;
    children: React.ComponentProps<"div">["children"];
  }
>(({ children, className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("chart-container", className)} {...props}>
      {children}
    </div>
  );
});
ChartContainer.displayName = "ChartContainer";

const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    cursor?: boolean;
    content?: React.ComponentType<Record<string, unknown>>;
  }
>(({ children, className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("chart-tooltip", className)} {...props}>
      {children}
    </div>
  );
});
ChartTooltip.displayName = "ChartTooltip";

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    indicator?: string;
    labelFormatter?: (value: unknown) => string;
  }
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("chart-tooltip-content", className)}
      {...props}
    >
      {children}
    </div>
  );
});
ChartTooltipContent.displayName = "ChartTooltipContent";

export type ChartConfig = Record<
  string,
  {
    label?: string;
    color?: string;
  }
>;

export { ChartContainer, ChartTooltip, ChartTooltipContent };
