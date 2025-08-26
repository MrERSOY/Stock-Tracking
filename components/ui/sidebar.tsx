// components/ui/sidebar.tsx
"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 gün

type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

export function SidebarProvider({
  defaultOpen = true,
  children,
  ...props
}: React.ComponentProps<"div"> & { defaultOpen?: boolean }) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);
  const [open, _setOpen] = React.useState(defaultOpen);

  const setOpen = React.useCallback((value: boolean) => {
    _setOpen(value);
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${value}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
  }, []);

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((v) => !v);
    } else {
      setOpen(!open);
    }
  }, [isMobile, open, setOpen, setOpenMobile]);

  const state = open ? "expanded" : "collapsed";

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          className={cn("group/sidebar-wrapper flex min-h-svh w-full")}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { state, openMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === "collapsed";
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <SheetPrimitive.Root open={openMobile} onOpenChange={setOpenMobile}>
        <SheetPrimitive.Content
          className={cn("bg-background p-0 border-r w-64 flex flex-col")}
        >
          {props.children}
          <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        </SheetPrimitive.Content>
      </SheetPrimitive.Root>
    );
  }

  return (
    <aside
      ref={ref}
      className={cn(
        "flex-col bg-background text-foreground p-4 space-y-2 hidden md:flex transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64",
        className
      )}
      {...props}
    />
  );
});
Sidebar.displayName = "Sidebar";

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isMobile } = useSidebar();
  const baseClass = isMobile
    ? "p-4"
    : "px-2 py-2 text-xl font-bold flex items-center gap-2";
  return <div ref={ref} className={cn(baseClass, className)} {...props} />;
});
SidebarHeader.displayName = "SidebarHeader";

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 mt-2 space-y-1", className)}
    {...props}
  />
));
SidebarContent.displayName = "SidebarContent";

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-auto pt-4 border-t border-border space-y-1", className)}
    {...props}
  />
));
SidebarFooter.displayName = "SidebarFooter";

export const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-2", className)} {...props} />
));
SidebarGroup.displayName = "SidebarGroup";

export const SidebarGroupLabel = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "px-3 text-xs font-semibold uppercase text-muted-foreground tracking-wider",
      className
    )}
    {...props}
  />
));
SidebarGroupLabel.displayName = "SidebarGroupLabel";

export const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-1", className)} {...props} />
));
SidebarGroupContent.displayName = "SidebarGroupContent";

export const SidebarMenu = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-1", className)} {...props} />
));
SidebarMenu.displayName = "SidebarMenu";

export const SidebarMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative flex items-center", className)}
    {...props}
  />
));
SidebarMenuItem.displayName = "SidebarMenuItem";

// DÜZELTME: SidebarMenuButton artık 'tooltip' prop'u alabiliyor.
export interface SidebarMenuButtonProps extends React.ComponentProps<"button"> {
  tooltip?: string;
  asChild?: boolean;
  children?: React.ReactNode;
}

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(({ className, tooltip, children, ...props }, ref) => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const buttonElement = (
    <Button
      ref={ref}
      variant="ghost"
      className={cn("w-full justify-start", className)}
      {...props}
    >
      {children}
    </Button>
  );

  if (isCollapsed && tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{buttonElement}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={5}>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return buttonElement;
});
SidebarMenuButton.displayName = "SidebarMenuButton";

export const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, ...props }, ref) => {
  const { toggleSidebar, state } = useSidebar();
  const isCollapsed = state === "collapsed";
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn("size-7", className)}
      onClick={toggleSidebar}
      {...props}
    >
      {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
});
SidebarTrigger.displayName = "SidebarTrigger";

export { Sidebar, SidebarHeader, SidebarContent, SidebarFooter };
