"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative overflow-hidden transition-all duration-300 hover:scale-105"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all duration-500 dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all duration-500 dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-36 animate-in slide-in-from-top-2 duration-200"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={`flex items-center gap-2 cursor-pointer transition-colors ${
            theme === "light" ? "bg-accent" : ""
          }`}
        >
          <Sun className="h-4 w-4" />
          <span>Açık Tema</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={`flex items-center gap-2 cursor-pointer transition-colors ${
            theme === "dark" ? "bg-accent" : ""
          }`}
        >
          <Moon className="h-4 w-4" />
          <span>Karanlık Tema</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={`flex items-center gap-2 cursor-pointer transition-colors ${
            theme === "system" ? "bg-accent" : ""
          }`}
        >
          <Monitor className="h-4 w-4" />
          <span>Sistem Teması</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
