"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Popover = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const PopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
  }
>(({ className, children, asChild, ...props }, ref) => {
  if (asChild && React.isValidElement(children)) {
    // asChild durumunda sadece props'ları geçir
    const childProps = children.props as any;
    return React.cloneElement(children as React.ReactElement<any>, {
      ...props,
      className: cn(childProps.className, className),
    });
  }

  return (
    <button ref={ref} className={className} {...props}>
      {children}
    </button>
  );
});
PopoverTrigger.displayName = "PopoverTrigger";

interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, align = "center", sideOffset = 4, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
        className
      )}
      {...props}
    />
  )
);
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent };
