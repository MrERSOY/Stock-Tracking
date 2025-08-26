"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Local toggle variants for this component
const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const ToggleGroupContext = React.createContext<{
  variant?: VariantProps<typeof toggleVariants>["variant"];
  size?: VariantProps<typeof toggleVariants>["size"];
  value?: string;
  onValueChange?: (value: string) => void;
}>({});

interface ToggleGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: VariantProps<typeof toggleVariants>["variant"];
  size?: VariantProps<typeof toggleVariants>["size"];
  value?: string;
  onValueChange?: (value: string) => void;
}

const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  (
    { className, variant, size, children, value, onValueChange, ...props },
    ref
  ) => (
    <div
      ref={ref}
      className={cn("flex items-center justify-center gap-1", className)}
      {...props}
    >
      <ToggleGroupContext.Provider
        value={{ variant, size, value, onValueChange }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </div>
  )
);

ToggleGroup.displayName = "ToggleGroup";

interface ToggleGroupItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: VariantProps<typeof toggleVariants>["variant"];
  size?: VariantProps<typeof toggleVariants>["size"];
  value: string;
}

const ToggleGroupItem = React.forwardRef<
  HTMLButtonElement,
  ToggleGroupItemProps
>(({ className, children, variant, size, value, onClick, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext);
  const isPressed = context.value === value;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    context.onValueChange?.(value);
    onClick?.(e);
  };

  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={isPressed}
      data-state={isPressed ? "on" : "off"}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
});

ToggleGroupItem.displayName = "ToggleGroupItem";

export { ToggleGroup, ToggleGroupItem };
