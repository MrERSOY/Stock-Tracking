// components/site-header.tsx
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "@/components/ui/user-nav";
import { ThemeSelector } from "@/components/theme-selector";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import { Store, Package, Github } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="flex h-[var(--header-height)] shrink-0 items-center gap-2 border-b px-4 lg:px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex w-full items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 p-1 rounded-lg bg-primary/10">
              <Store className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold text-primary">
                Mağaza Yönetimi
              </h1>
            </div>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-1 text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
            <Package className="h-4 w-4" />
            <span>Dashboard</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            asChild
            size="sm"
            className="hidden sm:flex hover:bg-muted/50"
          >
            <a
              href="https://github.com/MrERSOY/Dashboard-with-help"
              rel="noopener noreferrer"
              target="_blank"
              className="flex items-center gap-2"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </a>
          </Button>
          <ThemeSelector />
          <ModeToggle />
          <Separator orientation="vertical" className="mx-2 h-6" />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
