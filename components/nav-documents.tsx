"use client";

import {
  IconDots,
  IconFolder,
  IconShare3,
  IconTrash,
  type Icon,
} from "@tabler/icons-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Sadece kullandığınız sidebar bileşenlerini import edin
// useSidebar hook'unu da kaldırdım çünkü sadece isMobile property'sini kullanıyorsunuz
// Bu da muhtemelen bir responsive kontrol için, onu da basit bir şekilde halledelim

export function NavDocuments({
  items,
}: {
  items: {
    name: string;
    url: string;
    icon: Icon;
  }[];
}) {
  // isMobile kontrolü için basit bir window width kontrol
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div className="group-data-[collapsible=icon]:hidden">
      <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
        Documents
      </div>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.name} className="group/menu-item relative">
            <a
              href={item.url}
              className="flex w-full items-center gap-2 px-2 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
            >
              <item.icon size={16} />
              <span>{item.name}</span>
            </a>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="absolute right-1 top-1.5 h-6 w-6 flex items-center justify-center rounded-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground opacity-0 group-hover/menu-item:opacity-100 data-[state=open]:bg-accent">
                  <IconDots size={16} />
                  <span className="sr-only">More</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-24 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem>
                  <IconFolder size={16} />
                  <span>Open</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <IconShare3 size={16} />
                  <span>Share</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <IconTrash size={16} />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        ))}
        <li>
          <button className="flex w-full items-center gap-2 px-2 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors">
            <IconDots size={16} className="text-muted-foreground" />
            <span>More</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
